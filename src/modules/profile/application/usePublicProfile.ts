import { useCallback, useEffect, useState } from 'react';

import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';
import type {
  ActorConnectionResult,
  ProfileService,
} from '@/modules/profile/domain/ProfileService';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { type AsyncData, useAsyncData } from '@/shared/hooks/useAsyncData';

export type PublicProfileState<TData = PublicProfile, TError = PublicProfileError> =
  { status: 'loading' } | { status: 'success'; data: TData } | { status: 'error'; error: TError };

type ProfileRequestState<TData, TError> = {
  actorId: string;
  reloadCounter: number;
  result: PublicProfileState<TData, TError>;
};

export function usePublicProfile(
  service: PublicProfileService,
  actorId: string | undefined,
): {
  profile: PublicProfileState;
  reload: () => void;
  posts: AsyncData<Post[]> & { reload(): void };
  connection: ActorConnectionResult | null;
  followError: ProfileError | null;
  isFollowingLoading: boolean;
  follow: () => Promise<void>;
};
export function usePublicProfile(
  service: ProfileService,
  actorId: string,
): {
  profile: PublicProfileState<MyProfile, ProfileError>;
  reload: () => void;
  posts: AsyncData<Post[]> & { reload(): void };
  connection: ActorConnectionResult | null;
  followError: ProfileError | null;
  isFollowingLoading: boolean;
  follow: () => Promise<void>;
};
export function usePublicProfile(
  service: PublicProfileService | ProfileService,
  actorId: string | undefined,
) {
  const [reloadCounter, setReloadCounter] = useState(0);
  const [requestState, setRequestState] = useState<
    ProfileRequestState<PublicProfile | MyProfile, PublicProfileError | ProfileError>
  >({
    actorId: '',
    reloadCounter: -1,
    result: { status: 'loading' },
  });

  useEffect(() => {
    let isActive = true;

    if (actorId === undefined || actorId.trim().length === 0) {
      return;
    }

    const request = service.getPublicProfile
      ? service.getPublicProfile(actorId)
      : Promise.reject(new ProfileError('unknown'));

    request
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
          const fallbackError =
            error instanceof PublicProfileError || error instanceof ProfileError
              ? error
              : 'getMyProfile' in service
                ? new ProfileError('unknown')
                : new PublicProfileError('unknown');
          setRequestState({
            actorId,
            reloadCounter,
            result: {
              status: 'error',
              error: fallbackError,
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

  const fetchPosts = useCallback(() => {
    if (
      actorId === undefined ||
      actorId.trim().length === 0 ||
      !('getActorPosts' in service) ||
      !service.getActorPosts
    ) {
      return Promise.resolve([]);
    }
    return service.getActorPosts(actorId);
  }, [service, actorId]);

  const posts = useAsyncData<Post[]>(fetchPosts);

  const [connection, setConnection] = useState<ActorConnectionResult | null>(null);
  const [followError, setFollowError] = useState<ProfileError | null>(null);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const follow = useCallback(async () => {
    if (
      actorId === undefined ||
      actorId.trim().length === 0 ||
      !('followActor' in service) ||
      !service.followActor ||
      isFollowingLoading
    ) {
      return;
    }
    setIsFollowingLoading(true);
    setFollowError(null);
    try {
      const result = await service.followActor(actorId);
      setConnection(result);
    } catch (caught) {
      setFollowError(caught instanceof ProfileError ? caught : new ProfileError('unknown'));
    } finally {
      setIsFollowingLoading(false);
    }
  }, [service, actorId, isFollowingLoading]);

  let currentProfile: PublicProfileState<
    PublicProfile | MyProfile,
    PublicProfileError | ProfileError
  >;
  if (actorId === undefined || actorId.trim().length === 0) {
    currentProfile = { status: 'error', error: new PublicProfileError('notFound') };
  } else if (requestState.actorId !== actorId || requestState.reloadCounter !== reloadCounter) {
    currentProfile = { status: 'loading' };
  } else {
    currentProfile = requestState.result;
  }

  return {
    profile: currentProfile,
    reload,
    posts,
    connection,
    followError,
    isFollowingLoading,
    follow,
  };
}
