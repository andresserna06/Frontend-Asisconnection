import type { Post } from '@/shared/domain/models/Post';
import type { MyProfile } from './models/MyProfile';

// Contract implemented by the services layer (HTTP). Methods reject with ProfileError.
export type ProfileService = {
  getMyProfile(): Promise<MyProfile>;
  // Newest first.
  getMyPosts(): Promise<Post[]>;
  // Private: never shown to anyone else.
  getMySavedPosts(): Promise<Post[]>;
};
