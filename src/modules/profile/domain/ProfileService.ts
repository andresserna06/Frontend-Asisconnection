import type { Post } from '@/shared/domain/models/Post';
import type { MyProfile } from './models/MyProfile';

export type UpdateProfileInput = {
  firstNames?: string;
  lastNames?: string;
  avatarUrl?: string | null;
  shortBio?: string | null;
  birthDate?: string | null;
  city?: string | null;
  showEmail?: boolean;
  showBirthDate?: boolean;
  showCity?: boolean;
  requireFollowApproval?: boolean;
};

export type ActorConnectionResult = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
};

// Contract implemented by the services layer (HTTP). Methods reject with ProfileError.
export type ProfileService = {
  getMyProfile(): Promise<MyProfile>;
  updateMyProfile?(input: UpdateProfileInput): Promise<MyProfile>;
  getPublicProfile?(actorId: string): Promise<MyProfile>;
  followActor?(actorId: string): Promise<ActorConnectionResult>;
  // Newest first.
  getMyPosts(): Promise<Post[]>;
  getActorPosts?(actorId: string): Promise<Post[]>;
  uploadAvatar?(localUri: string): Promise<string>;
  // Private: never shown to anyone else.
  getMySavedPosts(): Promise<Post[]>;
};
