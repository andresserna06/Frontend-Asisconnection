import type { CategoryCode } from '@/modules/posts/domain/models/Category';
import {
  PostsError,
  type PostSubmissionStatus,
} from '@/modules/posts/domain/models/PostSubmission';
import type { PostsService } from '@/modules/posts/domain/PostsService';
import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';
import { toCategoryCode } from '@/shared/domain/models/CategoryCode';
import { type HttpClient, HttpError } from '@/shared/lib/http';
import { uploadMedia } from '@/shared/lib/uploadMedia';

type CategoryItemResponse = {
  id: string;
  name: string;
  main_topic?: string;
};

type CategoriesPageResponse = {
  data: CategoryItemResponse[];
};

type PendingSubmissionResponse = {
  id: string;
  status: PostSubmissionStatus;
  rejection_reason?: string | null;
  message: string;
  created_at: string;
};

type ProblemDetailsResponse = {
  detail?: string;
} | null;

function toPostsHttpError(error: unknown): PostsError {
  if (!(error instanceof HttpError)) {
    return error instanceof PostsError ? error : new PostsError('unknown');
  }
  const detail = (error.body as ProblemDetailsResponse)?.detail;
  switch (error.status) {
    case null:
    case 502:
      return new PostsError('network', detail);
    case 400:
    case 404:
      return new PostsError('validation', detail);
    case 401:
      return new PostsError('sessionExpired', detail);
    case 403:
      return new PostsError('forbidden', detail);
    case 429:
      return new PostsError('rateLimited', detail);
    default:
      return new PostsError('unknown', detail);
  }
}

export function createPostsService(client: HttpClient): PostsService {
  let cachedCategories: Partial<Record<CategoryCode, string>> | null = null;

  async function resolveCategoryId(category: CategoryCode): Promise<string> {
    if (cachedCategories === null) {
      const page = await client.request<CategoriesPageResponse>('/categories?page=1&limit=50');
      const map: Partial<Record<CategoryCode, string>> = {};
      for (const item of page.data) {
        const code = toCategoryCode(item.name, item.main_topic);
        if (code !== null) {
          map[code] = item.id;
        }
      }
      cachedCategories = map;
    }

    const categoryId = cachedCategories[category];
    if (categoryId === undefined) {
      throw new PostsError('validation');
    }
    return categoryId;
  }

  return {
    async createPost({ category, content, mediaUrls }) {
      try {
        const categoryId = await resolveCategoryId(category);
        const response = await client.request<PendingSubmissionResponse>('/posts', {
          method: 'POST',
          body: {
            category_id: categoryId,
            content,
            ...(mediaUrls && mediaUrls.length > 0 ? { media_urls: mediaUrls } : {}),
          },
        });
        return {
          id: response.id,
          status: response.status,
          message: response.message,
        };
      } catch (error) {
        throw toPostsHttpError(error);
      }
    },

    async uploadMedia(media: LocalMediaFile) {
      try {
        return await uploadMedia(client, media);
      } catch (error) {
        throw toPostsHttpError(error);
      }
    },
  };
}
