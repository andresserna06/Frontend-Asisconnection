import { useCallback, useEffect, useState } from 'react';

import type {
  ProfileConnectionStatus,
  PublicProfileService,
} from '@/modules/profile/domain/PublicProfileService';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';

type ConnectionState =
  | { status: 'loading'; actorId: string }
  | { status: 'ready'; actorId: string; relationship: ProfileConnectionStatus }
  | { status: 'error'; actorId: string; error: PublicProfileError };

type ConnectionDisplayState = ConnectionState | 'signInRequired' | null;

export function usePublicProfileConnection(
  service: PublicProfileService,
  actorId: string | undefined,
  isAnonymous: boolean,
) {
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [operationError, setOperationError] = useState<PublicProfileError | null>(null);

  useEffect(() => {
    if (actorId === undefined || actorId.trim().length === 0 || isAnonymous) {
      return;
    }

    let isActive = true;
    service
      .getConnectionStatus(actorId)
      .then((relationship) => {
        if (isActive) {
          setConnection({ status: 'ready', actorId, relationship });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setConnection({
            status: 'error',
            actorId,
            error: error instanceof PublicProfileError ? error : new PublicProfileError('unknown'),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [actorId, isAnonymous, service]);

  const requestFollow = useCallback(async () => {
    if (actorId === undefined || isAnonymous) {
      return;
    }

    setIsRequesting(true);
    setOperationError(null);
    try {
      const relationship = await service.requestFollow(actorId);
      setConnection({ status: 'ready', actorId, relationship });
    } catch (error) {
      const followError =
        error instanceof PublicProfileError ? error : new PublicProfileError('unknown');

      if (followError.kind === 'conflict') {
        try {
          const relationship = await service.getConnectionStatus(actorId);
          setConnection({ status: 'ready', actorId, relationship });
          return;
        } catch (refreshError) {
          setOperationError(
            refreshError instanceof PublicProfileError
              ? refreshError
              : new PublicProfileError('unknown'),
          );
        }
      } else {
        setOperationError(followError);
      }
    } finally {
      setIsRequesting(false);
    }
  }, [actorId, isAnonymous, service]);

  const retryConnectionStatus = useCallback(async () => {
    if (actorId === undefined || isAnonymous) {
      return;
    }
    setConnection({ status: 'loading', actorId });
    try {
      const relationship = await service.getConnectionStatus(actorId);
      setConnection({ status: 'ready', actorId, relationship });
    } catch (error) {
      setConnection({
        status: 'error',
        actorId,
        error: error instanceof PublicProfileError ? error : new PublicProfileError('unknown'),
      });
    }
  }, [actorId, isAnonymous, service]);

  const currentConnection: ConnectionState | null =
    actorId === undefined || actorId.trim().length === 0
      ? null
      : connection?.actorId === actorId
        ? connection
        : { status: 'loading' as const, actorId };
  const connectionDisplayState: ConnectionDisplayState = isAnonymous
    ? 'signInRequired'
    : currentConnection;

  return {
    connection: connectionDisplayState,
    isRequesting,
    operationError,
    requestFollow,
    retryConnectionStatus,
  };
}
