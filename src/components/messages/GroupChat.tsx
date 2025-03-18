
import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { generateGroupMessages } from '@/data/messages';
import { groups } from '@/data/users';

interface GroupChatProps {
  groupId: string;
  className?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, className }) => {
  const currentUser = JSON.parse(localStorage.getItem('quantatalk-user') || '{}');
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getGroup = groups.find(g => g.id === groupId);
    setGroup(getGroup);
    
    // Simulate loading messages
    setIsLoading(true);
    setTimeout(() => {
      const initialMessages = generateGroupMessages(groupId, currentUser.id);
      setMessages(initialMessages);
      setIsLoading(false);
    }, 1000);
  }, [groupId, currentUser.id]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      timestamp: new Date(),
      status: 'sent',
      isEncrypted: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="h-[70px] animate-pulse bg-secondary/20 mb-4"></div>
        <div className="flex-1 p-4 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-12 animate-pulse rounded-2xl", 
                i % 2 === 0 
                  ? "bg-secondary/20 w-2/3 ml-12" 
                  : "bg-primary/20 w-1/2 self-end mr-4"
              )}
            ></div>
          ))}
        </div>
        <div className="h-[84px] animate-pulse bg-secondary/20"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Select a group to start messaging</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <ChatHeader 
        name={group.name} 
        avatar={group.avatar}
        isGroup={true}
        participants={group.members.length} 
      />
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUser.id} 
        className="flex-1 overflow-y-auto"
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        placeholder="Type a message to the group..."
      />
    </div>
  );
};

export default GroupChat;
