import { buildRemovalRequest } from '@/modules/removal/domain/removalRequest';
import { RemovalError, type RemovalService } from '@/modules/removal/domain/RemovalService';
import { addRemovedContent } from '@/shared/lib/authorRemovalMarks';
import { type HttpClient, HttpError } from '@/shared/lib/http';

type PendingSubmissionResponse = {
  status: 'PENDING' | 'REJECTED' | 'APPROVED';
};

type ActorAvatarResponse = {
  avatar_url?: string | null;
};

function toRemovalError(error: unknown): RemovalError {
  if (error instanceof RemovalError) {
    return error;
  }
  return new RemovalError(
    error instanceof HttpError && error.status === 429 ? 'rateLimited' : 'unavailable',
  );
}

export function createRemovalService(client: HttpClient): RemovalService {
  return {
    async hideForEveryone(target) {
      const resource = target.kind === 'post' ? 'posts' : 'comments';
      try {
        await client.request(
          `/admin/moderation/${resource}/${encodeURIComponent(target.id)}/status`,
          { method: 'PATCH', body: { status: 'REJECTED' } },
        );
      } catch (error) {
        throw toRemovalError(error);
      }
    },

    async removeOwnContent(target) {
      try {
        const me = await client.request<ActorAvatarResponse>('/actors/me');
        const avatarUrl = addRemovedContent(me.avatar_url, target.kind, target.id);
        if (avatarUrl === null) {
          throw new RemovalError('limitReached');
        }
        await client.request('/actors/me', { method: 'PATCH', body: { avatar_url: avatarUrl } });
      } catch (error) {
        throw toRemovalError(error);
      }
    },

    async requestRemoval(target) {
      const postId = target.kind === 'post' ? target.id : target.postId;
      try {
        const response = await client.request<PendingSubmissionResponse>(
          `/posts/${encodeURIComponent(postId)}/comments`,
          { method: 'POST', body: { content: buildRemovalRequest(target) } },
        );
        // The automatic filter can reject the request, which would never reach a moderator.
        if (response.status === 'REJECTED') {
          throw new RemovalError('unavailable');
        }
      } catch (error) {
        throw toRemovalError(error);
      }
    },
  };
}
