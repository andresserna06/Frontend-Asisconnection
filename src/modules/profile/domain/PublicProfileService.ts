import type { CreateContentReportInput } from '@/shared/domain/models/ContentReport';
import type { Post } from '@/shared/domain/models/Post';
import type { RoleCode } from '@/shared/domain/models/RoleCode';

import type { ActorConnectionItem, PublicProfile } from './models/PublicProfile';

export type ProfileConnectionStatus =
  'notFollowing' | 'pending' | 'pendingIncoming' | 'following' | 'blocked';

export type SearchActorsQuery = {
  search?: string;
  role?: RoleCode;
  page?: number;
  limit?: number;
};

export type ListConnectionsQuery = {
  status?: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  direction?: 'incoming' | 'outgoing' | 'all';
  page?: number;
  limit?: number;
};

export type UpdateOwnPostResult = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
};

export type PublicProfileService = {
  getPublicProfile(actorId: string): Promise<PublicProfile>;
  getConnectionStatus(actorId: string): Promise<ProfileConnectionStatus>;
  requestFollow(actorId: string): Promise<ProfileConnectionStatus>;
  requestUnfollow?(actorId: string): Promise<ProfileConnectionStatus>;
  acceptFollowRequest?(actorId: string): Promise<ProfileConnectionStatus>;
  getActorPosts?(actorId: string): Promise<Post[]>;
  getPostById?(postId: string): Promise<Post | null>;
  updatePost?(
    postId: string,
    input: { content: string; mediaUrls?: string[] },
  ): Promise<UpdateOwnPostResult>;
  deletePost?(postId: string): Promise<boolean>;
  toggleBookmark?(postId: string): Promise<boolean>;
  reportPost?(input: CreateContentReportInput): Promise<void>;
  getMyFollowers?(): Promise<PublicProfile[]>;
  getMyFollowing?(): Promise<PublicProfile[]>;
  getActorFollowers?(actorId: string, page?: number, limit?: number): Promise<PublicProfile[]>;
  getActorFollowing?(actorId: string, page?: number, limit?: number): Promise<PublicProfile[]>;
  searchActors?(query?: SearchActorsQuery): Promise<PublicProfile[]>;
  getMyConnections?(query?: ListConnectionsQuery): Promise<ActorConnectionItem[]>;
  acceptConnection?(connectionId: string): Promise<void>;
  deleteConnection?(connectionId: string): Promise<void>;
};
