import { db } from '@/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: any;
  lastSeen?: any;
  isOnline?: boolean;
}

// Get user by email
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(emailQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    return {
      uid: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      lastSeen: userData.lastSeen,
      isOnline: userData.isOnline || false
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Get user by UID
export const getUserByUid = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      uid: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      lastSeen: userData.lastSeen,
      isOnline: userData.isOnline || false
    };
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
};

// Search users by name or email
export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const nameQuery = query(
      usersRef, 
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff')
    );
    
    const snapshot = await getDocs(nameQuery);
    const users: UserProfile[] = [];
    
    snapshot.docs.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        createdAt: userData.createdAt,
        lastSeen: userData.lastSeen,
        isOnline: userData.isOnline || false
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};