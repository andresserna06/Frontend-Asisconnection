# PENDIENTES

Lista viva de tareas **abiertas**. Cuando una tarea se termina, se **borra de aquí** y se registra en `BITACORA.md`.

Cómo se usa:

- Una tarea = una pantalla o un componente, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso (con nombre de quien la tiene) · `[!]` bloqueada (con la razón).
- Prioridad por orden: lo de arriba se hace primero.
- Detalle de pantallas en `pantallas.md`; reglas en `../AGENTS.md`.

## En orden de trabajo

## Bloqueadas o por decidir

- [!] **T-23 Directorio de usuarios para ADMIN**. Bloqueado hasta que el backend exponga una lista paginada de cuentas registradas con `userAccountId`, nombre de usuario y roles para poder asignar moderadores.
- [!] **T-24 Diagnosticar 401 de Notificaciones**. Comparar con el backend el mismo `device_token` en `/actors/me` y `/notifications`, revisar la asociación sesión→actor y la causa del `DeviceSessionGuard`; no retirar la mitigación frontend hasta confirmar la corrección.
- [!] **T-03b Probar el login y los módulos en Expo Go**. Render responde en categorías, foro, FAQ y directorio; falta probar el flujo autenticado desde Expo Go con una cuenta de prueba válida.
- [!] **T-11 Publicaciones en perfil de otra persona**. Perfil y seguimiento ya usan los endpoints desplegados; falta que el backend exponga una lista paginada de publicaciones aprobadas por actor para mostrar su cuadrícula.
- [!] **Recuperar contraseña** (enlace visible en el login, sin función). El backend no tiene endpoint.
- [!] **Qué roles participan en el Foro móvil.** Se confirmó que `ADMIN` usa la app para el panel de administración. Falta definir qué ve cada rol en el Foro y si `MODERATOR` moderará desde el flujo móvil.
- [!] **Respuestas del Asistente.** Algunas respuestas de política son provisionales; confirmar con la fundación.

## Pendiente del backend

Lo que la app necesita y todavía no existe. Nadie edita el contrato del backend desde este repo.

- [ ] Añadir endpoint paginado de publicaciones aprobadas por actor público (`GET /v1/actors/{id}/posts` o filtro `actorId` en `/v1/posts`); necesario para mostrar la cuadrícula del perfil público sin descargar y filtrar todo el feed.
- [ ] Añadir operación protegida para cancelar/dejar de seguir una conexión (por ejemplo `DELETE /v1/connections/{id}`) si se requiere que el botón «Siguiendo» sea reversible.
- [ ] Persistencia en servidor de publicaciones guardadas (`/actors/me/saved`).
- [ ] Exponer un endpoint paginado y exclusivo para ADMIN (por ejemplo `GET /v1/admin/users?page=1&limit=20&search=...`) con `userAccountId`, username y roles actuales. Excluir sesiones anónimas; no exponer email si no es necesario. El ID debe ser compatible con `PUT /v1/admin/moderators/{userAccountId}`.
- [ ] Diagnosticar el 401 de `GET /v1/notifications`: verificar el mismo `device_token` en `/actors/me` y `/notifications`, la validación del `DeviceSessionGuard` y la resolución de la sesión a su Actor. Registrar únicamente metadatos de diagnóstico; nunca tokens ni datos personales. Validar también `PATCH /v1/notifications/read-all`.
