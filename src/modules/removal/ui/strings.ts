import type { RemovalErrorKind } from '@/modules/removal/domain/RemovalService';

export const REMOVAL_STRINGS = {
  removePost: 'Eliminar publicación',
  removeComment: 'Eliminar comentario',
  confirm: 'Eliminar',
  cancel: 'Cancelar',
  everyoneMessage: 'Dejará de verse para toda la comunidad.',
  requestMessage:
    'Dejarás de verlo en este dispositivo. Para los demás desaparecerá cuando un moderador confirme la solicitud.',
  errors: {
    limitReached: 'Llegaste al máximo de contenido eliminado. Pide ayuda a un moderador.',
    rateLimited: 'Alcanzaste el límite diario. Inténtalo mañana.',
    unavailable: 'No pudimos eliminarlo. Inténtalo de nuevo.',
  } satisfies Record<RemovalErrorKind, string>,
} as const;
