import type { PostDraftIssue } from '@/modules/posts/application/useCreatePost';
import type { PostsErrorKind } from '@/modules/posts/domain/models/PostSubmission';

export const POST_STRINGS = {
  cancel: 'Cancelar y volver al foro',
  title: 'Nueva publicación',
  publish: 'Publicar',
  publishing: 'Publicando…',
  writePost: 'Escribe tu publicación',
  placeholder: '¿Qué quieres compartir con la comunidad?',
  chooseTopic: 'ELIGE UN TEMA',
  categories: {
    announcements: 'Noticias',
    questions: 'Salud',
    guides: 'Apoyo Pedagógico',
    achievements: 'Voluntariado',
  },
  galleryTitle: 'Recientes',
  openGallery: 'Abrir galería',
  galleryLabel: 'Galería',
  openCamera: 'Abrir la cámara',
  cameraLabel: 'Cámara',
  galleryEmpty: 'Tus fotos recientes aparecerán aquí.',
  submittedTitle: 'Publicación enviada',
  submittedMessage:
    'Tu publicación fue recibida y aparecerá en el foro cuando sea aprobada por moderación.',
  rejectedTitle: 'Publicación no permitida',
  rejectedMessage:
    'Tu publicación fue rechazada automáticamente por las reglas de protección comunitaria.',
  galleryUnavailableTitle: 'Galería no disponible',
  mediaUnavailableMessage: 'La selección de fotos se habilitará más adelante.',
  cameraUnavailableTitle: 'Cámara no disponible',
  permissionTitle: 'Permiso necesario',
  galleryPermission: 'Se requiere acceso a la galería para adjuntar fotos.',
  cameraPermission: 'Se requiere acceso a la cámara para tomar fotos.',
  uploadErrorTitle: 'No se pudo subir la foto',
  uploadErrorMessage: 'Revisa que sea una imagen de menos de 5 MB e inténtalo de nuevo.',
  uploadingPhoto: 'Subiendo foto…',
  photoSelected: '1 foto seleccionada lista para publicar',
  removePhoto: 'Eliminar foto adjunta',
} as const;

export const POST_DRAFT_ISSUE_MESSAGES: Record<PostDraftIssue, string> = {
  contentRequired: 'Escribe un mensaje antes de publicar.',
  categoryRequired: 'Elige un tema para tu publicación.',
};

export const POST_ERROR_MESSAGES: Record<PostsErrorKind, string> = {
  validation: 'Revisa el contenido y el tema seleccionado.',
  sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  forbidden: 'No tienes permiso para publicar este contenido.',
  rateLimited: 'Alcanzaste el límite diario de publicaciones.',
  network: 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.',
  unknown: 'No pudimos enviar tu publicación. Inténtalo de nuevo.',
};
