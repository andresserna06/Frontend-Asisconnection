import { isRoleCode } from '@/modules/auth';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';
import type {
  ProfileConnectionStatus,
  PublicProfileService,
} from '@/modules/profile/domain/PublicProfileService';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import { HttpError, type HttpClient } from '@/shared/lib/http';

type ActorProfileResponse = {
  id: string;
  username: string;
  primary_role: string;
  first_names: string | null;
  last_names: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  birth_date?: string | null;
  city?: string | null;
  show_birth_date?: boolean;
  show_city?: boolean;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
};

type ActorConnectionResponse = {
  id: string;
  requester_actor_id: string;
  receiver_actor_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
};

type ActorConnectionsPageResponse = {
  data: ActorConnectionResponse[];
  meta: {
    has_next_page: boolean;
  };
};

type CreateConnectionResponse = ActorConnectionResponse;

function toPublicProfile(actor: ActorProfileResponse): PublicProfile {
  const fullName =
    [actor.first_names, actor.last_names].filter(Boolean).join(' ').trim() || actor.username;

  return {
    id: actor.id,
    fullName,
    roles: isRoleCode(actor.primary_role) ? [actor.primary_role] : [],
    photoUrl: actor.avatar_url,
    shortBio: actor.short_bio,
    birthDate: actor.show_birth_date === true ? (actor.birth_date ?? null) : null,
    city: actor.show_city === true ? (actor.city ?? null) : null,
    postCount: actor.posts_count ?? 0,
    followerCount: actor.followers_count ?? 0,
    followingCount: actor.following_count ?? 0,
  };
}

function toPublicProfileError(error: unknown): PublicProfileError {
  if (error instanceof PublicProfileError) {
    return error;
  }
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return new PublicProfileError('notFound');
    }
    if (error.status === 403) {
      return new PublicProfileError('forbidden');
    }
    if (error.status === 409) {
      return new PublicProfileError('conflict');
    }
    if (error.status === null || error.status === 502) {
      return new PublicProfileError('network');
    }
  }
  return new PublicProfileError('unknown');
}

function toConnectionStatus(status: ActorConnectionResponse['status']): ProfileConnectionStatus {
  switch (status) {
    case 'ACCEPTED':
      return 'following';
    case 'PENDING':
      return 'pending';
    case 'BLOCKED':
      return 'blocked';
  }
}

export function createPublicProfileService(client: HttpClient): PublicProfileService {
  return {
    async getPublicProfile(actorId) {
      if (actorId.trim().length === 0) {
        throw new PublicProfileError('notFound');
      }

      try {
        const actor = await client.request<ActorProfileResponse>(
          `/actors/${encodeURIComponent(actorId)}`,
        );
        return toPublicProfile(actor);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getConnectionStatus(actorId) {
      let page = 1;
      let hasNextPage = true;
      let matchedStatus: ProfileConnectionStatus | null = null;

      try {
        while (hasNextPage) {
          const response = await client.request<ActorConnectionsPageResponse>(
            `/connections?page=${page}&limit=50`,
          );
          const connection = response.data.find(
            (item) => item.requester_actor_id === actorId || item.receiver_actor_id === actorId,
          );

          if (connection !== undefined) {
            const status = toConnectionStatus(connection.status);
            if (status === 'following' || matchedStatus === null) {
              matchedStatus = status;
            }
          }

          if (matchedStatus === 'following') {
            return matchedStatus;
          }

          hasNextPage = response.meta.has_next_page;
          page += 1;
        }

        return matchedStatus ?? 'notFollowing';
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async requestFollow(actorId) {
      try {
        const response = await client.request<CreateConnectionResponse>('/connections', {
          method: 'POST',
          body: { receiver_actor_id: actorId },
        });
        return toConnectionStatus(response.status);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },
  };
}
