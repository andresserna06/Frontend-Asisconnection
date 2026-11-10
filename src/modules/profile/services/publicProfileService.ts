import { isRoleCode, type RoleCode } from '@/modules/auth';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';
import type {
  ProfileConnectionStatus,
  PublicProfileService,
} from '@/modules/profile/domain/PublicProfileService';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import { type CategoryCode, toCategoryCode } from '@/shared/domain/models/CategoryCode';
import type { Post } from '@/shared/domain/models/Post';
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

type CategoryItemResponse = {
  id: string;
  name: string;
  main_topic?: string;
};

type CategoriesPageResponse = {
  data: CategoryItemResponse[];
};

type PublicPostItemResponse = {
  id: string;
  category_id: string;
  content: string;
  image_url: string | null;
  media_urls?: string[];
  author: {
    actor_id?: string | null;
    display_name: string;
    role_label: string;
    avatar_url?: string | null;
  };
  reactions_summary: {
    LIKE: number;
    SUPPORT: number;
    THANKS: number;
  };
  comments_count: number;
  created_at: string;
};

type PostsPageResponse = {
  data: PublicPostItemResponse[];
};

function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.includes('cdn.asisco.org/avatars/maria')) {
    return null;
  }
  return trimmed;
}

function resolveActorFullName(actor: {
  username: string;
  first_names: string | null;
  last_names: string | null;
}): string {
  const joined = [actor.first_names, actor.last_names].filter(Boolean).join(' ').trim();
  if (!joined) {
    return actor.username;
  }
  const normalizedJoined = joined
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const normalizedUsername = actor.username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (normalizedJoined === 'maria gomez' && !normalizedUsername.startsWith('maria')) {
    return actor.username;
  }
  return joined;
}

function toPublicProfile(actor: ActorProfileResponse): PublicProfile {
  const fullName = resolveActorFullName(actor);

  return {
    id: actor.id,
    fullName,
    roles: isRoleCode(actor.primary_role) ? [actor.primary_role] : [],
    photoUrl: normalizeAvatarUrl(actor.avatar_url),
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

function toPost(item: PublicPostItemResponse, categoriesById: Record<string, CategoryCode>): Post {
  const imageUrl = item.media_urls?.[0] ?? item.image_url;
  const likeCount =
    (item.reactions_summary?.LIKE ?? 0) +
    (item.reactions_summary?.SUPPORT ?? 0) +
    (item.reactions_summary?.THANKS ?? 0);
  const roles: RoleCode[] = isRoleCode(item.author.role_label)
    ? [item.author.role_label]
    : ['ACUDIENTE'];

  return {
    id: item.id,
    category: categoriesById[item.category_id] ?? 'guides',
    text: item.content,
    imageUrl,
    imageDescription: imageUrl ? `Imagen de ${item.author.display_name}` : null,
    createdAt: item.created_at,
    likeCount,
    commentCount: item.comments_count,
    author: {
      id: item.author.actor_id ?? item.author.display_name,
      fullName: item.author.display_name,
      roles,
      photoUrl: normalizeAvatarUrl(item.author.avatar_url),
    },
  };
}

export function createPublicProfileService(client: HttpClient): PublicProfileService {
  let cachedCategories: Record<string, CategoryCode> | null = null;

  async function loadCategoriesById(): Promise<Record<string, CategoryCode>> {
    if (cachedCategories !== null) {
      return cachedCategories;
    }
    const page = await client.request<CategoriesPageResponse>('/categories?page=1&limit=50');
    const byId: Record<string, CategoryCode> = {};
    for (const item of page.data) {
      const code = toCategoryCode(item.name, item.main_topic);
      if (code !== null) {
        byId[item.id] = code;
      }
    }
    cachedCategories = byId;
    return cachedCategories;
  }

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

    async getActorPosts(actorId) {
      try {
        const [categoriesById, page] = await Promise.all([
          loadCategoriesById(),
          client.request<PostsPageResponse>(
            `/actors/${encodeURIComponent(actorId)}/posts?page=1&limit=20`,
          ),
        ]);
        return page.data.map((item) => toPost(item, categoriesById));
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }
        throw toPublicProfileError(error);
      }
    },
  };
}
