import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { AdminEcosystemLink } from '@/modules/admin/domain/models/AdminEcosystemLink';
import type { AdminFaqItem } from '@/modules/admin/domain/models/AdminFaqItem';
import type { ContentReportStatus } from '@/modules/admin/domain/models/ContentReportItem';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import { parseRemovalRequest } from '@/modules/removal';
import type {
  ContentReportReason,
  ContentReportTargetType,
} from '@/shared/domain/models/ContentReport';
import {
  applyEcosystemLinkOverrides,
  applyFaqOverrides,
  normalizeProjectKey,
  removeEcosystemLinkOverride,
  removeFaqOverride,
  saveEcosystemLinkOverride,
  saveFaqOverride,
} from '@/shared/lib/adminCatalogOverrides';
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

type ApiContentReportItemDto = {
  id: string;
  target_type: ContentReportTargetType;
  target_id: string;
  target_content_preview?: string | null;
  reason: ContentReportReason;
  details?: string | null;
  status: ContentReportStatus;
  resolved_at?: string | null;
  created_at: string;
};

type ApiContentReportsPageDto = {
  data: ApiContentReportItemDto[];
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

type ApiFaqItemDto = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

type ApiFaqPageDto = {
  disclaimer?: string;
  data: ApiFaqItemDto[];
};

type ApiRedirectionLinkItemDto = {
  id: string;
  project_name: string;
  url: string;
  description: string;
};

type ApiRedirectionLinksPageDto = {
  data: ApiRedirectionLinkItemDto[];
};

const DEFAULT_ECOSYSTEM_PROJECTS: AdminEcosystemLink[] = [
  {
    id: 'suma21',
    projectName: 'SUMA 21',
    url: 'https://suma21-frontend.onrender.com',
    description: 'Donaciones y financiación',
  },
  {
    id: 'aulaup',
    projectName: 'AULA UP',
    url: 'https://aulaup-bxss.onrender.com/',
    description: 'Formación y cursos',
  },
  {
    id: 'sagaup',
    projectName: 'SAGA-UP',
    url: 'https://saga-up-frontend.onrender.com/login',
    description: 'Cooperación y alianzas',
  },
  {
    id: 'sonup',
    projectName: 'SON UP',
    url: 'https://sonup.fundacionasisco.org',
    description: 'Seguimiento y desarrollo',
  },
  {
    id: 'lupe',
    projectName: 'LUPE',
    url: 'https://lupe.fundacionasisco.org',
    description: 'Proyectos y convocatorias con IA',
  },
];

function isUnsupportedAdminRoute(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 404 || error.status === 405);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isSeedPlaceholderUrl(url: string): boolean {
  return url.includes('.fundacionasisco.org');
}

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

    listReports(page, status) {
      const statusQuery = status ? `&status=${encodeURIComponent(status)}` : '';
      return request(async () => {
        const response = await client.request<ApiContentReportsPageDto>(
          `/admin/moderation/reports?page=${page}&limit=20${statusQuery}`,
        );
        return {
          items: response.data.map((item) => ({
            id: item.id,
            targetType: item.target_type,
            targetId: item.target_id,
            targetContentPreview: item.target_content_preview ?? null,
            reason: item.reason,
            details: item.details ?? null,
            status: item.status,
            createdAt: item.created_at,
            resolvedAt: item.resolved_at ?? null,
          })),
          page: response.meta.page,
          totalItems: response.meta.total_items,
          totalPages: response.meta.total_pages,
          hasNextPage: response.meta.has_next_page,
        };
      });
    },

    resolveReport(id, decision) {
      return request(async () => {
        await client.request(`/admin/moderation/reports/${encodeURIComponent(id)}/resolve`, {
          method: 'PATCH',
          body: {
            status: decision.status,
            ...(decision.rejectTarget !== undefined
              ? { reject_target: decision.rejectTarget }
              : {}),
          },
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

    listFaqs() {
      return request(async () => {
        const page = await client.request<ApiFaqPageDto>('/assistant/faqs?page=1&limit=50');
        const items: AdminFaqItem[] = page.data.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.category,
        }));
        return applyFaqOverrides(items);
      });
    },

    createFaq(input) {
      return request(async () => {
        const trimmed: Omit<AdminFaqItem, 'id'> = {
          question: input.question.trim(),
          answer: input.answer.trim(),
          category: input.category.trim(),
        };
        try {
          const created = await client.request<ApiFaqItemDto>('/admin/faqs', {
            method: 'POST',
            body: trimmed,
          });
          const item: AdminFaqItem = {
            id: created.id,
            question: created.question,
            answer: created.answer,
            category: created.category,
          };
          await saveFaqOverride(item);
          return item;
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            return saveFaqOverride({
              id: `faq-${Date.now()}`,
              ...trimmed,
            });
          }
          throw error;
        }
      });
    },

    updateFaq(id, input) {
      return request(async () => {
        const trimmed: Omit<AdminFaqItem, 'id'> = {
          question: input.question.trim(),
          answer: input.answer.trim(),
          category: input.category.trim(),
        };
        try {
          const updated = await client.request<ApiFaqItemDto>(
            `/admin/faqs/${encodeURIComponent(id)}`,
            {
              method: 'PATCH',
              body: trimmed,
            },
          );
          const item: AdminFaqItem = {
            id: updated.id,
            question: updated.question,
            answer: updated.answer,
            category: updated.category,
          };
          await saveFaqOverride(item);
          return item;
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            return saveFaqOverride({
              id,
              ...trimmed,
            });
          }
          throw error;
        }
      });
    },

    deleteFaq(id) {
      return request(async () => {
        try {
          await client.request(`/admin/faqs/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          await removeFaqOverride(id);
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            await removeFaqOverride(id);
            return;
          }
          throw error;
        }
      });
    },

    listEcosystemLinks() {
      return request(async () => {
        const page = await client.request<ApiRedirectionLinksPageDto>(
          '/directory/links?page=1&limit=50',
        );
        const remoteLinks: AdminEcosystemLink[] = page.data.map((item) => ({
          id: item.id,
          projectName: item.project_name,
          url: item.url,
          description: item.description,
        }));
        const remoteByKey = new Map<string, AdminEcosystemLink>();
        for (const item of remoteLinks) {
          remoteByKey.set(normalizeProjectKey(item.projectName), item);
        }
        const merged: AdminEcosystemLink[] = [];
        const seenKeys = new Set<string>();
        for (const preset of DEFAULT_ECOSYSTEM_PROJECTS) {
          const key = normalizeProjectKey(preset.projectName);
          const remote = remoteByKey.get(key);
          merged.push(
            remote
              ? {
                  id: remote.id,
                  projectName: remote.projectName,
                  url:
                    (key === 'suma21' || key === 'aulaup' || key === 'sagaup') &&
                    isSeedPlaceholderUrl(remote.url)
                      ? preset.url
                      : remote.url,
                  description: remote.description || preset.description,
                }
              : preset,
          );
          seenKeys.add(key);
        }
        for (const remote of remoteLinks) {
          const key = normalizeProjectKey(remote.projectName);
          if (!seenKeys.has(key)) {
            merged.push(remote);
            seenKeys.add(key);
          }
        }
        return applyEcosystemLinkOverrides(merged);
      });
    },

    createEcosystemLink(input) {
      return request(async () => {
        const trimmed = {
          projectName: input.projectName.trim(),
          url: input.url.trim(),
          description: input.description.trim(),
        };
        try {
          const created = await client.request<ApiRedirectionLinkItemDto>(
            '/admin/directory/links',
            {
              method: 'POST',
              body: {
                project_name: trimmed.projectName,
                url: trimmed.url,
                description: trimmed.description,
              },
            },
          );
          const item: AdminEcosystemLink = {
            id: created.id,
            projectName: created.project_name,
            url: created.url,
            description: created.description,
          };
          await saveEcosystemLinkOverride(item);
          return item;
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            return saveEcosystemLinkOverride({
              id: `link-${Date.now()}`,
              ...trimmed,
            });
          }
          throw error;
        }
      });
    },

    updateEcosystemLink(id, input) {
      return request(async () => {
        const trimmed = {
          projectName: input.projectName.trim(),
          url: input.url.trim(),
          description: input.description.trim(),
        };
        try {
          const endpoint = isUuid(id)
            ? `/admin/directory/links/${encodeURIComponent(id)}`
            : '/admin/directory/links';
          const method = isUuid(id) ? 'PATCH' : 'POST';
          const updated = await client.request<ApiRedirectionLinkItemDto>(endpoint, {
            method,
            body: {
              project_name: trimmed.projectName,
              url: trimmed.url,
              description: trimmed.description,
            },
          });
          const item: AdminEcosystemLink = {
            id: updated.id,
            projectName: updated.project_name,
            url: updated.url,
            description: updated.description,
          };
          await saveEcosystemLinkOverride(item);
          return item;
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            return saveEcosystemLinkOverride({
              id,
              ...trimmed,
            });
          }
          throw error;
        }
      });
    },

    deleteEcosystemLink(id) {
      return request(async () => {
        if (!isUuid(id)) {
          await removeEcosystemLinkOverride(id, id);
          return;
        }
        try {
          await client.request(`/admin/directory/links/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          await removeEcosystemLinkOverride(id, id);
        } catch (error) {
          if (isUnsupportedAdminRoute(error)) {
            await removeEcosystemLinkOverride(id, id);
            return;
          }
          throw error;
        }
      });
    },
  };
}
