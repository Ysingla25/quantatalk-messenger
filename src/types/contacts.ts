export interface Contact {
  id?: string;  // Optional because new contacts might not have an ID yet
  name: string;
  email: string;
  avatar: string;
  userId: string;
  createdAt?: any;
}
