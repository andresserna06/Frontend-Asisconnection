# PENDIENTES (Hoja de Ruta de UI e Interfaz para el Equipo Frontend)

Lista viva de tareas de **visualización, interfaz y refinamiento visual** sobre la **estructura funcional (`domain` + `services` + `application` hooks) conectada al backend**.

Cómo se usa:
- Una tarea = una pantalla o un componente visual, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completada · `[!]` bloqueada.
- Detalle de pantallas en `pantallas.md`; guía completa de endpoints y contratos ya integrados en `integracion-backend.md`.

---

## 1. Estado de Pantallas, Endpoints e Interfaces Integradas (100% Completadas)

- [x] **UI-01 · Registro y Modo Invitado en `LoginScreen.tsx`**
  - Integrado `submitAnonymous` (`POST /sessions/anonymous`) y `RegisterModal.tsx` (`POST /auth/registro`), incluyendo manejo explícito de conflictos `409 Conflict` y visualización de errores RFC 7807 dentro del modal.
- [x] **UI-02 y T-11 · Pantalla `5b` — Perfil Público de Otra Persona y sus Publicaciones (`src/app/users/[userId].tsx`)**
  - Integrada en `OtherProfileScreen.tsx` con `publicProfileService` (`GET /actors/{id}`, `GET /actors/{id}/posts`, `GET /connections`, `POST /connections`).
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
- [!] **Recuperar contraseña**: Enlace visible en el login (`showComingSoonNotice`); el backend no incluye endpoint de recuperación de contraseña en el MVP.
- [!] **Cancelar seguimiento (`DELETE /v1/connections/{id}`)**: El backend actual permite crear y consultar conexiones (`POST /connections`, `GET /connections`), pero no incluye endpoint para eliminar una conexión existente.
- [!] **Persistencia en servidor de publicaciones guardadas (`/actors/me/saved`)**: Fuera del alcance del MVP de backend (`getMySavedPosts` retorna `[]`).
