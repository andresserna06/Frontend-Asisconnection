import type { ProfileErrorKind } from '@/modules/profile/domain/models/ProfileError';

// User-facing texts of the profile module (Spanish).
export const PROFILE_STRINGS = {
  changePhoto: 'Cambiar foto de perfil',
  stats: {
    posts: 'Publicaciones',
    followers: 'Seguidores',
    following: 'Siguiendo',
  },
  info: {
    title: 'Mi información',
    edit: 'Editar',
    privacyNote: 'Solo tú ves esto. Elige qué muestras a los demás en ',
    privacyLink: 'Ajustes',
    email: 'Correo',
    birthDate: 'Fecha de nacimiento',
    city: 'Ciudad',
    memberSince: 'Miembro desde',
    notAdded: 'Sin agregar',
  },
  tabs: {
    posts: (count: number) => `Publicaciones (${count})`,
    saved: (count: number) => `Guardados (${count})`,
  },
  empty: {
    posts: 'Aún no has publicado nada.',
    saved: 'Aún no has guardado publicaciones.',
  },
  post: {
    likes: (count: number) => `${count} me gusta`,
    comments: (count: number) => `${count} ${count === 1 ? 'comentario' : 'comentarios'}`,
  },
  listError: 'No pudimos cargar las publicaciones.',
  retry: 'Reintentar',
} as const;

export const PROFILE_ERROR_MESSAGES: Record<ProfileErrorKind, string> = {
  network: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
  unknown: 'No pudimos cargar tu perfil. Inténtalo de nuevo.',
};
