import type { RemovalRequest, RemovalTarget } from './models/RemovalTarget';

// The backend has no delete route. A request travels as a comment on the post, which stays
// in the moderation queue where moderators can act on it and is never shown publicly.
const POST_REQUEST = '#SOLICITUD-ELIMINAR publicacion';
const COMMENT_REQUEST_PREFIX = '#SOLICITUD-ELIMINAR comentario ';

export function buildRemovalRequest(target: RemovalTarget): string {
  return target.kind === 'post' ? POST_REQUEST : `${COMMENT_REQUEST_PREFIX}${target.id}`;
}

export function parseRemovalRequest(content: string): RemovalRequest | null {
  const text = content.trim();
  if (text === POST_REQUEST) {
    return { kind: 'post' };
  }
  if (text.startsWith(COMMENT_REQUEST_PREFIX)) {
    const commentId = text.slice(COMMENT_REQUEST_PREFIX.length).trim();
    return commentId !== '' && !/\s/.test(commentId) ? { kind: 'comment', commentId } : null;
  }
  return null;
}
