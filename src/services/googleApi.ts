// src/services/googleApi.ts
import { google } from 'googleapis';

export const SCOPES = [
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  process.env.VITE_GOOGLE_REDIRECT_URI
);

export async function getGoogleAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  return authUrl;
}

export async function fetchContacts(accessToken: string) {
  const people = google.people({
    version: 'v1',
    auth: accessToken
  });

  const res = await people.people.connections.list({
    resourceName: 'people/me',
    pageSize: 2000,
    personFields: 'names,emailAddresses,phoneNumbers,photos'
  });

  return res.data.connections || [];
}