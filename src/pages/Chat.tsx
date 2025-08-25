import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import UserAvatar from '@/components/ui/UserAvatar';
import DirectChat from '@/components/messages/DirectChat';
import GroupChat from '@/components/messages/GroupChat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, LogOut, UserPlus, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { MessagingService } from '@/services/messagingService';
import { GroupService } from '@/services/groupService';
import { useGoogleLogin } from '@react-oauth/google';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { saveContactsToFirestore, getUserContacts } from '../services/saveContactsToFirestore';
import { deleteContact } from '../services/contactService';
import { Contact } from '@/types/contacts';
import { Group } from '@/types/groups';
import { useAuth } from '@/contexts/AuthContext';
import AddContactDialog from '@/components/AddContactDialog';
import StartChatDialog from '@/components/StartChatDialog';
import DeleteContactDialog from '@/components/DeleteContactDialog';
import CreateGroupDialog from '@/components/CreateGroupDialog';
import GroupMembersDialog from '@/components/GroupMembersDialog';
import { getUserByEmail } from '@/services/userService'; // Make sure this import exists
import { formatTimestamp, formatChatListTime } from '@/utils/dateUtils';
import { PresenceService, setUserStatus } from '@/services/presenceService';
import { usePresence } from '@/hooks/usePresence';
import { CallService, CallMediaType } from '@/services/callService';
import CallDialog from '@/components/CallDialog';

type ChatType = 'direct' | 'group';

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Initialize presence management
  usePresence(currentUser?.uid || null);
  const [activeTab, setActiveTab] = useState<ChatType>('direct');
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContactImportOpen, setIsContactImportOpen] = useState(false);
  const [importedContacts, setImportedContacts] = useState<any[]>([]);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const [isDeleteContactOpen, setIsDeleteContactOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState(false);
  
  // Group-related state
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const messagingService = MessagingService.getInstance();
  const groupService = GroupService.getInstance();
  const callService = CallService.getInstance();

  // Incoming call handling
  const [incomingCall, setIncomingCall] = useState<{ id: string; callerId: string; mediaType: CallMediaType } | null>(null);
  const [activeCall, setActiveCall] = useState<null | import('@/services/callService').CallSession>(null);
  const [callDialogOpen, setCallDialogOpen] = useState(false);

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

  const fetchUserGroups = async () => {
    if (!currentUser) return;
    
    try {
      setGroupsLoading(true);
      const groups = await groupService.getUserGroups(currentUser.uid);
      setUserGroups(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserContacts();
      fetchUserGroups();

      // Subscribe for incoming calls
      const unsub = callService.listenForIncomingCalls(currentUser.uid, (call) => {
        setIncomingCall(call);
        setCallDialogOpen(true);
      });
      return () => unsub();
    }
  }, [currentUser]);

  // Group-related handlers
  const handleGroupCreated = (newGroup: Group) => {
    setUserGroups(prev => [newGroup, ...prev]);
    setSelectedGroup(newGroup);
    setSelectedContact(null); // Clear direct chat selection
    setActiveTab('group');
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setSelectedContact(null); // Clear direct chat selection
  };

  const handleGroupUpdated = (updatedGroup: Group) => {
    setUserGroups(prev => prev.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ));
    if (selectedGroup?.id === updatedGroup.id) {
      setSelectedGroup(updatedGroup);
    }
  };

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

  const handleContactAdded = (newContact: Contact) => {
    setUserContacts(prev => [...prev, newContact]);
  };

  const handleStartChat = (contact: Contact) => {
    setSelectedContact(contact);
    setIsStartChatOpen(false); // Close the dialog after starting chat
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!currentUser) return;
    
    try {
      setDeletingContact(true);
      await deleteContact(currentUser.uid, contactId);
      
      // Remove the contact from the local state
      setUserContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      // If the deleted contact was selected, clear the selection
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
      
      toast({
        title: "Contact deleted",
        description: "Contact has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingContact(false);
      setIsDeleteContactOpen(false);
      setContactToDelete(null);
    }
  };

  const openDeleteDialog = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteContactOpen(true);
  };

  const handleContactClick = async (contact: Contact) => {
    try {
      // Validate user exists in system
      const user = await getUserByEmail(contact.email);
      if (!user) {
        toast({
          title: "User not found",
          description: "This contact hasn't signed up yet.",
          variant: "destructive",
        });
        return;
      }

      if (user.uid === currentUser.uid) {
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

      setSelectedContact(resolvedContact);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
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
            Add contacts manually or import from Google
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAddContactOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
            <Button 
              onClick={() => googleLogin()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Import Google
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {userContacts.map(contact => (
          <div 
            key={contact.id}
            className={`flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
              selectedContact?.id === contact.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleContactClick(contact)}
          >
            <div className="flex items-center flex-1">
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
                <span className={`text-xs font-semibold ${contact.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                  {contact.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog(contact);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderGroups = () => {
    if (groupsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (userGroups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No groups yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a group to start chatting with multiple people
          </p>
          <Button 
            onClick={() => setIsCreateGroupOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={userContacts.length === 0}
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
          {userContacts.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Add contacts first to create groups
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {userGroups.map(group => (
          <div 
            key={group.id}
            className={`flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer relative ${
              selectedGroup?.id === group.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleGroupClick(group)}
            title={`Created: ${formatTimestamp(group.createdAt)}\nLast updated: ${formatTimestamp(group.updatedAt)}`}
          >
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatChatListTime(group.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </p>
                {group.description && (
                  <p className="text-xs text-gray-400 truncate">{group.description}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGroup(group);
                setIsGroupMembersOpen(true);
              }}
            >
              <Users className="h-4 w-4" />
            </Button>
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

      {/* Action Buttons */}
      {activeTab === 'direct' && (
        <div className="flex gap-2 p-3 border-b border-border">
          <Button
            onClick={() => setIsStartChatOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button
            onClick={() => setIsAddContactOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      )}

      {activeTab === 'group' && (
        <div className="flex gap-2 p-3 border-b border-border">
          <Button
            onClick={() => setIsCreateGroupOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={userContacts.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      )}

      {/* Contacts/Groups List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'direct' ? renderContacts() : renderGroups()}
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

  useEffect(() => {
    const handleUnload = () => {
      if (currentUser?.uid) {
        setUserStatus(currentUser.uid, 'offline');
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [currentUser]);

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

      {/* Add Contact Dialog */}
      <AddContactDialog
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onContactAdded={handleContactAdded}
        userId={currentUser.uid}
      />

      {/* Start Chat Dialog */}
      <StartChatDialog
        isOpen={isStartChatOpen}
        onClose={() => setIsStartChatOpen(false)}
        onStartChat={handleStartChat}
        userId={currentUser.uid}
        existingContacts={userContacts}
      />

      {/* Delete Contact Dialog */}
      <DeleteContactDialog
        isOpen={isDeleteContactOpen}
        onClose={() => {
          setIsDeleteContactOpen(false);
          setContactToDelete(null);
        }}
        onConfirm={() => contactToDelete && handleDeleteContact(contactToDelete.id!)}
        contactName={contactToDelete?.name || ''}
        loading={deletingContact}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
        contacts={userContacts}
      />

      {/* Group Members Dialog */}
      <GroupMembersDialog
        isOpen={isGroupMembersOpen}
        onClose={() => setIsGroupMembersOpen(false)}
        group={selectedGroup}
        onGroupUpdated={handleGroupUpdated}
      />

      <div className="h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Chat area */}
        <div className="hidden sm:block flex-1 h-full">
          {selectedContact ? (
            <DirectChat userId={selectedContact.id} />
          ) : selectedGroup ? (
            <GroupChat groupId={selectedGroup.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center p-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'direct' ? (
                    <MessageSquare className="h-8 w-8 text-primary" />
                  ) : (
                    <Users className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {activeTab === 'direct' ? 'Select a conversation' : 'Select a group'}
                </h2>
                <p className="text-muted-foreground">
                  {activeTab === 'direct' 
                    ? 'Choose a contact from the list to start messaging'
                    : 'Choose a group from the list to start group messaging'
                  }
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





