# PENDIENTES (Hoja de Ruta de UI e Interfaz para el Equipo Frontend)

Lista viva de tareas de **visualización, interfaz y refinamiento visual** sobre la **estructura funcional (`domain` + `services` + `application` hooks) conectada al backend**.

Cómo se usa:
- Una tarea = una pantalla o un componente visual, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completada · `[!]` bloqueada.
- Detalle de pantallas en `pantallas.md`; guía completa de endpoints y contratos ya integrados en `integracion-backend.md`.

---

## 1. Estado de Pantallas e Interfaces Integradas

- [x] **UI-01 · Registro y Modo Invitado en `LoginScreen.tsx`**
  - Integrado `submitAnonymous` (`POST /sessions/anonymous`) y `RegisterModal.tsx` (`POST /auth/registro`).
- [x] **UI-02 · Pantalla `5b` — Perfil Público de Otra Persona (`src/app/users/[userId].tsx`)**
  - Integrada en `OtherProfileScreen.tsx` con `publicProfileService` (`GET /actors/{id}`, `GET /connections`, `POST /connections`).
- [x] **UI-03 · Panel de Administración y Moderación Comunitaria (`src/app/admin/index.tsx`)**
  - Integrado `AdminScreen.tsx` con cola paginada de moderación (`GET /admin/moderation/pending`, `PATCH /admin/moderation/posts|comments/:id/status`) y gestión de moderadores (`GET /admin/moderators`, `PUT /admin/moderators/:userAccountId`).
- [x] **UI-04 · Modal de Edición de Perfil Propio en `ProfileScreen.tsx`**
  - Integrado `EditProfileModal.tsx` llamando a `PATCH /actors/me` y recarga de perfil.
- [x] **UI-06 · Selector de Cámara y Galería en `NewPostScreen.tsx` y Avatar en `ProfileScreen.tsx` (`expo-image-picker`)**
  - Conectados con `expo-image-picker` y subida a Cloudinary vía `POST /v1/media/upload`.
- [x] **UI-08 · Extracción de Átomos y Organismos a `src/shared/ui/` (T-05)**
  - Subidos `Avatar`, `CategoryChip`, `ToggleRow` y `HeaderTeal` a `src/shared/ui/`.
- [x] **UI-09 · Ícono y Splash Oficiales en `app.json` (T-15)**
  - Configurados recursos gráficos de la Fundación ASISCO UP en `app.json`.

---

## 2. Refinamientos Visuales Pendientes

- [ ] **UI-05 · Header Verde Colapsable (`HeaderTeal`) en `ProfileScreen.tsx`**
  - Envolver `ProfileScreen.tsx` con el mismo header verde institucional (`COLORS.primary`, esquinas inferiores `RADIUS.cardLarge = 22` y animación `useCollapsingHeader`) que usan `ForumScreen`, `NotificationsScreen` y `EcosystemScreen`, colocando allí el título *«Mi perfil»* y el ícono de engranaje hacia `/profile/settings`.
- [ ] **UI-07 · Restricción Visual del Chip «Noticias» (Avisos) en `NewPostScreen.tsx`**
  - Ocultar o deshabilitar el chip de la categoría institucional (`announcements` / `Noticias`) cuando el usuario autenticado no tenga rol `'ADMIN'` o `'MODERATOR'`.

---

## 3. Bloqueadas o Pendientes del Backend / Despliegue en Render

- [!] **T-23 Directorio de usuarios para ADMIN**: Integrar `GET /v1/admin/accounts?search=...` en `AdminScreen.tsx` cuando la última versión del backend esté desplegada en Render.
- [!] **T-24 Diagnosticar 401 de Notificaciones**: Verificar tras redespliegue de Render que `GET /v1/notifications` y `PATCH /v1/notifications/read-all` acepten el `device_token` con `DeviceSessionGuard`.
- [!] **T-03b Probar el login y los módulos en Expo Go**: Probar el flujo autenticado completo desde Expo Go con una cuenta válida del equipo.
- [!] **T-11 Publicaciones en perfil de otra persona**: Conectar `GET /v1/actors/{id}/posts` en `OtherProfileScreen.tsx` cuando esté desplegado en Render, y evaluar si se requiere `DELETE /v1/connections/{id}` para dejar de seguir.
- [!] **Recuperar contraseña**: Enlace visible en el login; el backend no tiene endpoint en el MVP.
- [!] **Persistencia en servidor de publicaciones guardadas (`/actors/me/saved`)**: Fuera del alcance del MVP de backend.
