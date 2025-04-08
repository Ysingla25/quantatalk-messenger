// src/services/contactService.ts
import { auth, db } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';

export class ContactService {
  private static instance: ContactService;
  private readonly GOOGLE_CONTACTS_API_URL = 'https://people.googleapis.com/v1/people/me/connections';
  
  private constructor() {}

  static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  async addContact(userId: string, contactData: any): Promise<void> {
    try {
      // Add the contact to Firestore
      const contactRef = doc(db, 'Contacts', userId, 'contacts', contactData.id);
      await setDoc(contactRef, {
        ...contactData,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }
  
  async importGoogleContacts(): Promise<any[]> {
    try {
      // First, get Google credentials
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('No access token received');
      }

      // Fetch contacts using Google People API
      const response = await axios.get(this.GOOGLE_CONTACTS_API_URL, {
        params: {
          personFields: 'names,emailAddresses,photos',
          pageSize: 2000 // Adjust based on your needs
        },
        headers: {
          Authorization: `Bearer ${credential.accessToken}`
        }
      });

      return response.data.connections.map(contact => ({
        id: contact.resourceName,
        name: contact.names?.[0]?.displayName,
        email: contact.emailAddresses?.[0]?.value,
        photoUrl: contact.photos?.[0]?.url
      }));
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  }
}
