import type { Post } from '@/modules/posts';
import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import type { ProfileService } from '@/modules/profile/domain/ProfileService';

// Test doubles for the profile module (fictitious data). Only imported from *.test.ts(x).

export const TEST_PROFILE: MyProfile = {
  id: 'user-1',
  fullName: 'Persona Prueba',
  roles: ['ACUDIENTE'],
  photoUrl: null,
  email: 'persona@prueba.com',
  birthDate: '1988-05-14',
  city: 'Manizales',
  memberSince: '2026-03-01',
  postCount: 1,
  followerCount: 38,
  followingCount: 21,
  savedCount: 1,
};

export const TEST_POST: Post = {
  id: 'post-1',
  category: 'achievements',
  text: 'Texto de una publicación propia.',
  imageUrl: null,
  imageDescription: null,
  createdAt: '2026-10-24T12:00:00Z',
  likeCount: 61,
  commentCount: 23,
  author: { id: 'user-1', fullName: 'Persona Prueba', roles: ['ACUDIENTE'], photoUrl: null },
};

export const TEST_SAVED_POST: Post = {
  id: 'post-2',
  category: 'guides',
  text: 'Texto de una publicación guardada.',
  imageUrl: 'https://example.test/foto.jpg',
  imageDescription: 'Foto de ejemplo',
  createdAt: '2026-10-26T09:00:00Z',
  likeCount: 74,
  commentCount: 12,
  author: { id: 'user-2', fullName: 'Otra Persona', roles: ['TALLERISTA'], photoUrl: null },
};

export function createFakeProfileService(overrides: Partial<ProfileService> = {}) {
  return {
    getMyProfile: jest.fn<Promise<MyProfile>, []>(async () => TEST_PROFILE),
    getMyPosts: jest.fn<Promise<Post[]>, []>(async () => [TEST_POST]),
    getMySavedPosts: jest.fn<Promise<Post[]>, []>(async () => [TEST_SAVED_POST]),
    ...overrides,
  };
}
