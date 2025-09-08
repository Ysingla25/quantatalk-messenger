import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebaseConfig';
import { MessagingService, Message } from '@/services/messagingService';
import { ChatService } from '@/services/chatService';
import ChatHeader from './ChatHeader';
import { cn } from '@/lib/utils';
import { Timestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { formatTimestamp } from '@/utils/dateUtils';
import CallDialog from '@/components/CallDialog';

interface DirectChatProps {
  userId: string;
  className?: string;
}

const DirectChat: React.FC<DirectChatProps> = ({ userId, className }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [callOpen, setCallOpen] = useState(false);
  const [callMode, setCallMode] = useState<'outgoing' | 'incoming' | 'active'>('outgoing');
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [callSession, setCallSession] = useState<any>(null);
  
  const messagingService = MessagingService.getInstance();
  const chatService = ChatService.getInstance();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const data = userDoc.exists() ? userDoc.data() : null;
      setUser(data);
    };
    fetchUser();
  }, [userId]);

  // Presence subscription for header status
  useEffect(() => {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    const unsub = onSnapshot(userRef, (snap) => {
      const d = snap.data() as any;
      setIsOnline(!!d?.isOnline);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!currentUser) return;

      try {
        // Get or create chat session
        const sessionId = await chatService.getOrCreateDirectChat(currentUser.uid, userId);
        setChatId(sessionId);

        // Subscribe to messages for this chat
        const unsubscribe = messagingService.subscribeToMessages(sessionId, setMessages);

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat",
          variant: "destructive",
        });
      }
    };

    const unsubscribe = initializeChat();
    return () => {
      unsubscribe.then(unsub => unsub && unsub());
    };
  }, [userId, currentUser]);



  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      await messagingService.sendMessage(chatId, newMessage);
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const startCall = async (type: 'audio' | 'video') => {
    try {
      if (!currentUser) return;
      const { CallService } = await import('@/services/callService');
      const cs = CallService.getInstance();
      const session = await cs.startCall(currentUser.uid, userId, type);
      setCallSession(session);
      setMediaType(type);
      setCallMode('active');
      setCallOpen(true);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to start call', variant: 'destructive' });
    }
  };

  const endCall = async () => {
    try { await callSession?.end?.(); } catch {}
    setCallOpen(false);
    setCallSession(null);
  };

  // Auto-close when remote ends/rejects
  useEffect(() => {
    if (!callSession?.callId) return;
    const callRef = doc(db, 'calls', callSession.callId);
    const unsub = onSnapshot(callRef, (snap) => {
      const d: any = snap.data();
      if (d?.status === 'ended' || d?.status === 'rejected') {
        endCall();
      }
    });
    return () => unsub();
  }, [callSession?.callId]);

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
        online={isOnline}
        onVoiceCall={() => startCall('audio')}
        onVideoCall={() => startCall('video')}
      />
      
      {/* Call dialog */}
      {callOpen && callSession && (
        <CallDialog
          isOpen={callOpen}
          onClose={endCall}
          session={callSession}
          mode={callMode}
          mediaType={mediaType}
          callerName={user?.name}
        />
      )}
      
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
              <div className={`p-3 rounded-lg relative ${
                message.senderId === auth.currentUser?.uid 
                  ? 'bg-primary/20 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`} title={formatTimestamp(message.timestamp)}>
                <div className="flex justify-between items-start">
                  {message.senderId !== auth.currentUser?.uid && (
                    <p className="font-medium text-sm text-gray-900">{message.senderName}</p>
                  )}
                  <div className="relative">
                    <span className="absolute -top-8 left-0 bg-black/900 text-white px-2 py-1 rounded text-xs whitespace-nowrap 
                      opacity-0 transition-opacity duration-200 hover:opacity-100 pointer-events-none">
                      {message.timestamp instanceof Timestamp 
                        ? message.timestamp.toDate().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'Invalid Date'}
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

export default DirectChat;
