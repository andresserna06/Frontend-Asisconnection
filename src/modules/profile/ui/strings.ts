import type { ProfileErrorKind } from '@/modules/profile/domain/models/ProfileError';

// User-facing texts of the profile module (Spanish).
export const PROFILE_STRINGS = {
  headerTitle: 'Mi perfil',
  openSettings: 'Abrir ajustes de privacidad',
  adminPanel: 'Panel de administración',
  openAdminPanel: 'Abrir panel de administración',
  signIn: 'Iniciar sesión',
  changePhoto: 'Cambiar foto de perfil',
  photo: {
    permissionDenied: 'Permite el acceso a tus fotos para cambiar tu foto de perfil.',
    uploadFailed:
      'No pudimos cambiar tu foto. Usa una imagen de menos de 5 MB e inténtalo de nuevo.',
  },
  publicProfile: {
    header: 'Perfil',
    back: 'Volver al foro',
    loading: 'Cargando perfil',
    retry: 'Reintentar',
    retryFollow: 'Reintentar consulta de seguimiento',
    checkingFollow: 'Consultando seguimiento',
    info: 'Información',
    follow: 'Seguir',
    following: 'Siguiendo',
    unfollow: 'Dejar de seguir',
    requestSent: 'Solicitud pendiente',
    blocked: 'No disponible',
    signInToFollow: 'Inicia sesión para seguir',
    followErrors: {
      conflict: 'Ya existe una solicitud o conexión con esta persona.',
      forbidden: 'Inicia sesión con una cuenta para seguir a esta persona.',
      network: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
      notFound: 'No encontramos este perfil.',
      unknown: 'No pudimos actualizar el seguimiento. Inténtalo de nuevo.',
    },
    posts: (count: number) => `Publicaciones (${count})`,
    postsEmpty: 'Esta persona aún no tiene publicaciones aprobadas.',
    postsUnavailable: 'Las publicaciones de otros perfiles aún no están disponibles.',
    errors: {
      conflict: 'Ya existe una solicitud o conexión con esta persona.',
      forbidden: 'No tienes permiso para consultar este perfil.',
      network: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
      notFound: 'No encontramos este perfil.',
      unknown: 'No pudimos cargar este perfil. Inténtalo de nuevo.',
    },
  },
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
