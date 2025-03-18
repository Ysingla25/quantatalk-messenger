
import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { generateMessages } from '@/data/messages';
import { users } from '@/data/users';

interface DirectChatProps {
  userId: string;
  className?: string;
}

const DirectChat: React.FC<DirectChatProps> = ({ userId, className }) => {
  const currentUser = JSON.parse(localStorage.getItem('quantatalk-user') || '{}');
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = users.find(u => u.id === userId);
    setUser(getUser);
    
    // Simulate loading messages
    setIsLoading(true);
    setTimeout(() => {
      const initialMessages = generateMessages(currentUser.id, userId);
      setMessages(initialMessages);
      setIsLoading(false);
    }, 1000);
  }, [userId, currentUser.id]);

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
    
    // Simulate reply
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replyMessage: Message = {
          id: Date.now().toString(),
          content: getRandomReply(),
          sender: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          },
          timestamp: new Date(),
          status: 'sent',
          isEncrypted: true
        };
        
        setMessages(prev => [...prev, replyMessage]);
        
        toast({
          title: "New Message",
          description: `${user.name}: ${replyMessage.content.substring(0, 30)}${replyMessage.content.length > 30 ? '...' : ''}`,
        });
      }, 3000 + Math.random() * 2000);
    }
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <ChatHeader 
        name={user.name} 
        avatar={user.avatar}
        online={user.status === 'online'} 
      />
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUser.id} 
        className="flex-1 overflow-y-auto"
      />
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

const getRandomReply = () => {
  const replies = [
    "Yes, that works for me.",
    "I'll check and get back to you later.",
    "Thanks for letting me know.",
    "That's interesting. Can you tell me more?",
    "I'm not sure about that. Let me think.",
    "Absolutely! Great idea.",
    "Sorry, I can't make it today.",
    "Have you tried the new feature?",
    "Let's discuss this in person.",
    "I'll send you the document shortly."
  ];
  
  return replies[Math.floor(Math.random() * replies.length)];
};

export default DirectChat;
