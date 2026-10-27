import type { RoleCode } from '@/modules/auth';

// The signed-in person's own profile. Every field is visible only to them (Ley 1581):
// what others see is decided in Settings. Shape follows docs/api-profile.md.
export type MyProfile = {
  id: string;
  fullName: string;
  roles: RoleCode[];
  photoUrl: string | null;
  email: string;
  // ISO date (YYYY-MM-DD), or null if the person did not add it.
  birthDate: string | null;
  city: string | null;
  // ISO date the account was created.
  memberSince: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  savedCount: number;
};
