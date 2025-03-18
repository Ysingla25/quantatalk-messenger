
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import UserAvatar from '../ui/UserAvatar';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isEncrypted?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, className }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  
  messages.forEach(message => {
    const dateStr = format(message.timestamp, 'yyyy-MM-dd');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({
        date: dateStr,
        messages: [message]
      });
    }
  });

  return (
    <div className={cn("flex flex-col gap-4 p-4 overflow-y-auto", className)}>
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date} className="flex flex-col gap-4">
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full text-xs bg-secondary/50 text-muted-foreground">
              {format(new Date(group.date), 'MMMM d, yyyy')}
            </div>
          </div>
          
          {group.messages.map((message, index) => {
            const isCurrentUser = message.sender.id === currentUserId;
            const showAvatar = index === 0 || 
              group.messages[index - 1].sender.id !== message.sender.id;
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-2 max-w-[85%] message-appear",
                  isCurrentUser ? "self-end flex-row-reverse" : "self-start"
                )}
                style={{ 
                  animationDelay: `${(index + groupIndex * 5) * 50}ms`
                }}
              >
                {!isCurrentUser && showAvatar ? (
                  <UserAvatar 
                    name={message.sender.name} 
                    imageSrc={message.sender.avatar} 
                    size="sm"
                  />
                ) : !isCurrentUser ? (
                  <div className="w-8" /> 
                ) : null}
                
                <div 
                  className={cn(
                    "px-4 py-2 rounded-2xl", 
                    isCurrentUser 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-secondary rounded-tl-none"
                  )}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="text-xs font-medium mb-1 text-accent">
                      {message.sender.name}
                    </div>
                  )}
                  
                  <div className="relative">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                      {message.isEncrypted && (
                        <Shield className="h-3 w-3" />
                      )}
                      <span>
                        {format(message.timestamp, 'h:mm a')}
                      </span>
                      {isCurrentUser && (
                        <span>
                          {message.status === 'read' ? '✓✓' : 
                           message.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
