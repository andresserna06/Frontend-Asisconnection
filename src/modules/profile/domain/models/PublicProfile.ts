import type { RoleCode } from '@/shared/domain/models/RoleCode';

export type ViewerConnection = {
  connectionId: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  direction: 'OUTGOING' | 'INCOMING';
};

export type PublicProfile = {
  id: string;
  username: string;
  fullName: string;
  roles: RoleCode[];
  photoUrl: string | null;
  shortBio: string | null;
  email: string | null;
  birthDate: string | null;
  city: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
  viewerConnection?: ViewerConnection | null;
};

export type ConnectionPeerActor = {
  actorId: string;
  username: string;
  displayName: string;
  roles: RoleCode[];
  photoUrl: string | null;
};

export type ActorConnectionItem = {
  id: string;
  requesterActorId: string;
  receiverActorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  requestedAt: string;
  acceptedAt: string | null;
  peerActor: ConnectionPeerActor | null;
};
