// src/services/googleContactService.ts
import { getAuth, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { google } from 'googleapis';

export class GoogleContactsService {
  private static instance: GoogleContactsService;
  private auth: any;
  
  private constructor() {
    this.auth = getAuth();
  }
  
  static getInstance(): GoogleContactsService {
    if (!GoogleContactsService.instance) {
      GoogleContactsService.instance = new GoogleContactsService();
    }
    return GoogleContactsService.instance;
  }

  async fetchGoogleContacts(): Promise<any[]> {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the Google OAuth token
      const tokenResult = await user.getIdTokenResult();
      const idToken = tokenResult.token;

      // Initialize Google API client with the token
      const people = google.people({
        version: 'v1',
        auth: idToken
      });

      const res = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,photos'
      });

      return res.data.connections.map((contact: any) => ({
        id: contact.resourceName,
        name: contact.names?.[0]?.displayName,
        emails: contact.emailAddresses?.map((email: any) => email.value),
        photoUrl: contact.photos?.[0]?.url
      }));
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
      throw error;
    }
  }
}