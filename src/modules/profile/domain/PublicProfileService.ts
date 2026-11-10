import type { Post } from '@/shared/domain/models/Post';
import type { PublicProfile } from './models/PublicProfile';

export type ProfileConnectionStatus = 'notFollowing' | 'pending' | 'following' | 'blocked';

export type PublicProfileService = {
  getPublicProfile(actorId: string): Promise<PublicProfile>;
  getConnectionStatus(actorId: string): Promise<ProfileConnectionStatus>;
  requestFollow(actorId: string): Promise<ProfileConnectionStatus>;
  requestUnfollow?(actorId: string): Promise<ProfileConnectionStatus>;
  getActorPosts?(actorId: string): Promise<Post[]>;
  getMyFollowers?(): Promise<PublicProfile[]>;
};
