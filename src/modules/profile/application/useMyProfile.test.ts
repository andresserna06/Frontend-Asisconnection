import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  createFakeProfileService,
  TEST_POST,
  TEST_PROFILE,
  TEST_SAVED_POST,
} from '@/modules/profile/testUtils';

import { useMyProfile } from './useMyProfile';

describe('useMyProfile', () => {
  it('loads the profile and the own posts first', async () => {
    const service = createFakeProfileService();
    const { result } = await renderHook(() => useMyProfile(service));

    await waitFor(() => expect(result.current.posts.status).toBe('success'));
    expect(result.current.profile).toMatchObject({ status: 'success', data: TEST_PROFILE });
    expect(result.current.posts).toMatchObject({ data: [TEST_POST] });
    expect(result.current.activeTab).toBe('posts');
    expect(service.getMySavedPosts).not.toHaveBeenCalled();
  });

  it('loads the saved posts when that tab is selected', async () => {
    const service = createFakeProfileService();
    const { result } = await renderHook(() => useMyProfile(service));
    await waitFor(() => expect(result.current.posts.status).toBe('success'));

    await act(() => result.current.selectTab('saved'));
    await waitFor(() => expect(result.current.posts).toMatchObject({ data: [TEST_SAVED_POST] }));
    expect(result.current.activeTab).toBe('saved');
  });

  it('keeps the profile when only the list fails', async () => {
    const service = createFakeProfileService({
      getMyPosts: jest.fn(async () => Promise.reject(new Error('offline'))),
    });
    const { result } = await renderHook(() => useMyProfile(service));

    await waitFor(() => expect(result.current.posts.status).toBe('error'));
    expect(result.current.profile.status).toBe('success');
  });
});
