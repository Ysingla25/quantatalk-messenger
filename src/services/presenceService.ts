import { db } from '@/firebaseConfig';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, query, where } from 'firebase/firestore';

export class PresenceService {
  private static instance: PresenceService;
  private presenceListeners: Map<string, () => void> = new Map();
  private lastStatus: Map<string, 'online' | 'offline'> = new Map();

  private constructor() {}

  static getInstance(): PresenceService {
    if (!PresenceService.instance) {
      PresenceService.instance = new PresenceService();
    }
    return PresenceService.instance;
  }

  // Set user online status
  async setUserOnline(userId: string): Promise<void> {
    try {
      if (this.lastStatus.get(userId) === 'online') return;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
      });
      this.lastStatus.set(userId, 'online');
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  }

  // Set user offline status
  async setUserOffline(userId: string): Promise<void> {
    try {
      if (this.lastStatus.get(userId) === 'offline') return;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
      });
      this.lastStatus.set(userId, 'offline');
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  // Listen to user's online status
  subscribeToUserPresence(userId: string, callback: (isOnline: boolean) => void): () => void {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        callback(userData.isOnline || false);
      } else {
        callback(false);
      }
    });

    // Store the unsubscribe function
    this.presenceListeners.set(userId, unsubscribe);
    
    return unsubscribe;
  }

  // Listen to multiple users' online status
  subscribeToMultipleUsersPresence(userIds: string[], callback: (presenceMap: Map<string, boolean>) => void): () => void {
    if (userIds.length === 0) {
      return () => {};
    }

    // Firestore 'in' queries are limited to 10 items, so we need to batch them
    const batchSize = 10;
    const unsubscribeFunctions: (() => void)[] = [];
    const presenceMap = new Map<string, boolean>();

    // Process userIds in batches
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', batch));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Update presence map with this batch
        snapshot.docs.forEach(doc => {
          const userData = doc.data();
          presenceMap.set(doc.id, userData.isOnline || false);
        });
        
        // Set offline for users not found in this batch
        batch.forEach(userId => {
          if (!snapshot.docs.find(doc => doc.id === userId)) {
            presenceMap.set(userId, false);
          }
        });
        
        // Call callback with updated presence map
        callback(new Map(presenceMap));
      });

      unsubscribeFunctions.push(unsubscribe);
    }

    // Return a function that unsubscribes from all batches
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  // Clean up listeners
  unsubscribeFromUserPresence(userId: string): void {
    const unsubscribe = this.presenceListeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.presenceListeners.delete(userId);
    }
  }

  // Clean up all listeners
  unsubscribeAll(): void {
    this.presenceListeners.forEach(unsubscribe => unsubscribe());
    this.presenceListeners.clear();
  }

  // Initialize presence for a user (call when user logs in)
  async initializePresence(userId: string): Promise<() => void> {
    await this.setUserOnline(userId);

    let visibilityLocked = false;

    // Set up beforeunload listener to set user offline when they leave
    const handleBeforeUnload = () => {
      // Fire and forget; reliability is acceptable here
      this.setUserOffline(userId);
    };

    // Set up visibility change listener with lock to prevent thrashing
    const handleVisibilityChange = () => {
      if (visibilityLocked) return;
      visibilityLocked = true;
      Promise.resolve().then(async () => {
        try {
          if (document.hidden) {
            await this.setUserOffline(userId);
          } else {
            await this.setUserOnline(userId);
          }
        } finally {
          visibilityLocked = false;
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      this.setUserOffline(userId);
    };
  }
}

// Export a convenience function for setting user status
export const setUserStatus = async (userId: string, status: 'online' | 'offline'): Promise<void> => {
  const presenceService = PresenceService.getInstance();
  if (status === 'online') {
    await presenceService.setUserOnline(userId);
  } else {
    await presenceService.setUserOffline(userId);
  }
};