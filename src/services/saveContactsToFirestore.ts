// src/services/saveContactsToFirestore.ts
import { auth, db } from '@/firebaseConfig';
import { collection, getDocs, writeBatch, doc, serverTimestamp, query, where, documentId } from 'firebase/firestore';
import { Contact } from '@/types/contacts';
import { getUserByEmail } from './userService';

// Save contacts to Firestore under the user's contacts subcollection
export const saveContactsToFirestore = async (userId: string, contacts: any[]): Promise<number> => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated or unauthorized');
  }
  
  try {
    const contactsRef = collection(db, `users/${userId}/contacts`);
    
    // Get existing contacts to avoid duplicates
    const snapshot = await getDocs(contactsRef);
    const existingEmails = new Set(snapshot.docs.map(doc => doc.data().email));
    
    // Process contacts to match our Contact interface
    const contactsToSave: Contact[] = contacts
      .filter(contact => {
        const email = contact.emailAddresses?.[0]?.value || contact.email;
        return email && !existingEmails.has(email);
      })
      .map(contact => ({
        name: contact.names?.[0]?.displayName || contact.name || 'Unknown',
        email: contact.emailAddresses?.[0]?.value || contact.email,
        avatar: contact.photos?.[0]?.url || contact.avatar || '',
        userId: userId,
        createdAt: serverTimestamp()
      }));

    // Save new contacts using batch operation
    const batch = writeBatch(db);
    contactsToSave.forEach(contact => {
      const docRef = doc(contactsRef);
      batch.set(docRef, contact);
    });
    
    await batch.commit();
    return contactsToSave.length; // Return number of new contacts added
    
  } catch (error) {
    console.error('Error saving contacts:', error);
    throw new Error('Failed to save contacts');
  }
};

// Function to get all contacts for a user
export const getUserContacts = async (userId: string): Promise<Contact[]> => {
  try {
    const contactsRef = collection(db, `users/${userId}/contacts`);
    const snapshot = await getDocs(contactsRef);
    
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Contact[];

    // Get online status for each contact
    const contactsWithStatus = await Promise.all(
      contacts.map(async (contact) => {
        try {
          // Get the user data to check online status
          const user = await getUserByEmail(contact.email);
          return {
            ...contact,
            isOnline: user?.isOnline || false,
            userId: user?.uid || contact.userId
          };
        } catch (error) {
          console.error(`Error getting status for contact ${contact.email}:`, error);
          return {
            ...contact,
            isOnline: false
          };
        }
      })
    );

    return contactsWithStatus;
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw new Error('Failed to load contacts');
  }
};
