import type { CommentsRepository } from '@/modules/comments/domain/CommentsRepository';
import type { Comment, CommentAuthor } from '@/modules/comments/domain/models/Comment';

// Test data until the backend publishes the comments endpoints. Only used in development
// (see AppCommentsProvider). Ids match the forum demo posts. None of this data is real.
const ANA_LUCIA: CommentAuthor = {
  id: 'u-alb',
  name: 'Ana Lucía Betancur',
  initials: 'AB',
  isFoundation: false,
};
const CLAUDIA: CommentAuthor = {
  id: 'u-ch',
  name: 'Claudia Henao',
  initials: 'CH',
  isFoundation: false,
};
const JULIAN: CommentAuthor = {
  id: 'u-ja',
  name: 'Julián Arango',
  initials: 'JA',
  isFoundation: false,
};
const DIEGO: CommentAuthor = {
  id: 'u-do',
  name: 'Diego Osorio',
  initials: 'DO',
  isFoundation: false,
};
const MARCELA: CommentAuthor = {
  id: 'u-mr',
  name: 'Marcela Ramírez',
  initials: 'MR',
  isFoundation: false,
};
const LAURA: CommentAuthor = {
  id: 'u-lg',
  name: 'Laura Giraldo',
  initials: 'LG',
  isFoundation: false,
};
const FOUNDATION: CommentAuthor = {
  id: 'u-asisco',
  name: 'ASISCO UP',
  initials: 'AU',
  isFoundation: true,
};

function comment(
  id: string,
  author: CommentAuthor,
  publishedAtLabel: string,
  content: string,
  likeCount: number,
  replies: Comment[] = [],
): Comment {
  return { id, author, publishedAtLabel, content, likeCount, replies };
}

// Kept at module level so new comments survive closing and reopening the sheet.
const commentsByPost = new Map<string, Comment[]>([
  [
    'demo-1',
    [
      comment('c1-1', MARCELA, 'hace 1 h', '¡Qué bueno! ¿Hay que llevar materiales?', 4, [
        comment(
          'c1-1-1',
          FOUNDATION,
          'hace 50 min',
          'No hace falta, la fundación pone los materiales.',
          6,
        ),
      ]),
      comment('c1-2', LAURA, 'hace 30 min', 'Ahí estaremos con Tomás.', 2),
    ],
  ],
  [
    'demo-2',
    [
      comment(
        'c2-1',
        ANA_LUCIA,
        'hace 2 h',
        '¡Qué orgullo! Los talleres de artes le han hecho mucho bien a Sofía. Gracias por compartirlo.',
        18,
        [
          comment(
            'c2-1-1',
            CLAUDIA,
            'hace 1 h',
            'Gracias, Ana Lucía. Ya quiere pintar todos los días.',
            4,
          ),
          comment('c2-1-2', ANA_LUCIA, 'hace 1 h', 'Ese es el mejor resultado. ¡Que no pare!', 2),
        ],
      ),
      comment(
        'c2-2',
        JULIAN,
        'hace 2 h',
        'Esa mano verde lo dice todo. ¡Felicitaciones, Sofía!',
        7,
      ),
      comment(
        'c2-3',
        DIEGO,
        'hace 1 h',
        'Mi hijo también quiere empezar el taller de artes. ¿Cómo hacemos para inscribirlo?',
        3,
        [
          comment(
            'c2-3-1',
            FOUNDATION,
            'hace 40 min',
            'Hola, Diego. Escríbenos por el Asistente y te ayudamos con la inscripción.',
            5,
          ),
        ],
      ),
      comment('c2-4', MARCELA, 'hace 45 min', 'Hermoso. A Juan Pablo le encantaría ver esto.', 3),
      comment('c2-5', LAURA, 'hace 20 min', '¡Bravo, Sofía! Se nota que lo disfrutó.', 1),
    ],
  ],
  [
    'demo-3',
    [
      comment(
        'c3-1',
        FOUNDATION,
        'hace 3 h',
        'Solo se necesita el documento de identidad y el certificado médico.',
        9,
      ),
      comment(
        'c3-2',
        LAURA,
        'hace 2 h',
        'Nosotros lo hicimos la semana pasada y fue muy rápido.',
        2,
      ),
    ],
  ],
  [
    'demo-4',
    [
      comment('c4-1', CLAUDIA, 'hace 5 h', 'La de las pinzas de ropa nos funcionó muy bien.', 5),
      comment('c4-2', JULIAN, 'ayer', 'Gracias, la vamos a probar este fin de semana.', 1),
    ],
  ],
  ['demo-5', []],
  ['demo-6', [comment('c6-1', DIEGO, 'hace 1 día', 'Gracias por el aviso.', 3)]],
]);

let nextId = 1;

export function createDemoCommentsRepository(currentUserName: string): CommentsRepository {
  const author: CommentAuthor = {
    id: 'u-current',
    name: currentUserName,
    initials: currentUserName.slice(0, 2).toUpperCase(),
    isFoundation: false,
  };

  return {
    async listComments(postId) {
      return commentsByPost.get(postId) ?? [];
    },

    async addComment({ postId, content, parentId }) {
      const created = comment(`new-${nextId++}`, author, 'ahora', content, 0);
      const current = commentsByPost.get(postId) ?? [];
      // New arrays so React Query sees the change.
      const updated =
        parentId === null
          ? [...current, created]
          : current.map((item) =>
              item.id === parentId ? { ...item, replies: [...item.replies, created] } : item,
            );
      commentsByPost.set(postId, updated);
      return created;
    },
  };
}
