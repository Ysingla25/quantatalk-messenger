// src/services/saveContactsToFirestore.ts
import { auth, db } from '@/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Save contacts to Firestore under the user's contacts subcollection
export const saveContactsToFirestore = async (userId: string, contacts: any[]) => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated or unauthorized');
  }
  try {
    const contactsRef = collection(db, `users/${userId}/contacts`);
    for (const contact of contacts) {
      await addDoc(contactsRef, {
        name: contact.names?.[0]?.displayName || 'Unknown',
        email: contact.emailAddresses?.[0]?.value || '',
        avatar: contact.photos?.[0]?.url || '',
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving contacts:', error);
    throw error;
  }
};
