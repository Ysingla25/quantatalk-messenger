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
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
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
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
    };

    // Create call doc
    const callRef = await addDoc(collection(db, 'calls'), {
      callerId,
      calleeId,
      mediaType,
      createdAt: serverTimestamp(),
      status: 'offer',
    });

    const callerCandidatesCol = collection(callRef, 'callerCandidates');
    const calleeCandidatesCol = collection(callRef, 'calleeCandidates');

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(callerCandidatesCol, event.candidate.toJSON());
      }
    };

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(callRef, { offer: { type: offer.type, sdp: offer.sdp } }, { merge: true });

    // Listen for answer
    const cleanup: CleanupRefs = { pc, localStream };

    cleanup.unsubCall = onSnapshot(callRef, async (snap) => {
      const data: any = snap.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Listen for callee ICE candidates
    cleanup.unsubCalleeCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate).catch(() => {});
        }
      });
    });

    const end = async () => {
      try {
        await updateDoc(callRef, { status: 'ended' });
      } catch {}
      cleanup.unsubCall?.();
      cleanup.unsubCallerCandidates?.();
      cleanup.unsubCalleeCandidates?.();
      pc.getSenders().forEach((s) => s.track && s.track.stop());
      localStream.getTracks().forEach((t) => t.stop());
      pc.close();
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
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
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
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate).catch(() => {});
        }
      });
    });

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

  listenForIncomingCalls(userId: string, onCall: (call: { id: string; callerId: string; mediaType: CallMediaType }) => void): Unsubscribe {
    const callsCol = collection(db, 'calls');
    const q = query(callsCol, where('calleeId', '==', userId), where('status', '==', 'offer'));
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