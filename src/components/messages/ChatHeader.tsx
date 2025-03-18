
import React from 'react';
import UserAvatar from '../ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  name: string;
  avatar?: string | null;
  isGroup?: boolean;
  online?: boolean;
  participants?: number;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  isGroup = false,
  online = false,
  participants = 0,
  className
}) => {
  return (
    <div className={cn("px-4 py-3 flex items-center justify-between border-b border-border glass-effect", className)}>
      <div className="flex items-center gap-3">
        <UserAvatar 
          name={name} 
          imageSrc={avatar} 
          online={online} 
        />
        
        <div className="flex flex-col">
          <h2 className="font-medium">{name}</h2>
          <p className="text-xs text-muted-foreground">
            {isGroup 
              ? `${participants} participants` 
              : online ? 'Online' : 'Offline'
            }
          </p>
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
