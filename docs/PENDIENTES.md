# PENDIENTES (Hoja de Ruta de UI e Interfaz para el Equipo Frontend)

Lista viva de tareas de **visualización, interfaz y refinamiento visual** para que el equipo de Frontend las desarrolle sobre la **estructura funcional (`domain` + `services` + `application` hooks) que ya está 100% conectada al backend**.

Cómo se usa:
- Una tarea = una pantalla o un componente visual, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada.
- Detalle de pantallas en `pantallas.md`; guía completa de endpoints y contratos ya integrados en `integracion-backend.md`.

---

## 1. Pantallas e Interfaces Listas para Maquetar (Hooks y Services ya Creados)

- [ ] **UI-01 · Pantalla de Registro (`src/app/(auth)/register.tsx`) y Botón «Ingresar como invitado» en `LoginScreen.tsx`**
  - **Lo que ya está hecho en lógica/servicios**:
    - `authService.register` (`POST /auth/registro`) y `useAuth().register` ya están listos.
    - `authService.loginAnonymous` (`POST /sessions/anonymous`) y `useLogin().submitAnonymous(acceptConsent, nickname)` ya están listos.
  - **Lo que debe hacer el equipo de UI**:
    1. En `src/modules/auth/ui/LoginScreen.tsx`, cambiar `onPress={showComingSoonNotice}` del botón *«Ingresar como invitado»* por `() => submitAnonymous(acceptConsent)`.
    2. Crear `RegisterScreen.tsx` con los campos `username`, `email`, `password`, selector de `rol` (`ACUDIENTE`, `VOLUNTARIO`, `INVERSOR`, `BENEFICIARIO`) y `ConsentCheckbox`, conectando el botón *«Crear cuenta»* de `LoginScreen` a `router.push('/(auth)/register')`.

- [ ] **UI-02 · Pantalla `5b` — Perfil Público de Otra Persona (`src/app/users/[userId].tsx`)**
  - **Lo que ya está hecho en lógica/servicios**:
    - `profileService.getPublicProfile(actorId)` (`GET /actors/:id`) y `profileService.followActor(actorId)` (`POST /connections`) ya están implementados.
    - El hook `usePublicProfile(service, actorId)` ya está exportado desde `@/modules/profile` (`src/modules/profile/application/usePublicProfile.ts`).
    - El backend ya filtra automáticamente `email`, `birth_date` y `city` según los interruptores de privacidad Ley 1581 que esa persona tenga activos en Ajustes.
  - **Lo que debe hacer el equipo de UI**:
    1. Crear `UserProfileScreen.tsx` en `src/modules/profile/ui/UserProfileScreen.tsx` siguiendo el mockup `05b-PerfilUsuario` (avatar, nombre, rol, contadores y botón *«Seguir / Pendiente / Siguiendo»* conectado a `follow()`).
    2. Crear la ruta `src/app/users/[userId].tsx` y en `ForumPostCard.tsx` navegar a `router.push(`/users/${post.author.id}`)` al tocar el encabezado del autor.

- [ ] **UI-03 · Vista / Modal de Moderación Comunitaria (`ADMIN` y `MODERATOR`)**
  - **Lo que ya está hecho en lógica/servicios**:
    - `forumService.listPendingModeration()` (`GET /admin/moderation/pending`) y `forumService.moderateItem(id, itemType, status)` (`PATCH /admin/moderation/posts|comments/:id/status`) ya están implementados.
    - El hook `useModerationQueue(repository)` ya está exportado desde `@/modules/forum` (`src/modules/forum/application/useModerationQueue.ts`).
  - **Lo que debe hacer el equipo de UI**:
    1. Mostrar un botón/acceso en el Header del Foro o en Perfil **solo cuando `user.roles` incluya `'ADMIN'` o `'MODERATOR'`**.
    2. Construir la lista visual de tarjetas pendientes (`items` de `useModerationQueue`) con dos botones accesibles (44×44): *«Aprobar»* (`decide(id, itemType, 'APPROVED')`) y *«Rechazar»* (`decide(id, itemType, 'REJECTED')`).

- [ ] **UI-04 · Modal de Edición de Perfil Propio en `ProfileScreen.tsx`**
  - **Lo que ya está hecho en lógica/servicios**:
    - `profileService.updateMyProfile(input)` (`PATCH /actors/me`) ya soporta `firstNames`, `lastNames`, `shortBio`, `birthDate`, `city` y `avatarUrl`.
  - **Lo que debe hacer el equipo de UI**:
    1. En `src/modules/profile/ui/ProfileScreen.tsx`, reemplazar `onEdit={showComingSoonNotice}` en `<InfoCard />` por un modal o formulario editable que llame a `service.updateMyProfile(...)` y luego a `profile.reload()`.

---

## 2. Refinamientos de Estilos, Componentes Compartidos y Multimedia

- [ ] **UI-05 · Header Verde Colapsable (`HeaderTeal`) en `ProfileScreen.tsx`**
  - Envolver `ProfileScreen.tsx` con el mismo header verde institucional (`COLORS.primary`, esquinas inferiores `RADIUS.cardLarge = 22` y animación `useCollapsingHeader`) que usan `ForumScreen`, `NotificationsScreen` y `EcosystemScreen`, colocando allí el título *«Mi perfil»* y el ícono de engranaje hacia `/profile/settings`.
- [x] **UI-06 · Selector de Cámara y Galería en `NewPostScreen.tsx` y Avatar en `ProfileScreen.tsx` (`expo-image-picker`)**
  - Conectados con `expo-image-picker` y subida a Cloudinary vía `POST /v1/media/upload`. Previsualización de imagen adjunta con botón de descarte (`x`) y spinner de carga en el avatar.
- [ ] **UI-07 · Restricción Visual del Chip «Noticias» (Avisos) en `NewPostScreen.tsx`**
  - Ocultar o deshabilitar el chip de la categoría institucional (`announcements` / `Noticias`) cuando el usuario autenticado no tenga rol `'ADMIN'` o `'MODERATOR'`.
- [ ] **UI-08 · Extracción de Átomos y Organismos a `src/shared/ui/` (T-05)**
  - Subir `Avatar`, `CategoryChip` y `HeaderTeal` a `src/shared/ui/` para reutilizarlos entre `forum`, `profile`, `comments` y `notifications`.
- [ ] **UI-09 · Ícono y Splash Oficiales en `app.json` (T-15)**
  - Reemplazar `icon`, `adaptiveIcon` y `splash` en `app.json` por los recursos gráficos definitivos de la Fundación ASISCO UP.
