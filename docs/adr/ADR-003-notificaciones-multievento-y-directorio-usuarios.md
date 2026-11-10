# ADR-003: Soporte de Notificaciones Multievento y Directorio de Cuentas para Moderación

* **Estado:** Aceptado e Integrado
* **Fecha:** 2026-11-09
* **Autores:** Equipo Móvil AsisConexión
* **Contexto:**
  1. La pantalla de Notificaciones requería soporte para múltiples tipos de eventos que ocurren en la comunidad (likes en publicaciones, comentarios directos, respuestas a comentarios, avisos de la fundación y nuevos seguidores).
  2. En el modelo de dominio `NotificationItem.ts`, el tipo `NotificationType` no incluía `'NEW_FOLLOWER'`, lo cual impedía tipar de forma estricta los eventos de conexión entre actores.
  3. El equipo de frontend requería un endpoint para listar y buscar cuentas de usuarios para poder implementar la asignación de moderadores sin depender de IDs quemados o estáticos.

---

## Decisiones de Diseño

### 1. Extensión del Modelo de Dominio de Notificaciones
En `src/modules/notifications/domain/models/NotificationItem.ts`:
- Se amplió `NotificationType` para incluir `'NEW_FOLLOWER'`.
- El mapeo en `notificationsService.ts` consume los datos directamente del endpoint autenticado `GET /notifications` proporcionado por el backend con `useAuthorizedHttpClient()`, garantizando el envío del encabezado `Authorization: Bearer <device_token>`.

### 2. Documentación del Directorio de Cuentas para Administración
- El backend habilitó `GET /v1/admin/accounts?search=...`, retornando `{ items: [{ id, username, email, rol, local_role, display_name, avatar_url }], total }`.
- Esto desbloquea la construcción del selector de moderadores en la interfaz administrativa, permitiendo consultar el `id` (`userAccountId`) para invocar `PUT /v1/admin/moderators/:userAccountId` con `{ is_moderator: true | false }`.

### 3. Publicaciones Guardadas / Favoritos
- Se confirmó que el backend MVP no cuenta con persistencia para guardar publicaciones (bookmarks). El método `profileService.getMySavedPosts()` retorna un arreglo vacío `[]`, y la UI de `ProfileScreen` muestra el estado vacío mientras esta funcionalidad se programa para un sprint futuro.

---

## Consecuencias
* **Positivo:** Cero errores de TypeScript (`npx tsc --noEmit` limpio).
* **Positivo:** El catálogo de notificaciones y tipos de eventos queda homologado con el backend.
* **Positivo:** Quedan claras las rutas para maquetar el directorio administrativo sin bloqueos.
