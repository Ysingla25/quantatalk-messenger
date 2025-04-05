// src/components/contacts/ContactImport.tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ContactService } from '@/services/contactService';
import { useState } from 'react';
import { Checkbox } from '@radix-ui/react-checkbox';

export const ContactImport = () => {
  const { toast } = useToast();
  const contactService = ContactService.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const importContacts = async () => {
    try {
      setIsLoading(true);
      const importedContacts = await contactService.importGoogleContacts();
      setContacts(importedContacts);
      toast({
        title: "Success",
        description: "Contacts imported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import contacts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    importContacts();
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleImportClick}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Import Contacts
      </Button>

      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={contact.photoUrl || '/default-avatar.png'}
                  alt={contact.name}
                  className="h-8 w-8 rounded-full"
                />
                <span>{contact.name}</span>
              </div>
              <Checkbox
                checked={selectedContacts.includes(contact.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedContacts([...selectedContacts, contact.id]);
                  } else {
                    setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};