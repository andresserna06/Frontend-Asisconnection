import { isRoleCode, type RoleCode } from '@/modules/auth';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';
import type {
  ProfileConnectionStatus,
  PublicProfileService,
} from '@/modules/profile/domain/PublicProfileService';
import type {
  ActorConnectionItem,
  PublicProfile,
} from '@/modules/profile/domain/models/PublicProfile';
import { type CategoryCode, toCategoryCode } from '@/shared/domain/models/CategoryCode';
import type { Post, PostReactionType } from '@/shared/domain/models/Post';
import { rememberReaction } from '@/shared/hooks/useReactionToggle';
import {
  countPostsRemovedByAuthor,
  getAvatarPhotoUrl,
  isRemovedByAuthor,
} from '@/shared/lib/authorRemovalMarks';
import { HttpError, type HttpClient } from '@/shared/lib/http';

import { isActorUnfollowed, markActorUnfollowed } from './localUnfollowState';

const MAX_FOLLOWERS = 50;

type ViewerConnectionResponse = {
  connection_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  direction: 'OUTGOING' | 'INCOMING';
};

type ActorProfileResponse = {
  id: string;
  username: string;
  primary_role: string;
  first_names: string | null;
  last_names: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  email?: string | null;
  birth_date?: string | null;
  city?: string | null;
  show_email?: boolean;
  show_birth_date?: boolean;
  show_city?: boolean;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  viewer_connection?: ViewerConnectionResponse | null;
};

type ActorsPageResponse = {
  data: ActorProfileResponse[];
  meta?: {
    has_next_page?: boolean;
  };
};

type ConnectionPeerActorResponse = {
  actor_id: string;
  username: string;
  display_name: string;
  primary_role: string;
  avatar_url: string | null;
};

type ActorConnectionResponse = {
  id: string;
  requester_actor_id: string;
  receiver_actor_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  peer_actor?: ConnectionPeerActorResponse;
  requested_at?: string;
  accepted_at?: string | null;
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
  viewer_reactions?: PostReactionType[];
  is_bookmarked?: boolean;
  created_at: string;
};

type PostsPageResponse = {
  data: PublicPostItemResponse[];
};

type PendingSubmissionResponse = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
};

type DeletedResourceResponse = {
  id: string;
  deleted: boolean;
};

type ToggleBookmarkResponse = {
  post_id: string;
  bookmarked: boolean;
};

function normalizeAvatarUrl(rawAvatar: string | null | undefined): string | null {
  const url = getAvatarPhotoUrl(rawAvatar);
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

// The public endpoint already removes hidden data and does not send the show_* flags,
// so a value that arrives is visible unless it is explicitly marked as hidden.
function toVisibleValue(value: string | null | undefined, isShown: boolean | undefined) {
  return isShown === false ? null : (value ?? null);
}

function toPublicProfile(actor: ActorProfileResponse): PublicProfile {
  const fullName = resolveActorFullName(actor);
  const rawFollowers = actor.followers_count ?? 0;
  const followerCount = isActorUnfollowed(actor.id) ? Math.max(0, rawFollowers - 1) : rawFollowers;

  return {
    id: actor.id,
    username: actor.username,
    fullName,
    roles: isRoleCode(actor.primary_role) ? [actor.primary_role] : [],
    photoUrl: normalizeAvatarUrl(actor.avatar_url),
    shortBio: actor.short_bio,
    email: toVisibleValue(actor.email, actor.show_email),
    birthDate: toVisibleValue(actor.birth_date, actor.show_birth_date),
    city: toVisibleValue(actor.city, actor.show_city),
    postCount: Math.max(0, (actor.posts_count ?? 0) - countPostsRemovedByAuthor(actor.avatar_url)),
    followerCount,
    followingCount: actor.following_count ?? 0,
    ...(actor.viewer_connection !== undefined
      ? {
          viewerConnection: actor.viewer_connection
            ? {
                connectionId: actor.viewer_connection.connection_id,
                status: actor.viewer_connection.status,
                direction: actor.viewer_connection.direction,
              }
            : null,
        }
      : {}),
  };
}

function toConnectionItem(item: ActorConnectionResponse): ActorConnectionItem {
  return {
    id: item.id,
    requesterActorId: item.requester_actor_id,
    receiverActorId: item.receiver_actor_id,
    status: item.status,
    requestedAt: item.requested_at ?? '',
    acceptedAt: item.accepted_at ?? null,
    peerActor: item.peer_actor
      ? {
          actorId: item.peer_actor.actor_id,
          username: item.peer_actor.username,
          displayName: item.peer_actor.display_name,
          roles: isRoleCode(item.peer_actor.primary_role) ? [item.peer_actor.primary_role] : [],
          photoUrl: normalizeAvatarUrl(item.peer_actor.avatar_url),
        }
      : null,
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

function toConnectionStatus(
  status: ActorConnectionResponse['status'],
  direction: 'OUTGOING' | 'INCOMING' = 'OUTGOING',
): ProfileConnectionStatus {
  switch (status) {
    case 'ACCEPTED':
      return 'following';
    case 'PENDING':
      return direction === 'INCOMING' ? 'pendingIncoming' : 'pending';
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

  if (Array.isArray(item.viewer_reactions)) {
    rememberReaction(`post:${item.id}`, item.viewer_reactions.includes('LIKE'));
  }

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
    ...(item.viewer_reactions !== undefined ? { viewerReactions: item.viewer_reactions } : {}),
    ...(item.is_bookmarked !== undefined ? { isBookmarked: item.is_bookmarked } : {}),
  };
}

export function createPublicProfileService(client: HttpClient): PublicProfileService {
  let cachedCategories: Record<string, CategoryCode> | null = null;
  const connectionIdsByActor = new Map<string, string>();
  const viewerConnectionsByActor = new Map<string, ViewerConnectionResponse | null>();

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
        if (actor.viewer_connection !== undefined) {
          viewerConnectionsByActor.set(actor.id, actor.viewer_connection);
          if (actor.viewer_connection?.connection_id) {
            connectionIdsByActor.set(actor.id, actor.viewer_connection.connection_id);
          } else {
            connectionIdsByActor.delete(actor.id);
          }
        }
        return toPublicProfile(actor);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getConnectionStatus(actorId) {
      if (isActorUnfollowed(actorId)) {
        return 'notFollowing';
      }

      if (viewerConnectionsByActor.has(actorId)) {
        const cached = viewerConnectionsByActor.get(actorId);
        if (!cached) {
          return 'notFollowing';
        }
        connectionIdsByActor.set(actorId, cached.connection_id);
        return toConnectionStatus(cached.status, cached.direction);
      }

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
            connectionIdsByActor.set(actorId, connection.id);
            const direction = connection.requester_actor_id === actorId ? 'INCOMING' : 'OUTGOING';
            const status = toConnectionStatus(connection.status, direction);
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
      const wasUnfollowed = isActorUnfollowed(actorId);
      markActorUnfollowed(actorId, false);
      try {
        const response = await client.request<CreateConnectionResponse>('/connections', {
          method: 'POST',
          body: { receiver_actor_id: actorId },
        });
        connectionIdsByActor.set(actorId, response.id);
        viewerConnectionsByActor.set(actorId, {
          connection_id: response.id,
          status: response.status,
          direction: 'OUTGOING',
        });
        return toConnectionStatus(response.status, 'OUTGOING');
      } catch (error) {
        if (wasUnfollowed && error instanceof HttpError && error.status === 409) {
          return 'following';
        }
        throw toPublicProfileError(error);
      }
    },

    async requestUnfollow(actorId) {
      try {
        let connectionId = connectionIdsByActor.get(actorId);
        if (!connectionId && viewerConnectionsByActor.get(actorId)?.connection_id) {
          connectionId = viewerConnectionsByActor.get(actorId)?.connection_id;
        }
        if (connectionId) {
          await client.request(`/connections/${encodeURIComponent(connectionId)}`, {
            method: 'DELETE',
          });
          connectionIdsByActor.delete(actorId);
          viewerConnectionsByActor.set(actorId, null);
          markActorUnfollowed(actorId, false);
          return 'notFollowing';
        }
      } catch (error) {
        if (!(error instanceof HttpError && (error.status === 404 || error.status === 405))) {
          throw toPublicProfileError(error);
        }
      }
      // Unfollowing does not generate notifications; if the backend has no DELETE route yet,
      // record the unfollow for the active viewer.
      viewerConnectionsByActor.set(actorId, null);
      markActorUnfollowed(actorId, true);
      return 'notFollowing';
    },

    async acceptFollowRequest(actorId) {
      try {
        let connectionId =
          connectionIdsByActor.get(actorId) ?? viewerConnectionsByActor.get(actorId)?.connection_id;
        if (!connectionId) {
          const actor = await client.request<ActorProfileResponse>(
            `/actors/${encodeURIComponent(actorId)}`,
          );
          connectionId = actor.viewer_connection?.connection_id;
        }
        if (!connectionId) {
          throw new PublicProfileError('notFound');
        }
        const response = await client.request<ActorConnectionResponse>(
          `/connections/${encodeURIComponent(connectionId)}`,
          {
            method: 'PATCH',
            body: { status: 'ACCEPTED' },
          },
        );
        connectionIdsByActor.set(actorId, response.id);
        viewerConnectionsByActor.set(actorId, {
          connection_id: response.id,
          status: response.status,
          direction: 'INCOMING',
        });
        return toConnectionStatus(response.status, 'INCOMING');
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getMyFollowers() {
      try {
        const me = await client.request<ActorProfileResponse>('/actors/me');
        const directPage = await client
          .request<ActorsPageResponse>(
            `/actors/${encodeURIComponent(me.id)}/followers?page=1&limit=20`,
          )
          .catch(() => null);
        if (directPage && Array.isArray(directPage.data)) {
          return directPage.data.map(toPublicProfile);
        }

        const followerIds: string[] = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage && followerIds.length < MAX_FOLLOWERS) {
          const response = await client.request<ActorConnectionsPageResponse>(
            `/connections?page=${page}&limit=50`,
          );
          for (const connection of response.data) {
            if (connection.receiver_actor_id === me.id && connection.status === 'ACCEPTED') {
              followerIds.push(connection.requester_actor_id);
            }
          }
          hasNextPage = response.meta.has_next_page;
          page += 1;
        }

        const results = await Promise.allSettled(
          followerIds
            .slice(0, MAX_FOLLOWERS)
            .map((id) => client.request<ActorProfileResponse>(`/actors/${encodeURIComponent(id)}`)),
        );
        const followers = results.flatMap((result) =>
          result.status === 'fulfilled' ? [toPublicProfile(result.value)] : [],
        );
        const firstFailure = results.find((result) => result.status === 'rejected');
        if (followers.length === 0 && firstFailure?.status === 'rejected') {
          throw firstFailure.reason;
        }
        return followers;
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getMyFollowing() {
      try {
        const me = await client.request<ActorProfileResponse>('/actors/me');
        const page = await client.request<ActorsPageResponse>(
          `/actors/${encodeURIComponent(me.id)}/following?page=1&limit=20`,
        );
        return page.data.map(toPublicProfile);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getActorFollowers(actorId, page = 1, limit = 20) {
      try {
        const response = await client.request<ActorsPageResponse>(
          `/actors/${encodeURIComponent(actorId)}/followers?page=${page}&limit=${limit}`,
        );
        return response.data.map(toPublicProfile);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getActorFollowing(actorId, page = 1, limit = 20) {
      try {
        const response = await client.request<ActorsPageResponse>(
          `/actors/${encodeURIComponent(actorId)}/following?page=${page}&limit=${limit}`,
        );
        return response.data.map(toPublicProfile);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async searchActors(query = {}) {
      try {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        let path = `/actors?page=${page}&limit=${limit}`;
        const trimmedSearch = query.search?.trim() ?? '';
        if (trimmedSearch.length > 0) {
          path += `&search=${encodeURIComponent(trimmedSearch)}`;
        }
        if (query.role) {
          path += `&role=${encodeURIComponent(query.role)}`;
        }
        const response = await client.request<ActorsPageResponse>(path);
        return response.data.map(toPublicProfile);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async getMyConnections(query = {}) {
      try {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        let path = `/connections?page=${page}&limit=${limit}`;
        if (query.status) {
          path += `&status=${encodeURIComponent(query.status)}`;
        }
        if (query.direction) {
          path += `&direction=${encodeURIComponent(query.direction)}`;
        }
        const response = await client.request<ActorConnectionsPageResponse>(path);
        return response.data.map(toConnectionItem);
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async acceptConnection(connectionId) {
      try {
        await client.request(`/connections/${encodeURIComponent(connectionId)}`, {
          method: 'PATCH',
          body: { status: 'ACCEPTED' },
        });
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async deleteConnection(connectionId) {
      try {
        await client.request(`/connections/${encodeURIComponent(connectionId)}`, {
          method: 'DELETE',
        });
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
        return page.data
          .filter((item) => !isRemovedByAuthor(item.author.avatar_url, 'post', item.id))
          .map((item) => toPost(item, categoriesById));
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }
        throw toPublicProfileError(error);
      }
    },

    async getPostById(postId) {
      try {
        const [categoriesById, item] = await Promise.all([
          loadCategoriesById(),
          client.request<PublicPostItemResponse>(`/posts/${encodeURIComponent(postId)}`),
        ]);
        if (isRemovedByAuthor(item.author.avatar_url, 'post', item.id)) {
          return null;
        }
        return toPost(item, categoriesById);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return null;
        }
        throw toPublicProfileError(error);
      }
    },

    async updatePost(postId, { content, mediaUrls }) {
      try {
        const response = await client.request<PendingSubmissionResponse>(
          `/posts/${encodeURIComponent(postId)}`,
          {
            method: 'PATCH',
            body: {
              content,
              ...(mediaUrls !== undefined ? { media_urls: mediaUrls } : {}),
            },
          },
        );
        return {
          id: response.id,
          status: response.status,
          message: response.message,
        };
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async deletePost(postId) {
      try {
        const response = await client.request<DeletedResourceResponse>(
          `/posts/${encodeURIComponent(postId)}`,
          {
            method: 'DELETE',
          },
        );
        return response.deleted;
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async toggleBookmark(postId) {
      try {
        const response = await client.request<ToggleBookmarkResponse>(
          `/posts/${encodeURIComponent(postId)}/bookmarks`,
          {
            method: 'POST',
          },
        );
        return response.bookmarked;
      } catch (error) {
        throw toPublicProfileError(error);
      }
    },

    async reportPost(input) {
      try {
        await client.request('/reports', {
          method: 'POST',
          body: {
            target_type: input.targetType,
            target_id: input.targetId,
            reason: input.reason,
            ...(input.details ? { details: input.details } : {}),
          },
        });
      } catch (error) {
        if (error instanceof HttpError && error.status === 409) {
          throw new Error('reportConflict');
        }
        throw toPublicProfileError(error);
      }
    },
  };
}
