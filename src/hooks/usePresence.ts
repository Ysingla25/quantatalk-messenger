import { useEffect, useRef } from 'react';
import { PresenceService } from '@/services/presenceService';

export const usePresence = (userId: string | null) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || initializedRef.current === userId) {
      return;
    }

    const presenceService = PresenceService.getInstance();

    // prevent re-entrancy while initializing
    initializedRef.current = userId;

    // Clean up previous presence if exists
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    let cancelled = false;

    // Initialize new presence
    presenceService.initializePresence(userId)
      .then(cleanup => {
        if (cancelled) {
          // If userId changed or component unmounted before init completes, cleanup immediately
          cleanup();
          return;
        }
        cleanupRef.current = cleanup;
      })
      .catch(error => {
        console.error('Error initializing presence:', error);
        initializedRef.current = null; // allow retry
      });

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      initializedRef.current = null;
    };
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};