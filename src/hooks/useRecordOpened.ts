import { useEffect } from 'react';

import * as api from '../api';

let recorded: string | null = null;

/**
 * Notes "last opened" (just the date) when the app opens or comes back to the front, at most once
 * a day per person per device; a home-screen app can stay open for days. A failure tries again next time.
 */
export function useRecordOpened(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    const record = () => {
      const key = `${userId}:${new Date().toDateString()}`;
      if (document.visibilityState !== 'visible' || recorded === key) return;
      recorded = key;
      api.recordOpened().catch(() => {
        recorded = null;
      });
    };
    record();
    document.addEventListener('visibilitychange', record);

    return () => document.removeEventListener('visibilitychange', record);
  }, [userId]);
}
