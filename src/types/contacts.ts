export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userId?: string;
  isOnline?: boolean; // <-- Add this property
}
