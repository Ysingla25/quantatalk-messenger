import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import { Contact } from '@/types/contacts';
import { getUserByEmail } from '@/services/userService';

interface StartChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (contact: Contact) => void;
  userId: string;
  existingContacts: Contact[];
}

export default function StartChatDialog({ 
  isOpen, 
  onClose, 
  onStartChat, 
  userId,
  existingContacts 
}: StartChatDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const query = searchQuery.trim().toLowerCase();
      
      // First, search in existing contacts
      const existingMatches = existingContacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
      );

      // If it looks like an email, try to find the user in the system
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let systemUser: Contact | null = null;
      
      if (emailRegex.test(query)) {
        try {
          const user = await getUserByEmail(query);
          if (user && user.uid !== userId) {
            systemUser = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Unknown User',
              email: user.email || query,
              avatar: user.photoURL || '',
              userId: user.uid
            };
          }
        } catch (error) {
          // User not found in system, that's okay
        }
      }

      // Combine results, avoiding duplicates
      const allResults = [...existingMatches];
      if (systemUser && !existingMatches.find(c => c.email === systemUser!.email)) {
        allResults.push(systemUser);
      }

      setSearchResults(allResults);
      
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error",
        description: "Failed to search for contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (contact: Contact) => {
    try {
      const user = await getUserByEmail(contact.email);
      if (!user) {
        toast({
          title: "User not found",
          description: "This contact hasn't signed up yet.",
          variant: "destructive",
        });
        return;
      }

      if (user.uid === userId) {
        toast({
          title: "Cannot chat with yourself",
          description: "Please choose another contact.",
          variant: "destructive",
        });
        return;
      }

      const resolvedContact: Contact = {
        id: user.uid,
        name: user.displayName || contact.name || contact.email.split('@')[0],
        email: user.email || contact.email,
        avatar: user.photoURL || contact.avatar || '',
        userId: user.uid
      };

      onStartChat(resolvedContact);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const renderSearchResults = () => {
    if (searching) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Searching...</span>
        </div>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim()) {
      return (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-muted-foreground">No contacts found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try searching with a different name or email
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {searchResults.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            onClick={() => handleStartChat(contact)}
          >
            <img
              src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`}
              alt={contact.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
              <p className="text-sm text-gray-500 truncate">{contact.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Search for a contact to start a new conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Contacts</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder="Enter name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={searching}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                size="icon"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {renderSearchResults()}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
