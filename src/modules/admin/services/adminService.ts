import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import { parseRemovalRequest } from '@/modules/removal';
import type { HttpClient } from '@/shared/lib/http';
import { HttpError } from '@/shared/lib/http';

type ApiAuthorDto = {
  actor_id?: string | null;
  display_name: string;
  role_label: string;
  is_registered: boolean;
};

type ApiPendingItemDto = {
  id: string;
  item_type: 'POST' | 'COMMENT';
  post_id?: string | null;
  content: string;
  image_url?: string | null;
  author: ApiAuthorDto;
  created_at: string;
};

type ApiPendingPageDto = {
  data: ApiPendingItemDto[];
  meta: {
    page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
  };
};

type ApiContentPageDto = {
  data: { id: string; content: string; author: ApiAuthorDto }[];
};

type ApiModeratorDto = {
  id: string;
  username: string;
  email: string;
  rol: string;
  local_role?: string | null;
  display_name?: string | null;
};

function toAdminError(error: unknown): AdminError {
  if (error instanceof AdminError) {
    return error;
  }
  if (!(error instanceof HttpError)) {
    return new AdminError('unknown');
  }

  switch (error.status) {
    case null:
    case 502:
      return new AdminError('network');
    case 400:
      return new AdminError('invalidInput');
    case 403:
      return new AdminError('forbidden');
    case 404:
      return new AdminError('notFound');
    case 409:
      return new AdminError('conflict');
    default:
      return new AdminError('unknown');
  }
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toAdminError(error);
  }
}

function toModeratorAccount(account: ApiModeratorDto) {
  return {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.rol,
    ...(account.local_role !== undefined ? { localRole: account.local_role } : {}),
    ...(account.display_name !== undefined ? { displayName: account.display_name } : {}),
  };
}

export function createAdminService(client: HttpClient): AdminService {
  return {
    listPending(page, filter) {
      const typeQuery = filter === 'ALL' ? '' : `&type=${filter}`;
      return request(async () => {
        const response = await client.request<ApiPendingPageDto>(
          `/admin/moderation/pending?page=${page}&limit=20${typeQuery}`,
        );
        return {
          items: response.data.map((item) => ({
            id: item.id,
            itemType: item.item_type,
            content: item.content,
            imageUrl: item.image_url ?? null,
            postId: item.post_id ?? null,
            removalRequest: item.item_type === 'COMMENT' ? parseRemovalRequest(item.content) : null,
            author: {
              actorId: item.author.actor_id ?? null,
              displayName: item.author.display_name,
              roleLabel: item.author.role_label,
              isRegistered: item.author.is_registered,
            },
            createdAt: item.created_at,
          })),
          page: response.meta.page,
          totalItems: response.meta.total_items,
          totalPages: response.meta.total_pages,
          hasNextPage: response.meta.has_next_page,
        };
      });
    },

    updateModerationStatus(id, itemType, status) {
      const pathType = itemType === 'POST' ? 'posts' : 'comments';
      return request(async () => {
        await client.request(`/admin/moderation/${pathType}/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: { status },
        });
      });
    },

    // Finds what a removal request points to and whether whoever asked is its author.
    getRemovalTarget(item) {
      return request(async () => {
        const removal = item.removalRequest;
        const postId = item.postId;
        const actorId = item.author.actorId ?? null;
        // The queue does not always include the actor id, so the username also identifies them.
        const isRequester = (author: ApiAuthorDto) =>
          (actorId !== null && author.actor_id === actorId) ||
          author.display_name === item.author.displayName;
        if (!removal || !postId) {
          return { content: null, isRequestedByAuthor: false };
        }

        if (removal.kind === 'comment') {
          const page = await client.request<ApiContentPageDto>(
            `/posts/${encodeURIComponent(postId)}/comments?page=1&limit=50`,
          );
          const comment = page.data.find((entry) => entry.id === removal.commentId);
          return {
            content: comment?.content ?? null,
            isRequestedByAuthor: comment !== undefined && isRequester(comment.author),
          };
        }

        const ownPosts =
          actorId !== null
            ? await client.request<ApiContentPageDto>(
                `/actors/${encodeURIComponent(actorId)}/posts?page=1&limit=50`,
              )
            : null;
        const ownPost = ownPosts?.data.find((entry) => entry.id === postId);
        if (ownPost !== undefined) {
          return { content: ownPost.content, isRequestedByAuthor: true };
        }
        const feed = await client.request<ApiContentPageDto>('/posts?page=1&limit=50');
        const post = feed.data.find((entry) => entry.id === postId);
        return {
          content: post?.content ?? null,
          isRequestedByAuthor: post !== undefined && isRequester(post.author),
        };
      });
    },

    listModerators() {
      return request(async () => {
        const moderators = await client.request<ApiModeratorDto[]>('/admin/moderators');
        return moderators.map(toModeratorAccount);
      });
    },

    searchAccounts(query) {
      return request(async () => {
        const accounts = await client.request<ApiModeratorDto[]>(
          `/admin/accounts?search=${encodeURIComponent(query.trim())}`,
        );
        return accounts.map(toModeratorAccount);
      });
    },

    assignModerator(userAccountId) {
      return request(async () => {
        await client.request(`/admin/moderators/${encodeURIComponent(userAccountId)}`, {
          method: 'PUT',
        });
      });
    },

    revokeModerator(userAccountId) {
      return request(async () => {
        await client.request(`/admin/moderators/${encodeURIComponent(userAccountId)}`, {
          method: 'DELETE',
        });
      });
    },
  };
}
