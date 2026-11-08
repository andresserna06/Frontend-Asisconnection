# PENDIENTES

Lista viva de tareas **abiertas**. Cuando una tarea se termina, se **borra de aquí** y se registra en `BITACORA.md`.

Cómo se usa:

- Una tarea = una pantalla o un componente, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso (con nombre de quien la tiene) · `[!]` bloqueada (con la razón).
- Prioridad por orden: lo de arriba se hace primero.
- Detalle de pantallas en `pantallas.md`; reglas en `../AGENTS.md`.

## En orden de trabajo

- [ ] **T-03b Probar el login y los módulos en Expo Go** contra el backend real en Render (`https://asisconection.onrender.com/v1`) tras redesplegar los nuevos endpoints del backend.
- [ ] **T-05 Componentes base** (`shared/ui`): `Button`, `Input`, `Avatar`, `CategoryChip`, `ToggleRow`, `HeaderTeal` (con ocultar al hacer scroll).
- [ ] **T-11 Perfil de otra persona** (seguir / siguiendo con `/actors/:actorId/connections`).
- [ ] **T-15 Ícono y splash de la app.** Reemplazar los de la plantilla en `app.json` (`icon`, `adaptiveIcon`, `splash`) por los de ASISCO UP.

## Bloqueadas o por decidir

- [!] **Recuperar contraseña** (enlace visible en el login, sin función). El backend no tiene endpoint.
- [!] **Qué roles entran a la app móvil.** Los roles están alineados con el backend (`ADMIN`, `MODERATOR`, `ACUDIENTE`, `VOLUNTARIO`, `INVERSOR`, `BENEFICIARIO`). Falta confirmar si `ADMIN` usa la app o solo el backend, y qué ve cada rol en el Foro.
- [!] **Respuestas del Asistente.** Algunas respuestas de política son provisionales; confirmar con la fundación.

## Pendiente del backend

Lo que la app necesita y todavía no existe. Nadie edita el contrato del backend desde este repo.

- [ ] Redesplegar en Render los cambios del backend (`GET /posts/:postId/comments`, `GET /actors/me/posts`, `GET /notifications`, `PATCH /notifications/read-all`, y campos enriquecidos en `AuthorBadgeDto` y `ActorProfileResponseDto`).
- [ ] Persistencia en servidor de publicaciones guardadas (`/actors/me/saved`) y preferencias de privacidad (Ajustes).
