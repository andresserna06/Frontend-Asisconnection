# PENDIENTES

Lista viva de tareas **abiertas**. Cuando una tarea se termina, se **borra de aquí** y se registra en `BITACORA.md`.

Cómo se usa:

- Una tarea = una pantalla o un componente, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso (con nombre de quien la tiene) · `[!]` bloqueada (con la razón).
- Prioridad por orden: lo de arriba se hace primero.
- Detalle de pantallas en `pantallas.md`; reglas en `../AGENTS.md`.

## En orden de trabajo

## Bloqueadas o por decidir

- [!] **T-03b Probar el login y los módulos en Expo Go**. Render responde en categorías, foro, FAQ y directorio; falta probar el flujo autenticado desde Expo Go con una cuenta de prueba válida.
- [!] **T-11 Perfil de otra persona**. Swagger solo expone `GET /actors/{id}`, `GET /connections` y `POST /connections`; no hay listado público de publicaciones por actor ni endpoint para dejar de seguir. La ruta del pendiente (`/actors/:actorId/connections`) no existe en el contrato desplegado.
- [!] **Recuperar contraseña** (enlace visible en el login, sin función). El backend no tiene endpoint.
- [!] **Qué roles entran a la app móvil.** Los roles están alineados con el backend (`ADMIN`, `MODERATOR`, `ACUDIENTE`, `VOLUNTARIO`, `INVERSOR`, `BENEFICIARIO`). Falta confirmar si `ADMIN` usa la app o solo el backend, y qué ve cada rol en el Foro.
- [!] **Respuestas del Asistente.** Algunas respuestas de política son provisionales; confirmar con la fundación.

## Pendiente del backend

Lo que la app necesita y todavía no existe. Nadie edita el contrato del backend desde este repo.

- [ ] Añadir endpoint paginado de publicaciones aprobadas por actor público (`GET /v1/actors/{id}/posts` o filtro `actorId` en `/v1/posts`) y definir operación para cancelar una conexión (`DELETE /v1/connections/{id}`); requeridos para completar T-11 sin descargar y filtrar todo el feed.
- [ ] Persistencia en servidor de publicaciones guardadas (`/actors/me/saved`).
