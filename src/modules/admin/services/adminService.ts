import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import type { HttpClient } from '@/shared/lib/http';
import { HttpError } from '@/shared/lib/http';

type ApiAuthorDto = {
  display_name: string;
  role_label: string;
  is_registered: boolean;
};

type ApiPendingItemDto = {
  id: string;
  item_type: 'POST' | 'COMMENT';
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

type ApiModeratorDto = {
  id: string;
  username: string;
  email: string;
  rol: string;
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
            author: {
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

    listModerators() {
      return request(async () => {
        const moderators = await client.request<ApiModeratorDto[]>('/admin/moderators');
        return moderators.map((moderator) => ({
          id: moderator.id,
          username: moderator.username,
          email: moderator.email,
          role: moderator.rol,
        }));
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
