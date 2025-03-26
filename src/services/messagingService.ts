import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const db = getFirestore();

export interface Message {
  id?: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  chatId: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: Message;
}

export class MessagingService {
  private static instance: MessagingService;
  private constructor() {}

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'messages'), {
      content,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      timestamp: Timestamp.now(),
      chatId,
    });
  }

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    });

    return unsubscribe;
  }

  async createChat(participants: string[], name?: string): Promise<Chat> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const chatRef = await addDoc(collection(db, 'chats'), {
      type: participants.length === 2 ? 'direct' : 'group',
      participants,
      name,
      lastMessage: null,
      createdAt: Timestamp.now(),
    });

    return {
      id: chatRef.id,
      type: participants.length === 2 ? 'direct' : 'group',
      participants,
      name,
    };
  }
}
