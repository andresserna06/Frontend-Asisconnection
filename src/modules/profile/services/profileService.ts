import { ROLES } from '@/modules/auth';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import type { ProfileService, UpdateProfileInput } from '@/modules/profile/domain/ProfileService';
import { type CategoryCode, toCategoryCode } from '@/shared/domain/models/CategoryCode';
import type { Post } from '@/shared/domain/models/Post';
import type { RoleCode } from '@/shared/domain/models/RoleCode';
import { type HttpClient, HttpError } from '@/shared/lib/http';

type ActorProfileResponse = {
  id: string;
  user_account_id: string;
  username: string;
  email?: string | null;
  primary_role: string;
  first_names: string | null;
  last_names: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  birth_date?: string | null;
  city?: string | null;
  show_email?: boolean;
  show_birth_date?: boolean;
  show_city?: boolean;
  require_follow_approval?: boolean;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  created_at: string;
};

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

function isRoleCode(value: string): value is RoleCode {
  return Object.prototype.hasOwnProperty.call(ROLES, value);
}

function toRoleCodes(primaryRole: string): RoleCode[] {
  return isRoleCode(primaryRole) ? [primaryRole] : ['ACUDIENTE'];
}

function toProfileError(error: unknown): ProfileError {
  return new ProfileError(
    error instanceof HttpError && (error.status === null || error.status === 502)
      ? 'network'
      : 'unknown',
  );
}

function toPost(item: PublicPostItemResponse, categoriesById: Record<string, CategoryCode>): Post {
  const imageUrl = item.media_urls?.[0] ?? item.image_url;
  const likeCount =
    (item.reactions_summary?.LIKE ?? 0) +
    (item.reactions_summary?.SUPPORT ?? 0) +
    (item.reactions_summary?.THANKS ?? 0);

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
      roles: toRoleCodes(item.author.role_label),
      photoUrl: item.author.avatar_url ?? null,
    },
  };
}

export function createProfileService(client: HttpClient): ProfileService {
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

  function toMyProfile(actor: ActorProfileResponse): MyProfile {
    const fullName =
      [actor.first_names, actor.last_names].filter(Boolean).join(' ').trim() || actor.username;

    return {
      id: actor.id,
      fullName,
      roles: toRoleCodes(actor.primary_role),
      photoUrl: actor.avatar_url,
      email: actor.email ?? 'Sin agregar',
      birthDate: actor.birth_date ?? null,
      city: actor.city ?? null,
      memberSince: actor.created_at,
      postCount: actor.posts_count ?? 0,
      followerCount: actor.followers_count ?? 0,
      followingCount: actor.following_count ?? 0,
      savedCount: 0,
      shortBio: actor.short_bio ?? null,
      showEmail: actor.show_email ?? false,
      showBirthDate: actor.show_birth_date ?? false,
      showCity: actor.show_city ?? false,
      requireFollowApproval: actor.require_follow_approval ?? false,
    };
  }

  return {
    async getMyProfile() {
      try {
        const actor = await client.request<ActorProfileResponse>('/actors/me');
        return toMyProfile(actor);
      } catch (error) {
        throw toProfileError(error);
      }
    },

    async updateMyProfile(input: UpdateProfileInput) {
      try {
        const actor = await client.request<ActorProfileResponse>('/actors/me', {
          method: 'PATCH',
          body: {
            ...(input.firstNames !== undefined ? { first_names: input.firstNames } : {}),
            ...(input.lastNames !== undefined ? { last_names: input.lastNames } : {}),
            ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
            ...(input.shortBio !== undefined ? { short_bio: input.shortBio } : {}),
            ...(input.birthDate !== undefined ? { birth_date: input.birthDate } : {}),
            ...(input.city !== undefined ? { city: input.city } : {}),
            ...(input.showEmail !== undefined ? { show_email: input.showEmail } : {}),
            ...(input.showBirthDate !== undefined ? { show_birth_date: input.showBirthDate } : {}),
            ...(input.showCity !== undefined ? { show_city: input.showCity } : {}),
            ...(input.requireFollowApproval !== undefined
              ? { require_follow_approval: input.requireFollowApproval }
              : {}),
          },
        });
        return toMyProfile(actor);
      } catch (error) {
        throw toProfileError(error);
      }
    },

    async getMyPosts() {
      try {
        const [categoriesById, page] = await Promise.all([
          loadCategoriesById(),
          client.request<PostsPageResponse>('/actors/me/posts?page=1&limit=20'),
        ]);
        return page.data.map((item) => toPost(item, categoriesById));
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }
        throw toProfileError(error);
      }
    },

    async getMySavedPosts() {
      return [];
    },
  };
}
