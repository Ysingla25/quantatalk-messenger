import { db } from '@/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';

export type CallMediaType = 'audio' | 'video';

export interface CallSession {
  callId: string;
  localStream: MediaStream;
  remoteStream: MediaStream;
  end: () => Promise<void>;
  peer: RTCPeerConnection;
}

interface CleanupRefs {
  pc?: RTCPeerConnection;
  localStream?: MediaStream;
  unsubCall?: Unsubscribe;
  unsubCallerCandidates?: Unsubscribe;
  unsubCalleeCandidates?: Unsubscribe;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    // Optional TURN server (recommended for NAT traversal). Provide via env:
    // VITE_TURN_URL, VITE_TURN_USERNAME, VITE_TURN_CREDENTIAL
    ...(import.meta.env.VITE_TURN_URL
      ? [{
          urls: import.meta.env.VITE_TURN_URL.split(',').map((u: string) => u.trim()),
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        }]
      : []),
  ],
};

export class CallService {
  private static instance: CallService;
  private constructor() {}
  static getInstance(): CallService {
    if (!CallService.instance) CallService.instance = new CallService();
    return CallService.instance;
  }

  async endCallById(callId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'calls', callId), { status: 'ended' });
    } catch {}
  }

  async startCall(callerId: string, calleeId: string, mediaType: CallMediaType): Promise<CallSession> {
    const pc = new RTCPeerConnection(rtcConfig);
    const localStream = await this.getLocalStream(mediaType);
    const remoteStream = new MediaStream();

    // Add tracks
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (stream) {
        stream.getTracks().forEach((t) => remoteStream.addTrack(t));
      } else if (e.track) {
        remoteStream.addTrack(e.track);
      }
    };

    // Create call doc (start as ringing)
    const callRef = await addDoc(collection(db, 'calls'), {
      callerId,
      calleeId,
      mediaType,
      createdAt: serverTimestamp(),
      status: 'ringing', // WhatsApp-like: ringing until answered/rejected/timeout
    });

    const callerCandidatesCol = collection(callRef, 'callerCandidates');
    const calleeCandidatesCol = collection(callRef, 'calleeCandidates');

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(callerCandidatesCol, event.candidate.toJSON());
      }
    };

    // Create offer (still ringing)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(callRef, { offer: { type: offer.type, sdp: offer.sdp } }, { merge: true });

    // Auto-timeout if not answered within 30s
    const timeoutId = setTimeout(async () => {
      try {
        await updateDoc(callRef, { status: 'timeout' });
      } catch {}
    }, 30000);

    // Listen for answer
    const cleanup: CleanupRefs = { pc, localStream };

    cleanup.unsubCall = onSnapshot(callRef, async (snap) => {
      const data: any = snap.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      if (data?.status === 'in-progress' && pc.connectionState === 'new') {
        // Peer accepted; nothing to do here yet (tracks attach via ontrack)
      }
      if (data?.status === 'ended' || data?.status === 'rejected' || data?.status === 'timeout') {
        // Remote ended/rejected/timeout — terminate locally
        end().catch(() => {});
      }
    });

    // React to connection state to auto-clean on failure
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'failed' || s === 'disconnected' || s === 'closed') {
        end().catch(() => {});
      }
    };

    // Listen for callee ICE candidates
    cleanup.unsubCalleeCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const add = () => {
            if (pc.remoteDescription) {
              const candidate = new RTCIceCandidate(data);
              pc.addIceCandidate(candidate).catch(() => {});
            } else {
              setTimeout(add, 50);
            }
          };
          add();
        }
      });
    });

    const end = async () => {
      try {
        await updateDoc(callRef, { status: 'ended' });
      } catch {}
      try {
        // Remove candidate subcollections and doc to avoid leaks
        const callerCandidatesCol = collection(callRef, 'callerCandidates');
        const calleeCandidatesCol = collection(callRef, 'calleeCandidates');
        // Best-effort cleanup: Firestore client SDK has no direct batch delete for subcollections here
      } catch {}
      cleanup.unsubCall?.();
      cleanup.unsubCallerCandidates?.();
      cleanup.unsubCalleeCandidates?.();
      pc.getSenders().forEach((s) => s.track && s.track.stop());
      localStream.getTracks().forEach((t) => t.stop());
      try { pc.close(); } catch {}
    };

    // Clear timeout when call ends or connects
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        clearTimeout(timeoutId);
        try { updateDoc(callRef, { status: 'in-progress' }); } catch {}
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        clearTimeout(timeoutId);
      }
    };

    return { callId: callRef.id, localStream, remoteStream, end, peer: pc };
  }

  async answerCall(callId: string, mediaType: CallMediaType): Promise<CallSession> {
    const callRef = doc(db, 'calls', callId);
    const snap = await getDoc(callRef);
    if (!snap.exists()) throw new Error('Call not found');
    const data: any = snap.data();

    const pc = new RTCPeerConnection(rtcConfig);
    const localStream = await this.getLocalStream(mediaType);
    const remoteStream = new MediaStream();

    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (stream) {
        stream.getTracks().forEach((t) => remoteStream.addTrack(t));
      } else if (e.track) {
        remoteStream.addTrack(e.track);
      }
    };

    const callerCandidatesCol = collection(callRef, 'callerCandidates');
    const calleeCandidatesCol = collection(callRef, 'calleeCandidates');

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(calleeCandidatesCol, event.candidate.toJSON());
      }
    };

    // Set remote offer
    if (data?.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    } else {
      throw new Error('No offer in call');
    }

    // Create and send answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await updateDoc(callRef, { answer: { type: answer.type, sdp: answer.sdp }, status: 'in-progress' });

    // Listen for caller ICE candidates
    const cleanup: CleanupRefs = { pc, localStream };
    cleanup.unsubCallerCandidates = onSnapshot(callerCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const add = () => {
            if (pc.remoteDescription) {
              const candidate = new RTCIceCandidate(data);
              pc.addIceCandidate(candidate).catch(() => {});
            } else {
              setTimeout(add, 50);
            }
          };
          add();
        }
      });
    });

    // Watch call doc for remote end/reject
    cleanup.unsubCall = onSnapshot(callRef, (snap) => {
      const d: any = snap.data();
      if (d?.status === 'ended' || d?.status === 'rejected') {
        end().catch(() => {});
      }
    });

    // React to connection state to auto-clean on failure
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'failed' || s === 'disconnected' || s === 'closed') {
        end().catch(() => {});
      }
    };

    const end = async () => {
      try {
        await updateDoc(callRef, { status: 'ended' });
      } catch {}
      cleanup.unsubCallerCandidates?.();
      cleanup.unsubCalleeCandidates?.();
      cleanup.unsubCall?.();
      pc.getSenders().forEach((s) => s.track && s.track.stop());
      localStream.getTracks().forEach((t) => t.stop());
      pc.close();
    };

    return { callId: callRef.id, localStream, remoteStream, end, peer: pc };
  }

  async rejectCall(callId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'calls', callId), { status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }

  listenForIncomingCalls(userId: string, onCall: (call: { id: string; callerId: string; mediaType: CallMediaType }) => void): Unsubscribe {
    const callsCol = collection(db, 'calls');
    // Listen for calls in 'ringing' state for this user
    const q = query(callsCol, where('calleeId', '==', userId), where('status', '==', 'ringing'));
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data: any = change.doc.data();
          if (data?.offer && !data?.answer) {
            onCall({ id: change.doc.id, callerId: data.callerId, mediaType: data.mediaType as CallMediaType });
          }
        }
      });
    });
  }

  private async getLocalStream(mediaType: CallMediaType): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = mediaType === 'video'
      ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
      : { audio: true, video: false };
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
}