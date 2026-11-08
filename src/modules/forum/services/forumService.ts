import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';
import type { ForumCategory } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import { toCategoryCode } from '@/shared/domain/models/CategoryCode';
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

  return {
    id: item.id,
    category,
    author: {
      id: item.author.actor_id ?? item.author.display_name,
      name: item.author.display_name,
      initials: toInitials(item.author.display_name),
      roleLabel: ROLE_LABELS[item.author.role_label] ?? item.author.role_label,
      avatarUri: item.author.avatar_url ?? null,
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
    async listPosts({ filter }) {
      try {
        const lookup = await loadCategories();
        let query = '/posts?page=1&limit=20';
        if (filter !== 'all') {
          const categoryId = lookup.byCode[filter];
          if (categoryId === undefined) {
            return [];
          }
          query += `&categoryId=${encodeURIComponent(categoryId)}`;
        }

        const page = await client.request<PostsPageResponse>(query);
        return page.data.map((item) => toForumPost(item, lookup));
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
  };
}
