import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { Contact } from '@/types/contacts';
import { addContactToFirestore } from '@/services/contactService';
import { getGoogleContacts } from '@/services/googleContacts';
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (contact: Contact) => void;
  userId: string;
}

export default function AddContactDialog({ 
  isOpen, 
  onClose, 
  onContactAdded, 
  userId 
}: AddContactDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [googleContacts, setGoogleContacts] = useState<{ name: string; email: string }[] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const newContact: Omit<Contact, 'id' | 'createdAt'> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        avatar: formData.avatar.trim() || '',
        userId: userId
      };

      const savedContact = await addContactToFirestore(userId, newContact);
      
      toast({
        title: "Success",
        description: `Contact "${formData.name}" has been added successfully.`,
      });

      onContactAdded(savedContact);
      handleClose();
      
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', avatar: '' });
    setGoogleContacts(null);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleImportFromGoogle = async () => {
    try {
      setImportLoading(true);

      // Trigger Google consent to ensure we have a fresh access token with contacts scope
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Missing Google access token.');
      }

      const contacts = await getGoogleContacts(accessToken);

      if (!contacts || contacts.length === 0) {
        toast({
          title: 'No contacts found',
          description: 'Your Google account has no available contacts to import.',
        });
        setGoogleContacts([]);
        return;
      }

      setGoogleContacts(contacts);
      toast({
        title: 'Contacts loaded',
        description: 'Select a contact below to fill the form.',
      });
    } catch (err: any) {
      console.error('Google contacts import error:', err);
      toast({
        title: 'Google Import Failed',
        description: err?.message || 'Unable to import contacts from Google.',
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handlePickContact = (c: { name: string; email: string }) => {
    setFormData(prev => ({ ...prev, name: c.name || prev.name, email: c.email || prev.email }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Contact
          </DialogTitle>
          <DialogDescription>
            Enter the contact's information to add them to your contacts list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">You can fill manually or import from Google.</span>
          <Button type="button" variant="secondary" onClick={handleImportFromGoogle} disabled={importLoading || loading}>
            {importLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
              </>
            ) : (
              'Import from Google'
            )}
          </Button>
        </div>

        {googleContacts && (
          <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-1">
            {googleContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts available.</p>
            ) : (
              googleContacts.slice(0, 50).map((c, idx) => (
                <button
                  key={`${c.email}-${idx}`}
                  type="button"
                  onClick={() => handlePickContact(c)}
                  className="w-full text-left px-2 py-1 rounded hover:bg-accent"
                >
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.email}</div>
                </button>
              ))
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter contact name"
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL (Optional)</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar}
              onChange={handleInputChange('avatar')}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a generated avatar based on the name.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.email.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}