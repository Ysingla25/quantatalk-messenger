import React from 'react';
import { Button } from '@/components/ui/button';
import { CallMediaType } from '@/services/callService';

interface IncomingCallBannerProps {
  visible: boolean;
  callerName?: string;
  mediaType: CallMediaType;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({ visible, callerName, mediaType, onAccept, onReject }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-background/95 border shadow-lg px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Incoming {mediaType} call</div>
          {callerName && <div className="text-xs text-muted-foreground">{callerName}</div>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onAccept}>Accept</Button>
          <Button variant="destructive" onClick={onReject}>Reject</Button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallBanner;