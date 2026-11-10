import type { CommentsRepository } from '@/modules/comments/domain/CommentsRepository';
import type { Comment, CommentSubmissionStatus } from '@/modules/comments/domain/models/Comment';
import { parseRemovalRequest } from '@/modules/removal';
import { isRemovedByAuthor } from '@/shared/lib/authorRemovalMarks';
import { type HttpClient, HttpError } from '@/shared/lib/http';

type AuthorBadgeResponse = {
  actor_id?: string | null;
  display_name: string;
  role_label: string;
  avatar_url?: string | null;
  is_registered: boolean;
};

type ApprovedCommentItemResponse = {
  id: string;
  parent_id?: string | null;
  content: string;
  author: AuthorBadgeResponse;
  likes_count?: number;
  created_at: string;
};

type CommentsPageResponse = {
  data: ApprovedCommentItemResponse[];
};

type PostsPageFallbackResponse = {
  data: {
    id: string;
    recent_comments?: ApprovedCommentItemResponse[];
  }[];
};

type PendingSubmissionResponse = {
  id: string;
  status: CommentSubmissionStatus;
  rejection_reason?: string | null;
  message: string;
  created_at: string;
};

type ToggleCommentReactionResponse = {
  comment_id: string;
  type: string;
  active: boolean;
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'AS';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatRelativeTime(isoDate: string, nowMs = Date.now()): string {
  const createdMs = Date.parse(isoDate);
  if (Number.isNaN(createdMs)) {
    return 'reciente';
  }
  const diffSeconds = Math.max(0, Math.floor((nowMs - createdMs) / 1000));
  if (diffSeconds < 60) {
    return 'ahora';
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
}

function toCommentNode(item: ApprovedCommentItemResponse): Comment {
  const isFoundation = item.author.role_label === 'ADMIN' || item.author.role_label === 'MODERATOR';

  return {
    id: item.id,
    author: {
      id: item.author.actor_id ?? item.author.display_name,
      profileId: item.author.actor_id ?? null,
      name: item.author.display_name,
      initials: toInitials(item.author.display_name),
      isFoundation,
    },
    publishedAtLabel: formatRelativeTime(item.created_at),
    content: item.content,
    likeCount: item.likes_count ?? 0,
    replies: [],
  };
}

export function buildCommentThreads(allItems: ApprovedCommentItemResponse[]): Comment[] {
  // Neither a removal request approved by mistake nor what its author removed is shown.
  const items = allItems.filter(
    (item) =>
      parseRemovalRequest(item.content) === null &&
      !isRemovedByAuthor(item.author.avatar_url, 'comment', item.id),
  );
  const rootMap = new Map<string, Comment>();
  const roots: Comment[] = [];

  for (const item of items) {
    if (!item.parent_id) {
      const node = toCommentNode(item);
      rootMap.set(node.id, node);
      roots.push(node);
    }
  }

  for (const item of items) {
    if (item.parent_id) {
      const replyNode = toCommentNode(item);
      const parent = rootMap.get(item.parent_id);
      if (parent !== undefined) {
        parent.replies.push(replyNode);
      } else {
        roots.push(replyNode);
      }
    }
  }

  return roots;
}

export function createCommentsService(client: HttpClient): CommentsRepository {
  return {
    async listComments(postId) {
      try {
        const page = await client.request<CommentsPageResponse>(
          `/posts/${encodeURIComponent(postId)}/comments?page=1&limit=50`,
        );
        return buildCommentThreads(page.data);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          const postsPage =
            await client.request<PostsPageFallbackResponse>('/posts?page=1&limit=50');
          const matchingPost = postsPage.data.find((post) => post.id === postId);
          return buildCommentThreads(matchingPost?.recent_comments ?? []);
        }
        throw error;
      }
    },

    async addComment({ postId, content, parentId }) {
      const body = parentId !== null ? { content, parent_id: parentId } : { content };
      const response = await client.request<PendingSubmissionResponse>(
        `/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: 'POST',
          body,
        },
      );
      return {
        id: response.id,
        status: response.status,
        message: response.message,
      };
    },

    async toggleLike(commentId) {
      const response = await client.request<ToggleCommentReactionResponse>(
        `/comments/${encodeURIComponent(commentId)}/reactions`,
        {
          method: 'POST',
          body: { type: 'LIKE' },
        },
      );
      return response.active;
    },
  };
}
