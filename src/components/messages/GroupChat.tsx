import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebaseConfig';
import { MessagingService, Message } from '@/services/messagingService';
import { GroupService } from '@/services/groupService';
import { Group } from '@/types/groups';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GroupMembersDialog from '../GroupMembersDialog';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { formatTimestamp } from '@/utils/dateUtils';

interface GroupChatProps {
  groupId: string;
  className?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const messagingService = MessagingService.getInstance();
  const groupService = GroupService.getInstance();

  useEffect(() => {
    const loadGroup = async () => {
      try {
        setIsLoading(true);
        const groupData = await groupService.getGroupById(groupId);
        setGroup(groupData);
      } catch (error) {
        console.error('Error loading group:', error);
        toast({
          title: "Error",
          description: "Failed to load group information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGroup();
  }, [groupId]);

  useEffect(() => {
    const unsubscribe = messagingService.subscribeToMessages(groupId, setMessages);
    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await messagingService.sendMessage(groupId, newMessage);
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
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

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">Group not found</p>
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

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.senderId === auth.currentUser?.uid 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            {message.senderId !== auth.currentUser?.uid && (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {message.senderName[0].toUpperCase()}
              </div>
            )}
            <div className="max-w-[70%]">
              <div 
                className={`p-3 rounded-lg relative group cursor-pointer ${
                  message.senderId === auth.currentUser?.uid 
                    ? 'bg-primary/20 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
                title={formatTimestamp(message.timestamp)}
              >
                <div className="flex justify-between items-start">
                  {message.senderId !== auth.currentUser?.uid && (
                    <p className="font-medium text-sm text-gray-900">{message.senderName}</p>
                  )}
                  <div className="relative">
                    <span className="absolute -top-8 left-0 bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm mt-1 ${
                  message.senderId === auth.currentUser?.uid 
                    ? 'text-white' 
                    : 'text-gray-900'
                } break-words`}>
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t bg-background/50 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background/50 placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90"
            disabled={!newMessage.trim()}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
