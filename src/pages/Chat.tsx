import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import UserAvatar from '@/components/ui/UserAvatar';
import DirectChat from '@/components/messages/DirectChat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { MessagingService } from '@/services/messagingService';
import { useGoogleLogin } from '@react-oauth/google';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { saveContactsToFirestore, getUserContacts } from '../services/saveContactsToFirestore';
import { Contact } from '@/types/contacts';
import { useAuth } from '@/contexts/AuthContext';

type ChatType = 'direct' | 'group';

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ChatType>('direct');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContactImportOpen, setIsContactImportOpen] = useState(false);
  const [importedContacts, setImportedContacts] = useState<any[]>([]);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const messagingService = MessagingService.getInstance();

  const fetchUserContacts = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const contacts = await getUserContacts(currentUser.uid);
      setUserContacts(contacts);
      setError(null);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts');
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserContacts();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleContactImport = async (token: string) => {
    if (!currentUser) return;
    
    try {
      // Fetch Google contacts using the token
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      const contacts = data.connections || [];
      
      if (contacts.length > 0) {
        setImportedContacts(contacts);
        setIsContactImportOpen(true);
      } else {
        toast({
          title: "No contacts found",
          description: "No contacts were found in your Google account.",
        });
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Error",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmAndSaveContacts = async () => {
    if (!currentUser || importedContacts.length === 0) return;

    try {
      setLoading(true);
      const count = await saveContactsToFirestore(currentUser.uid, importedContacts);
      
      // Refresh the contacts list
      await fetchUserContacts();
      
      setImportedContacts([]);
      setIsContactImportOpen(false);

      toast({
        title: "Success",
        description: `Successfully added ${count} new contacts.`,
      });
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast({
        title: "Error",
        description: "Failed to save contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContacts = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (userContacts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No contacts yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Import your Google contacts to start chatting
          </p>
          <Button 
            onClick={() => googleLogin()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Import Google Contacts
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {userContacts.map(contact => (
          <div 
            key={contact.id}
            className={`flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
              selectedContact?.id === contact.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedContact(contact)}
          >
            <img
              src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`}
              alt={contact.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
              <p className="text-sm text-gray-500 truncate">{contact.email}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        
        if (!accessToken) {
          throw new Error('No access token returned from Google');
        }
        
        // Use the access token to fetch user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        // Use the access token to fetch contacts
        await handleContactImport(accessToken);
        
      } catch (error) {
        console.error('Error during Google Sign-In:', error);
        toast({
          title: "Error",
          description: "Failed to authenticate with Google. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Google sign-in failed. Please try again.",
        variant: "destructive",
      });
    },
    scope: 'https://www.googleapis.com/auth/contacts.readonly',
  });

  const renderSidebar = () => (
    <aside className="w-full sm:w-80 lg:w-96 flex-shrink-0 glass-effect border-r border-border h-full flex flex-col">
      {/* Tabs */}
      <div className="flex p-3 border-b border-border">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-r-none",
            activeTab === 'direct' && "bg-secondary"
          )}
          onClick={() => setActiveTab('direct')}
        >
          <MessageSquare className="h-4 w-4 mr-2" /> 
          Chats
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-l-none",
            activeTab === 'group' && "bg-secondary"
          )}
          onClick={() => setActiveTab('group')}
        >
          <Users className="h-4 w-4 mr-2" /> 
          Groups
        </Button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {importedContacts.length > 0 ? (
          importedContacts.map((contact, index) => {
            // Extract contact information
            const email = contact.emailAddresses?.[0]?.value || contact.email || 'No email';
            const name = contact.names?.[0]?.displayName || 
                         contact.name || 
                         email.split('@')[0] || 
                         `Contact ${index + 1}`;
            const avatar = contact.photos?.[0]?.url || '';
            
            return (
              <div
                key={index}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
                    alt={name}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
                    }}
                  />
                </div>
                <div className="ml-3 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{name}</h3>
                  <p className="text-sm text-gray-600 truncate">{email}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <Users className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">No contacts yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Import your Google contacts to start chatting
            </p>
            <Button 
              onClick={() => googleLogin()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Import Google Contacts
            </Button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <UserAvatar 
            name={currentUser.displayName} 
            imageSrc={currentUser.photoURL} 
            online={true}
          />
          <div>
            <p className="font-medium text-sm">{currentUser.displayName}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // This shouldn't happen as we redirect in auth state change
  }

  return (
    <Layout className="p-0 pt-16">
      {/* Dialog for importing contacts */}
      <Dialog open={isContactImportOpen} onOpenChange={setIsContactImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Select which contacts to import
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {importedContacts.length > 0 && (
              <div className="space-y-3">
                {importedContacts.map((contact, index) => {
                  // Extract contact information
                  const email = contact.emailAddresses?.[0]?.value || contact.email || 'No email';
                  const name = contact.names?.[0]?.displayName || 
                             contact.name || 
                             email.split('@')[0] || 
                             `Contact ${index + 1}`;
                  const avatar = contact.photos?.[0]?.url || '';
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
                          }}
                        />
                      </div>
                      <div className="ml-3 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
                        <p className="text-sm text-gray-600 truncate">{email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsContactImportOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAndSaveContacts}
              disabled={importedContacts.length === 0 || loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                `Import ${importedContacts.length} Contacts`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Chat area */}
        <div className="hidden sm:block flex-1 h-full">
          {selectedContact ? (
            <DirectChat userId={selectedContact.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center p-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a contact or group from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
