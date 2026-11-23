import type { CategoryCode } from '@/shared/domain/models/CategoryCode';
import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';
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

export type MySubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MyPostSubmission = {
  id: string;
  category: CategoryCode;
  content: string;
  imageUrl: string | null;
  mediaUrls: string[];
  status: MySubmissionStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostMutationResult = {
  id: string;
  status: MySubmissionStatus;
  message: string;
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
  getMySavedPosts?(): Promise<Post[]>;
  getMySubmissions?(status?: MySubmissionStatus): Promise<MyPostSubmission[]>;
  updatePost?(
    postId: string,
    input: { content: string; mediaUrls?: string[] },
  ): Promise<PostMutationResult>;
  deletePost?(postId: string): Promise<boolean>;
  toggleBookmark?(postId: string): Promise<boolean>;
  uploadAvatar?(media: LocalMediaFile): Promise<string>;
};
