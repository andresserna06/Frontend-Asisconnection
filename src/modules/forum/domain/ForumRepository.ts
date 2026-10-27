import type { ForumFilter } from './models/ForumCategory';
import type { ForumPost } from './models/ForumPost';

export type ForumFeedRequest = {
  filter: ForumFilter;
};

// El servicio implementa este contrato cuando el backend publique sus endpoints.
export type ForumRepository = {
  listPosts(request: ForumFeedRequest): Promise<ForumPost[]>;
};
