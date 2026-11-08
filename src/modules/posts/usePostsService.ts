import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { PostsService } from '@/modules/posts/domain/PostsService';

import { createPostsService } from './services/postsService';

// Composition root of the posts module: wires the HTTP service with the authorized client.
export function usePostsService(): PostsService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createPostsService(client), [client]);
}
