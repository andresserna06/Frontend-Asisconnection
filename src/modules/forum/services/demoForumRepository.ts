import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';
import type { ForumCategory } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';

// Datos de prueba mientras el backend no publique los endpoints del Foro. Solo se usa en
// desarrollo (ver AppForumProvider). Ningún dato es real.
// Los ids coinciden con los comentarios de prueba del módulo comments.
const DEMO_POSTS: ForumPost[] = [
  post(
    'demo-1',
    'announcements',
    ['Ana Tallerista', 'AT', 'Tallerista'],
    'Hace 2 h',
    'Publicación de prueba: este sábado tendremos taller de pintura a las 10:00 a. m. ¡Los esperamos!',
    12,
    3,
  ),
  post(
    'demo-2',
    'achievements',
    ['Claudia Henao', 'CH', 'Acudiente'],
    'Hace 3 h',
    '¡Miren esa mano! Sofía terminó hoy su primera pintura en el taller de artes y no se la quería lavar hasta que todos la vieran.',
    46,
    8,
  ),
  post(
    'demo-3',
    'questions',
    ['Diego Osorio', 'DO', 'Acudiente'],
    'Hace 4 h',
    '¿Qué documentos piden para inscribir a un niño en el taller de natación?',
    5,
    2,
  ),
  post(
    'demo-4',
    'guides',
    ['Ana Tallerista', 'AT', 'Tallerista'],
    'Ayer',
    'Guía rápida: tres juegos en casa para la motricidad fina. 1) Pinzas de ropa en un cartón. 2) Ensartar macarrones. 3) Plastilina con moldes.',
    21,
    2,
  ),
  post(
    'demo-5',
    'questions',
    ['Marcela Ramírez', 'MR', 'Acudiente'],
    'Ayer',
    '¿Alguien conoce actividades de música para los fines de semana en Manizales?',
    3,
    0,
  ),
  post(
    'demo-6',
    'announcements',
    ['ASISCO UP', 'AU', 'Fundación'],
    'Hace 2 días',
    'Recordatorio: el lunes festivo la sede permanecerá cerrada. Las actividades se retoman el martes.',
    30,
    1,
  ),
];

function post(
  id: string,
  category: ForumCategory,
  [name, initials, roleLabel]: [string, string, string],
  publishedAtLabel: string,
  content: string,
  likeCount: number,
  commentCount: number,
): ForumPost {
  return {
    id,
    category,
    author: { id: `author-${initials}`, name, initials, roleLabel, avatarUri: null },
    publishedAtLabel,
    content,
    media: null,
    likeCount,
    commentCount,
  };
}

export function createDemoForumRepository(): ForumRepository {
  return {
    async listPosts({ filter }) {
      return filter === 'all' ? DEMO_POSTS : DEMO_POSTS.filter((post) => post.category === filter);
    },
  };
}
