// src/components/contacts/ContactImport.tsx
import React, { useState } from 'react';
import { GoogleContactsService } from '../../services/googleContactService';
import { ContactService } from '../../services/contactService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/firebaseConfig';
import { Checkbox } from '@radix-ui/react-checkbox';

export const ContactImport: React.FC = () => {
  const { toast } = useToast();
  const [googleContacts, setGoogleContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const googleContactsService = GoogleContactsService.getInstance();
  const contactService = ContactService.getInstance();

  const handleImportGoogleContacts = async () => {
    try {
      setLoading(true);
      const contacts = await googleContactsService.fetchGoogleContacts();
      setGoogleContacts(contacts);
      toast({
        title: "Success",
        description: "Contacts fetched successfully"
      });
    } catch (error) {
      console.error('Error importing Google contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId) 
        : [...prev, contactId]
    );
  };

  const handleAddSelectedContacts = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive"
      });
      return;
    }

    const selectedGoogleContacts = googleContacts.filter(
      contact => selectedContacts.includes(contact.id)
    );

    try {
      setLoading(true);
      for (const contact of selectedGoogleContacts) {
        await contactService.addContact(user.uid, {
          id: contact.id,
          name: contact.name,
          email: contact.emails?.[0],
          avatar: contact.photoUrl,
          source: 'google',
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
      
      toast({
        title: "Success",
        description: "Contacts added successfully"
      });
      setSelectedContacts([]); // Clear selection after adding
    } catch (error) {
      console.error('Error adding contacts:', error);
      toast({
        title: "Error",
        description: "Failed to add contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Import Contacts</h2>
        <Button 
          onClick={handleImportGoogleContacts}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span>Import from Google</span>
          )}
        </Button>
      </div>

      {googleContacts.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleContacts.map((contact) => (
              <div 
                key={contact.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleSelectContact(contact.id)}
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={contact.photoUrl || '/default-avatar.png'} 
                    alt={contact.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{contact.name}</h3>
                    {contact.emails && (
                      <p className="text-sm text-muted-foreground">
                        {contact.emails[0]}
                      </p>
                    )}
                  </div>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => 
                      handleSelectContact(contact.id)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {selectedContacts.length > 0 && (
            <Button 
              onClick={handleAddSelectedContacts}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span>Add {selectedContacts.length} Selected Contacts</span>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};