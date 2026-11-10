import { ROLES } from '@/modules/auth';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import type { ProfileService, UpdateProfileInput } from '@/modules/profile/domain/ProfileService';
import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';
import { type CategoryCode, toCategoryCode } from '@/shared/domain/models/CategoryCode';
import type { Post } from '@/shared/domain/models/Post';
import type { RoleCode } from '@/shared/domain/models/RoleCode';
import {
  countPostsRemovedByAuthor,
  getAvatarPhotoUrl,
  isRemovedByAuthor,
  replaceAvatarPhoto,
} from '@/shared/lib/authorRemovalMarks';
import { type HttpClient, HttpError } from '@/shared/lib/http';
import { uploadMedia } from '@/shared/lib/uploadMedia';

import { countUnfollowedActors } from './localUnfollowState';

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

type ActorConnectionResponse = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
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
  // The backend seeds newly registered actors with the Swagger example ("María Gómez")
  // before the user edits their profile; fall back to their chosen username in that case.
  if (normalizedJoined === 'maria gomez' && !normalizedUsername.startsWith('maria')) {
    return actor.username;
  }
  return joined;
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
      photoUrl: normalizeAvatarUrl(item.author.avatar_url),
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
    const fullName = resolveActorFullName(actor);

    return {
      id: actor.id,
      fullName,
      roles: toRoleCodes(actor.primary_role),
      photoUrl: normalizeAvatarUrl(actor.avatar_url),
      email: actor.email ?? 'Sin agregar',
      birthDate: actor.birth_date ?? null,
      city: actor.city ?? null,
      memberSince: actor.created_at,
      postCount: Math.max(
        0,
        (actor.posts_count ?? 0) - countPostsRemovedByAuthor(actor.avatar_url),
      ),
      followerCount: actor.followers_count ?? 0,
      followingCount: Math.max(0, (actor.following_count ?? 0) - countUnfollowedActors()),
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
        // A new photo must not bring back the content its owner removed.
        const avatarUrl =
          input.avatarUrl !== undefined
            ? replaceAvatarPhoto(
                (await client.request<ActorProfileResponse>('/actors/me')).avatar_url,
                input.avatarUrl,
              )
            : undefined;
        const actor = await client.request<ActorProfileResponse>('/actors/me', {
          method: 'PATCH',
          body: {
            ...(input.firstNames !== undefined ? { first_names: input.firstNames } : {}),
            ...(input.lastNames !== undefined ? { last_names: input.lastNames } : {}),
            ...(input.avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
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

    async getPublicProfile(actorId: string) {
      try {
        const actor = await client.request<ActorProfileResponse>(`/actors/${actorId}`);
        return toMyProfile(actor);
      } catch (error) {
        throw toProfileError(error);
      }
    },

    async followActor(actorId: string) {
      try {
        return await client.request<ActorConnectionResponse>('/connections', {
          method: 'POST',
          body: { receiver_actor_id: actorId },
        });
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
        return page.data
          .filter((item) => !isRemovedByAuthor(item.author.avatar_url, 'post', item.id))
          .map((item) => toPost(item, categoriesById));
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }
        throw toProfileError(error);
      }
    },

    async getActorPosts(actorId: string) {
      try {
        const [categoriesById, page] = await Promise.all([
          loadCategoriesById(),
          client.request<PostsPageResponse>(`/actors/${actorId}/posts?page=1&limit=20`),
        ]);
        return page.data
          .filter((item) => !isRemovedByAuthor(item.author.avatar_url, 'post', item.id))
          .map((item) => toPost(item, categoriesById));
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return [];
        }
        throw toProfileError(error);
      }
    },

    async uploadAvatar(media: LocalMediaFile) {
      try {
        return await uploadMedia(client, media);
      } catch (error) {
        throw toProfileError(error);
      }
    },
  };
}
