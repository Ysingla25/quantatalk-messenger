
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import UserAvatar from '@/components/ui/UserAvatar';
import DirectChat from '@/components/messages/DirectChat';
import GroupChat from '@/components/messages/GroupChat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { users, groups } from '@/data/users';
import { Users, MessageSquare, Plus, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type ChatType = 'direct' | 'group';

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ChatType>('direct');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('quantatalk-user');
    if (!userJson) {
      navigate('/');
      return;
    }
    
    setCurrentUser(JSON.parse(userJson));
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('quantatalk-user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };
  
  if (!currentUser) {
    return null; // or loading indicator
  }

  return (
    <Layout className="p-0 pt-16">
      <div className="h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 glass-effect border-r border-border h-full flex flex-col">
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
          
          {/* Chat list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {activeTab === 'direct' ? (
              <>
                {users.filter(u => u.id !== currentUser.id).map(user => (
                  <div 
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                      selectedUserId === user.id && "bg-secondary"
                    )}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <UserAvatar 
                      name={user.name} 
                      imageSrc={user.avatar} 
                      online={user.status === 'online'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <span className="text-xs text-muted-foreground">12m</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.status === 'online' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {groups.map(group => (
                  <div 
                    key={group.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                      selectedGroupId === group.id && "bg-secondary"
                    )}
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    <UserAvatar 
                      name={group.name} 
                      imageSrc={group.avatar}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">{group.name}</h3>
                        <span className="text-xs text-muted-foreground">17m</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <UserAvatar 
                name={currentUser.name} 
                imageSrc={currentUser.avatar} 
                online={true}
              />
              <div>
                <p className="font-medium text-sm">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => toast({
                  title: "Coming soon",
                  description: "This feature will be available in a future update.",
                })}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="hidden sm:block flex-1 h-full">
          {selectedUserId ? (
            <DirectChat userId={selectedUserId} />
          ) : selectedGroupId ? (
            <GroupChat groupId={selectedGroupId} />
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
