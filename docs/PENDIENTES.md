# PENDIENTES (Hoja de Ruta de UI e Interfaz para el Equipo Frontend)

Lista viva de tareas de **visualización, interfaz y refinamiento visual** sobre la **estructura funcional (`domain` + `services` + `application` hooks) conectada al backend**.

Cómo se usa:
- Una tarea = una pantalla o un componente visual, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completada · `[!]` bloqueada.
- Detalle de pantallas en `pantallas.md`; guía completa de endpoints y contratos ya integrados en `integracion-backend.md`.

---

## 1. Tareas en Curso

*(Sin tareas en curso)*

---

## 2. Estado de Pantallas, Endpoints e Interfaces Integradas (100% Completadas)

- [x] **T-40 · Integración de Casos de Uso CU-01 a CU-05 (Descubrimiento y Conexiones, Feed «Siguiendo» y Búsqueda, Edición/Eliminación y Mis Envíos en Moderación, Guardados/Bookmarks y Reportes Comunitarios)**
  - **CU-01**: Directorio y buscador de perfiles (`GET /actors`), relación del lector (`viewer_connection` en `GET /actors/:id` con estados *Seguir*, *Solicitado / Cancelar*, *Aceptar solicitud* y *Dejar de seguir*), listas de seguidores/seguidos (`GET /actors/:id/followers` y `GET /actors/:id/following`), solicitudes pendientes enriquecidas con `peer_actor` (`GET /connections?status=PENDING&direction=incoming`) y eliminación de conexión (`DELETE /connections/:id`).
  - **CU-02**: Selector de feed (*Explorar* / *Siguiendo*) y búsqueda por texto o `#hashtags` en `GET /posts`, lectura de `viewer_reactions` e `is_bookmarked`, y consulta individual `GET /posts/:id`.
  - **CU-03**: Edición de publicación propia (`PATCH /posts/:id`) con aviso de re-moderación (`PENDING`), eliminación nativa (`DELETE /posts/:id`, `DELETE /comments/:id`) integrada con `useContentRemoval`, e historial propio de envíos a moderación (`GET /actors/me/submissions`).
  - **CU-04**: Guardado/quitado de publicaciones (`POST /posts/:postId/bookmarks`) y colección personal en perfil (`GET /bookmarks`).
  - **CU-05**: Reporte de publicaciones y comentarios (`POST /reports`, con manejo de `409 Conflict`) y bandeja de reportes en el panel de moderación (`GET /admin/moderation/reports`, `PATCH /admin/moderation/reports/:id/resolve`) para `ADMIN` y `MODERATOR`.
- [x] **UI-01 · Registro y Modo Invitado en `LoginScreen.tsx`**
  - Integrado `submitAnonymous` (`POST /sessions/anonymous`) y `RegisterModal.tsx` (`POST /auth/registro`), incluyendo manejo explícito de conflictos `409 Conflict` y visualización de errores RFC 7807 dentro del modal.
- [x] **UI-02 y T-11 · Pantalla `5b` — Perfil Público de Otra Persona y sus Publicaciones (`src/app/users/[userId].tsx`)**
  - Integrada en `OtherProfileScreen.tsx` con `publicProfileService` (`GET /actors/{id}`, `GET /actors/{id}/posts`, `GET /connections`, `POST /connections` y acción de `Dejar de seguir` sin generar notificaciones).
- [x] **UI-03 y T-23 · Panel de Administración, Moderación Comunitaria y Directorio de Cuentas (`src/app/admin/index.tsx`)**
  - Integrado `AdminScreen.tsx` con cola paginada de moderación (`GET /admin/moderation/pending`, `PATCH /admin/moderation/posts|comments/:id/status`) accesible para `ADMIN` y `MODERATOR`, y gestión de moderadores (`GET /admin/accounts?search=...`, `GET /admin/moderators`, `PUT /admin/moderators/:userAccountId`, `DELETE /admin/moderators/:userAccountId`) exclusiva para `ADMIN`.
- [x] **UI-04 · Modal de Edición de Perfil Propio en `ProfileScreen.tsx`**
  - Integrado `EditProfileModal.tsx` llamando a `PATCH /actors/me` y recarga de perfil.
- [x] **UI-05 · Header Verde Colapsable (`HeaderTeal`) en `ProfileScreen.tsx`**
  - Integrado `HeaderTeal` con `useCollapsingHeader`, título *«Mi perfil»* y botón de acceso directo a `/profile/settings`.
- [x] **UI-06 · Selector de Cámara y Galería en `NewPostScreen.tsx` y Avatar en `ProfileScreen.tsx` (`expo-image-picker`)**
  - Conectados con `expo-image-picker` y subida a Cloudinary vía `POST /v1/media/upload`.
- [x] **UI-07 · Restricción Visual del Chip «Noticias» (Avisos) en `NewPostScreen.tsx`**
  - El chip institucional (`announcements` / `Noticias`) se muestra únicamente cuando el usuario autenticado posee rol `'ADMIN'` o `'MODERATOR'`.
- [x] **UI-08 · Extracción de Átomos y Organismos a `src/shared/ui/` (T-05)**
  - Subidos `Avatar`, `CategoryChip`, `ToggleRow` y `HeaderTeal` a `src/shared/ui/`.
- [x] **UI-09 · Ícono y Splash Oficiales en `app.json` (T-15)**
  - Configurados recursos gráficos de la Fundación ASISCO UP en `app.json`.
- [x] **T-24 · Notificaciones Multievento (`NEW_FOLLOWER`) y `DeviceSessionGuard`**
  - Integrado en `notificationsService.ts` y desplegado en Render (`GET /v1/notifications`, `PATCH /v1/notifications/read-all`).

---

## 2. Fuera del Alcance del MVP de Backend / Por Validar en Dispositivo

- [ ] **T-03b Probar el flujo completo en Expo Go físico**: Validar visualmente todas las pantallas en dispositivo móvil con Expo Go.
- [ ] **T-28 Avisos en web**: `Alert.alert` no hace nada en navegador, así que los avisos de publicación y comentario enviados no se muestran.
- [ ] **T-29 Sesión en web**: decidir si la sesión debe sobrevivir a recargar la pestaña. `secureTokenStorage.web.ts` la guarda solo en memoria y `expo-secure-store` no existe en web; persistirla cambia la regla de la sección 7 de `AGENTS.md`.
- [ ] **T-30 Despliegue web**: agregar el dominio del Static Site a `CORS_ORIGINS` del backend (hoy un origen desconocido no recibe `access-control-allow-origin`) y validar el flujo contra el backend real.
- [!] **Recuperar contraseña**: Enlace visible en el login (`showComingSoonNotice`); el backend no incluye endpoint de recuperación de contraseña en el MVP.
