import React, { useEffect, useState } from 'react';
import IncomingCallBanner from '@/components/IncomingCallBanner';
import { CallMediaType, CallService } from '@/services/callService';
import { useAuth } from '@/contexts/AuthContext';
import CallDialog from '@/components/CallDialog';

const GlobalIncomingCall: React.FC = () => {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<null | { id: string; callerId: string; mediaType: CallMediaType; callerName?: string }>(null);
  const [active, setActive] = useState<null | import('@/services/callService').CallSession>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const callService = CallService.getInstance();
    const unsub = callService.listenForIncomingCalls(user.uid, async (call) => {
      // We only know callerId + mediaType. Optionally resolve display name here if needed.
      setIncoming({ ...call });
    });
    return () => unsub();
  }, [user?.uid]);

  const accept = async () => {
    if (!incoming || !user?.uid) return;
    try {
      const callService = CallService.getInstance();
      const session = await callService.answerCall(incoming.id, incoming.mediaType);
      setActive(session);
      setDialogOpen(true);
      setIncoming(null);
    } catch (e) {
      setIncoming(null);
    }
  };

  const reject = async () => {
    if (!incoming) return;
    try {
      const callService = CallService.getInstance();
      await callService.rejectCall(incoming.id);
    } finally {
      setIncoming(null);
    }
  };

  const closeDialog = async () => {
    try { await active?.end(); } catch {}
    setActive(null);
    setDialogOpen(false);
  };

  return (
    <>
      <IncomingCallBanner
        visible={!!incoming}
        callerName={incoming?.callerName}
        mediaType={incoming?.mediaType || 'audio'}
        onAccept={accept}
        onReject={reject}
      />
      <CallDialog
        isOpen={dialogOpen}
        onClose={closeDialog}
        session={active}
        mode={active ? 'active' : 'incoming'}
        mediaType={incoming?.mediaType || 'audio'}
      />
    </>
  );
};

export default GlobalIncomingCall;