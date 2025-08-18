import { db } from '@/firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export interface ChatSession {
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  createdAt: Date;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
}

export class ChatService {
  private static instance: ChatService;
  
  private constructor() {}
  
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getOrCreateDirectChat(userId1: string, userId2: string): Promise<string> {
    // Sort user IDs to ensure consistent chat ID
    const participants = [userId1, userId2].sort();
    
    // Check if chat already exists
    const existingChat = await this.findExistingChat(participants);
    if (existingChat) {
      return existingChat.id;
    }
    
    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants,
      type: 'direct',
      createdAt: new Date(),
      lastMessage: null
    });
    
    return chatRef.id;
  }

  private async findExistingChat(participants: string[]): Promise<ChatSession | null> {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('type', '==', 'direct'),
      where('participants', '==', participants)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as ChatSession;
    }
    
    return null;
  }

  async getUserChats(userId: string): Promise<ChatSession[]> {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatSession[];
  }

  async getChatById(chatId: string): Promise<ChatSession | null> {
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (chatDoc.exists()) {
      return {
        id: chatDoc.id,
        ...chatDoc.data()
      } as ChatSession;
    }
    return null;
  }
}
