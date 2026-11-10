import { useCallback, useEffect, useState } from 'react';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';

export type PublicProfileState =
  | { status: 'loading' }
  | { status: 'success'; data: PublicProfile }
  | { status: 'error'; error: PublicProfileError };

type ProfileRequestState = {
  actorId: string;
  reloadCounter: number;
  result: PublicProfileState;
};

export function usePublicProfile(service: PublicProfileService, actorId: string | undefined) {
  const [reloadCounter, setReloadCounter] = useState(0);
  const [requestState, setRequestState] = useState<ProfileRequestState>({
    actorId: '',
    reloadCounter: -1,
    result: { status: 'loading' },
  });

  useEffect(() => {
    let isActive = true;

    if (actorId === undefined || actorId.trim().length === 0) {
      return;
    }

    service
      .getPublicProfile(actorId)
      .then((data) => {
        if (isActive) {
          setRequestState({
            actorId,
            reloadCounter,
            result: { status: 'success', data },
          });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setRequestState({
            actorId,
            reloadCounter,
            result: {
              status: 'error',
              error:
                error instanceof PublicProfileError ? error : new PublicProfileError('unknown'),
            },
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [actorId, reloadCounter, service]);

  const reload = useCallback(() => {
    setReloadCounter((current) => current + 1);
  }, []);

  let currentProfile: PublicProfileState;
  if (actorId === undefined || actorId.trim().length === 0) {
    currentProfile = { status: 'error', error: new PublicProfileError('notFound') };
  } else if (requestState.actorId !== actorId || requestState.reloadCounter !== reloadCounter) {
    currentProfile = { status: 'loading' };
  } else {
    currentProfile = requestState.result;
  }

  return { profile: currentProfile, reload };
}
