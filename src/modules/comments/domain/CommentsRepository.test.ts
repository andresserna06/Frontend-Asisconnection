import { countComments } from './CommentsRepository';
import type { Comment } from './models/Comment';

function comment(id: string, replies: Comment[] = []): Comment {
  return {
    id,
    author: { id: 'a', name: 'Persona de prueba', initials: 'PP', isFoundation: false },
    publishedAtLabel: 'ahora',
    content: 'Texto',
    likeCount: 0,
    replies,
  };
}

describe('countComments', () => {
  it('returns 0 without comments', () => {
    expect(countComments([])).toBe(0);
  });

  it('counts top-level comments and their replies', () => {
    expect(countComments([comment('1', [comment('1a'), comment('1b')]), comment('2')])).toBe(4);
  });
});
