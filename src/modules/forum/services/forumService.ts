import type {
  ForumRepository,
  ModerationPendingItem,
} from '@/modules/forum/domain/ForumRepository';
import type { ForumCategory } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost, ForumReactionType } from '@/modules/forum/domain/models/ForumPost';
import { toCategoryCode } from '@/shared/domain/models/CategoryCode';
import { rememberReaction } from '@/shared/hooks/useReactionToggle';
import { getAvatarPhotoUrl, isRemovedByAuthor } from '@/shared/lib/authorRemovalMarks';
import { type HttpClient, HttpError } from '@/shared/lib/http';

// Response bodies as the AsisConexión backend sends them (contracts/openapi.yaml).
type CategoryItemResponse = {
  id: string;
  name: string;
  main_topic?: string;
};

type CategoriesPageResponse = {
  data: CategoryItemResponse[];
};

type AuthorBadgeResponse = {
  actor_id?: string | null;
  display_name: string;
  role_label: string;
  avatar_url?: string | null;
  is_registered: boolean;
};

type PublicPostItemResponse = {
  id: string;
  category_id: string;
  content: string;
  image_url: string | null;
  media_urls?: string[];
  author: AuthorBadgeResponse;
  reactions_summary: {
    LIKE: number;
    SUPPORT: number;
    THANKS: number;
  };
  comments_count: number;
  viewer_reactions?: ForumReactionType[];
  is_bookmarked?: boolean;
  created_at: string;
};

type PostsPageResponse = {
  data: PublicPostItemResponse[];
};

type ToggleReactionResponse = {
  post_id: string;
  type: string;
  active: boolean;
};

type ToggleBookmarkResponse = {
  post_id: string;
  bookmarked: boolean;
};

type DeletedResourceResponse = {
  id: string;
  deleted: boolean;
};

type ModerationPendingItemResponse = {
  id: string;
  item_type: 'POST' | 'COMMENT';
  content: string;
  author: AuthorBadgeResponse;
  created_at: string;
};

type ModerationPendingPageResponse = {
  data: ModerationPendingItemResponse[];
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MODERATOR: 'Moderador',
  VOLUNTARIO: 'Voluntario',
  ACUDIENTE: 'Acudiente',
  BENEFICIARIO: 'Beneficiario',
  INVERSOR: 'Inversor',
  VISITANTE: 'Visitante',
};

type CategoryLookup = {
  byCode: Partial<Record<ForumCategory, string>>;
  byId: Record<string, ForumCategory>;
};

export function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'AS';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatRelativeTime(isoDate: string, nowMs = Date.now()): string {
  const createdMs = Date.parse(isoDate);
  if (Number.isNaN(createdMs)) {
    return 'Reciente';
  }
  const diffSeconds = Math.max(0, Math.floor((nowMs - createdMs) / 1000));
  if (diffSeconds < 60) {
    return 'Ahora';
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

function toForumError(error: unknown): Error {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return new Error('sessionExpired');
    }
    if (error.status === 403) {
      return new Error('forbidden');
    }
    if (error.status === 404) {
      return new Error('notFound');
    }
    if (error.status === 409) {
      return new Error('reportConflict');
    }
  }
  return new Error('network');
}

function toForumPost(item: PublicPostItemResponse, lookup: CategoryLookup): ForumPost {
  const category = lookup.byId[item.category_id] ?? 'guides';
  const imageUri = item.media_urls?.[0] ?? item.image_url;
  const likeCount =
    (item.reactions_summary?.LIKE ?? 0) +
    (item.reactions_summary?.SUPPORT ?? 0) +
    (item.reactions_summary?.THANKS ?? 0);

  if (Array.isArray(item.viewer_reactions)) {
    rememberReaction(`post:${item.id}`, item.viewer_reactions.includes('LIKE'));
  }

  return {
    id: item.id,
    category,
    author: {
      id: item.author.actor_id ?? item.author.display_name,
      profileId: item.author.actor_id ?? null,
      name: item.author.display_name,
      initials: toInitials(item.author.display_name),
      roleLabel: ROLE_LABELS[item.author.role_label] ?? item.author.role_label,
      avatarUri: getAvatarPhotoUrl(item.author.avatar_url),
    },
    publishedAtLabel: formatRelativeTime(item.created_at),
    content: item.content,
    media: imageUri
      ? {
          kind: 'image',
          uri: imageUri,
          accessibilityLabel: `Imagen publicada por ${item.author.display_name}`,
        }
      : null,
    likeCount,
    commentCount: item.comments_count,
    ...(item.viewer_reactions !== undefined ? { viewerReactions: item.viewer_reactions } : {}),
    ...(item.is_bookmarked !== undefined ? { isBookmarked: item.is_bookmarked } : {}),
  };
}

export function createForumService(client: HttpClient): ForumRepository {
  let cachedCategories: CategoryLookup | null = null;

  async function loadCategories(): Promise<CategoryLookup> {
    if (cachedCategories !== null) {
      return cachedCategories;
    }
    const page = await client.request<CategoriesPageResponse>('/categories?page=1&limit=50');
    const byCode: Partial<Record<ForumCategory, string>> = {};
    const byId: Record<string, ForumCategory> = {};

    for (const item of page.data) {
      const code = toCategoryCode(item.name, item.main_topic);
      if (code !== null) {
        byCode[code] = item.id;
        byId[item.id] = code;
      }
    }

    cachedCategories = { byCode, byId };
    return cachedCategories;
  }

  return {
    async listPosts({ filter, feed, search }) {
      try {
        const lookup = await loadCategories();
        let query = '/posts?page=1&limit=20';
        if (feed === 'following') {
          query += '&feed=following';
        }
        const trimmedSearch = search?.trim() ?? '';
        if (trimmedSearch.length > 0) {
          query += `&search=${encodeURIComponent(trimmedSearch)}`;
        }
        if (filter !== 'all') {
          const categoryId = lookup.byCode[filter];
          if (categoryId === undefined) {
            return [];
          }
          query += `&categoryId=${encodeURIComponent(categoryId)}`;
        }

        const page = await client.request<PostsPageResponse>(query);
        return page.data
          .filter((item) => !isRemovedByAuthor(item.author.avatar_url, 'post', item.id))
          .map((item) => toForumPost(item, lookup));
      } catch (error) {
        throw toForumError(error);
      }
    },

    async getPostById(postId) {
      try {
        const [lookup, item] = await Promise.all([
          loadCategories(),
          client.request<PublicPostItemResponse>(`/posts/${encodeURIComponent(postId)}`),
        ]);
        return toForumPost(item, lookup);
      } catch (error) {
        throw toForumError(error);
      }
    },

    async toggleLike(postId) {
      try {
        const result = await client.request<ToggleReactionResponse>(`/posts/${postId}/reactions`, {
          method: 'POST',
          body: { type: 'LIKE' },
        });
        return result.active;
      } catch (error) {
        throw toForumError(error);
      }
    },

    async toggleBookmark(postId) {
      try {
        const result = await client.request<ToggleBookmarkResponse>(
          `/posts/${encodeURIComponent(postId)}/bookmarks`,
          {
            method: 'POST',
          },
        );
        return result.bookmarked;
      } catch (error) {
        throw toForumError(error);
      }
    },

    async deletePost(postId) {
      try {
        const result = await client.request<DeletedResourceResponse>(
          `/posts/${encodeURIComponent(postId)}`,
          {
            method: 'DELETE',
          },
        );
        return result.deleted;
      } catch (error) {
        throw toForumError(error);
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
        throw toForumError(error);
      }
    },

    async listPendingModeration(): Promise<ModerationPendingItem[]> {
      try {
        const page = await client.request<ModerationPendingPageResponse>(
          '/admin/moderation/pending?page=1&limit=50',
        );
        return page.data.map((item) => ({
          id: item.id,
          itemType: item.item_type,
          content: item.content,
          authorDisplayName: item.author.display_name,
          createdAt: item.created_at,
        }));
      } catch (error) {
        throw toForumError(error);
      }
    },

    async moderateItem(id, itemType, status) {
      try {
        const resource = itemType === 'POST' ? 'posts' : 'comments';
        await client.request(`/admin/moderation/${resource}/${id}/status`, {
          method: 'PATCH',
          body: { status },
        });
      } catch (error) {
        throw toForumError(error);
      }
    },
  };
}
