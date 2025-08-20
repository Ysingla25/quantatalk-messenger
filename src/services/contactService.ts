import { auth, db } from '@/firebaseConfig';
import { collection, doc, addDoc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Contact } from '@/types/contacts';

// Add a new contact to Firestore
export const addContactToFirestore = async (
  userId: string, 
  contactData: Omit<Contact, 'id' | 'createdAt'>
): Promise<Contact> => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated or unauthorized');
  }

  try {
    // Check if contact with this email already exists
    const contactsRef = collection(db, `users/${userId}/contacts`);
    const emailQuery = query(contactsRef, where('email', '==', contactData.email.toLowerCase()));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      throw new Error('A contact with this email already exists');
    }

    // Add the new contact
    const newContact = {
      ...contactData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(contactsRef, newContact);
    
    return {
      id: docRef.id,
      ...contactData,
      createdAt: new Date()
    } as Contact;
    
  } catch (error) {
    console.error('Error adding contact:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      throw error;
    }
    throw new Error('Failed to add contact');
  }
};

// Check if a contact exists by email
export const checkContactExists = async (userId: string, email: string): Promise<boolean> => {
  try {
    const contactsRef = collection(db, `users/${userId}/contacts`);
    const emailQuery = query(contactsRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(emailQuery);
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking contact existence:', error);
    return false;
  }
};

// Get contact by email
export const getContactByEmail = async (userId: string, email: string): Promise<Contact | null> => {
  try {
    const contactsRef = collection(db, `users/${userId}/contacts`);
    const emailQuery = query(contactsRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(emailQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Contact;
  } catch (error) {
    console.error('Error getting contact by email:', error);
    return null;
  }
};

// Delete a contact
export const deleteContact = async (userId: string, contactId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated or unauthorized');
  }

  try {
    const contactRef = doc(db, `users/${userId}/contacts`, contactId);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Failed to delete contact');
  }
};
