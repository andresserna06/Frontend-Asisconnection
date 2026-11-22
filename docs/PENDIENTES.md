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

## 2. Pendiente del Frontend / Por Validar en Dispositivo

- [ ] **T-03b Probar el flujo completo en Expo Go físico**: Validar visualmente todas las pantallas en dispositivo móvil con Expo Go.
- [ ] **T-28 Avisos en web**: `Alert.alert` no hace nada en navegador, así que los avisos de publicación y comentario enviados no se muestran.
- [ ] **T-29 Sesión en web**: decidir si la sesión debe sobrevivir a recargar la pestaña. `secureTokenStorage.web.ts` la guarda solo en memoria y `expo-secure-store` no existe en web; persistirla cambia la regla de la sección 7 de `AGENTS.md`.
- [ ] **T-30 Despliegue web**: publicar el Static Site en Render y validar el flujo contra el backend real. Requiere B-01.

---

## 3. Pendiente del backend

Lo que la app necesita del backend (`proyecto-integrador-backend`, equipo SAGA UP). Revisado contra el Swagger desplegado (`/api/docs`) el 2026-11-10. Cada punto dice qué falta, qué hace la app mientras tanto y, cuando aplica, qué se retira del frontend al tenerlo.

### 3.1 Configuración en Render (sin código)

- [ ] **B-01 CORS para la web**: agregar el dominio del Static Site a `CORS_ORIGINS`. Hoy un origen que no está en la lista no recibe `access-control-allow-origin` y el navegador bloquea todas las peticiones. Bloquea T-30.
- [x] **B-02 Subida de imágenes**: resuelto por el equipo de backend; la subida de foto de perfil e imágenes de publicaciones funciona (confirmado por el equipo el 2026-11-22).
- [ ] **B-03 Directorio del Ecosistema**: registrar en `GET /directory/links` las direcciones de SUMA 21 (`https://suma21-frontend.onrender.com`), AULA UP (`https://aulaup-bxss.onrender.com/`), SAGA-UP (`https://saga-up-frontend.onrender.com/login`), SON UP y LUPE. Mientras: las tres primeras están fijas en `PUBLISHED_PROJECT_URLS` (`src/modules/ecosystem/domain/models/EcosystemLink.ts`); SON UP y LUPE no abren si el directorio no las trae. Se retira: `PUBLISHED_PROJECT_URLS`.

### 3.2 Por confirmar con una cuenta real

Las soluciones temporales dependen de estos comportamientos y solo se probaron con la API simulada.

- [ ] **B-04 Foto de perfil con marcas**: `PATCH /actors/me` acepta en `avatar_url` una dirección con el fragmento `#removed=…`, y `https://avatar.invalid/none` cuando la persona no tiene foto (hasta 500 caracteres). De esto depende que el dueño elimine su contenido; si falla, la app muestra «No pudimos eliminarlo».
- [ ] **B-05 Rechazar contenido ya aprobado**: `PATCH /admin/moderation/posts|comments/{id}/status` con `REJECTED` sobre una publicación o un comentario `APPROVED` lo saca del Foro. De esto depende que admins y moderadores eliminen.
- [ ] **B-06 Fecha de nacimiento**: `PATCH /actors/me` guarda `birth_date` y `GET /actors/me` la devuelve.
- [x] **B-07 Privacidad del perfil público**: probado a mano por el equipo con dos cuentas el 2026-11-22: al apagar o encender correo, ciudad y fecha de nacimiento en Ajustes, el perfil visto desde otra cuenta los oculta o los muestra como corresponde. El filtro es del backend (la app muestra todo dato que llega). No hay prueba automatizada; si el backend cambia, repetir la prueba.

### 3.3 Endpoints que faltan

- [ ] **B-08 Eliminar publicaciones y comentarios** (`DELETE /posts/{postId}` y `DELETE /comments/{id}`; hoy responden `Cannot DELETE`). Reglas: `ADMIN` y `MODERATOR` eliminan cualquiera; las demás cuentas, solo lo propio; un invitado, lo que publicó desde su sesión de dispositivo. Responder `204`, `403` o `404`, y descontarlo de `posts_count`. Conviene que las listas traigan `can_delete` para no deducir el permiso en la app. Mientras: módulo `removal`; los moderadores rechazan el contenido, el dueño lo marca en su `avatar_url` (unas 40 eliminaciones por cuenta; el contenido sigue en la base de datos) y el invitado envía un comentario `#SOLICITUD-ELIMINAR` que llega a la cola de moderación. Se retira: `src/shared/lib/authorRemovalMarks.ts`, la solicitud por comentario y `RemovalRequestCard`.
- [ ] **B-09 Dejar de seguir** (`DELETE /connections/{id}`; hoy responde `Cannot DELETE`, y `PATCH /connections/{id}` solo acepta `ACCEPTED` o `BLOCKED`). Mientras: se recuerda solo en el dispositivo de quien deja de seguir; la otra persona lo sigue contando en sus seguidores.
- [ ] **B-10 Una publicación por id** (`GET /posts/{postId}`). Mientras: se busca entre las 20 más recientes de `GET /actors/{id}/posts`, así que una publicación más antigua muestra «No encontramos esta publicación» (`src/modules/profile/application/useActorPost.ts`).
- [ ] **B-11 Saber si ya reaccioné**: publicaciones y comentarios traen el total de reacciones, pero no si quien mira ya reaccionó. Pedido: un campo para quien mira en `PublicPostItemDto` y en `ApprovedCommentItemDto` (por ejemplo `viewer_reactions` y `liked_by_viewer`). Mientras: la app lo recuerda en el navegador (`src/shared/hooks/useReactionToggle.ts`); en el teléfono se pierde al cerrar la app y en otro equipo el «me gusta» aparece apagado aunque cuente.
- [ ] **B-12 Seguidores y seguidos** (`GET /actors/{id}/followers` y `GET /actors/{id}/following`, paginados, con nombre, rol y foto). `GET /connections` solo trae ids y solo del perfil propio. Mientras: la app pide cada perfil por separado, hasta 50 seguidores, y no puede mostrar los seguidores de otra persona.
- [ ] **B-13 Publicaciones guardadas** (`GET`, `POST` y `DELETE /actors/me/saved`). Son privadas: nunca se muestran a otras personas. La función se retiró de la app hasta que exista.
- [ ] **B-14 Recuperar contraseña**: no hay endpoint; el enlace del login muestra «Disponible pronto».
- [ ] **B-15 Notificaciones**: marcar una sola como leída (hoy solo existe `PATCH /notifications/read-all`) y el tipo «me gusta a tu comentario», que pide el diseño y no está entre los tipos de `NotificationItemDto`.

### 3.4 Ajustes al contrato actual

- [ ] **B-16 `actor_id` en la cola de moderación**: `GET /admin/moderation/pending` no siempre trae `author.actor_id`. Mientras: para saber si una solicitud de eliminación la hizo el autor, la app también compara el nombre de usuario.
- [ ] **B-17 Banderas `show_*` del perfil público**: según el Swagger, `GET /actors/{id}` devuelve `show_email`, `show_birth_date` y `show_city`, pero no las envía. Enviarlas o corregir el Swagger. Prioridad baja: la app funciona sin ellas porque el backend ya oculta los datos (ver B-07).
- [ ] **B-18 Iniciar sesión con documento**: el campo del login dice «Correo o documento», pero `POST /auth/login` solo acepta correo. Decidir si el backend acepta el documento o si el texto pasa a «Correo».
