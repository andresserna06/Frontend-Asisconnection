import type { Post } from '@/modules/posts';
import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { ProfileService } from '@/modules/profile/domain/ProfileService';
import { type HttpClient, HttpError } from '@/shared/lib/http';

// Expected contract (docs/api-profile.md): these endpoints do not exist in the backend yet.
// When SAGA UP publishes them, adjust only the paths and response types here.
const PATHS = {
  profile: '/usuarios/me',
  posts: '/usuarios/me/publicaciones',
  saved: '/usuarios/me/guardados',
} as const;

type ProfileResponse = MyProfile;
type PostListResponse = Post[];

function toProfileError(error: unknown): ProfileError {
  return new ProfileError(
    error instanceof HttpError && error.status === null ? 'network' : 'unknown',
  );
}

export function createProfileService(client: HttpClient): ProfileService {
  async function get<T>(path: string): Promise<T> {
    try {
      return await client.request<T>(path);
    } catch (error) {
      throw toProfileError(error);
    }
  }

  return {
    getMyProfile: () => get<ProfileResponse>(PATHS.profile),
    getMyPosts: () => get<PostListResponse>(PATHS.posts),
    getMySavedPosts: () => get<PostListResponse>(PATHS.saved),
  };
}
