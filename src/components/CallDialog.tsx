import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CallMediaType, CallSession } from '@/services/callService';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: CallSession | null;
  mode: 'outgoing' | 'incoming' | 'active';
  mediaType: CallMediaType;
  callerName?: string;
}

const CallDialog: React.FC<CallDialogProps> = ({ isOpen, onClose, session, mode, mediaType, callerName }) => {
  const localRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const remoteRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(mediaType === 'video');

  useEffect(() => {
    if (!session) return;

    const localEl = localRef.current as any;
    const remoteEl = remoteRef.current as any;

    if (localEl) {
      localEl.srcObject = session.localStream;
      localEl.muted = true; // don't echo
      localEl.play().catch(() => {});
    }

    if (remoteEl) {
      remoteEl.srcObject = session.remoteStream;
      remoteEl.play().catch(() => {});
    }
  }, [session]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (!session) return;
    const enabled = !muted;
    session.localStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setMuted(!muted);
  };

  const toggleCamera = () => {
    if (!session) return;
    const enabled = !cameraOn;
    session.localStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    setCameraOn(!cameraOn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {mode === 'incoming' ? `Incoming ${mediaType} call` : mode === 'outgoing' ? `Calling...` : `In call`}
          </h2>
          {callerName && <p className="text-sm text-muted-foreground">{callerName}</p>}
        </div>

        {mediaType === 'video' ? (
          <div className="space-y-2">
            <video ref={remoteRef as any} className="w-full bg-black rounded" playsInline />
            <video ref={localRef as any} className="w-40 h-28 bg-black rounded" playsInline muted />
          </div>
        ) : (
          <div className="space-y-2">
            <audio ref={remoteRef as any} />
            <audio ref={localRef as any} />
          </div>
        )}

        <div className="mt-4 flex gap-2 justify-end">
          {mode !== 'incoming' && (
            <Button variant="secondary" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</Button>
          )}
          {mediaType === 'video' && mode !== 'incoming' && (
            <Button variant="secondary" onClick={toggleCamera}>{cameraOn ? 'Camera Off' : 'Camera On'}</Button>
          )}
          <Button variant="destructive" onClick={onClose}>End</Button>
        </div>
      </div>
    </div>
  );
};

export default CallDialog;