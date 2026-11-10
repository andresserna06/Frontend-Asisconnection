import type { RoleCode } from '@/shared/domain/models/RoleCode';

export type PublicProfile = {
  id: string;
  username: string;
  fullName: string;
  roles: RoleCode[];
  photoUrl: string | null;
  shortBio: string | null;
  birthDate: string | null;
  city: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
};
