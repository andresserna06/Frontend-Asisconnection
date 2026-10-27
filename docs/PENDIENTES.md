# PENDIENTES

Lista viva de tareas **abiertas**. Cuando una tarea se termina, se **borra de aquí** y se registra en `BITACORA.md`.

Cómo se usa:

- Una tarea = una pantalla o un componente, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso (con nombre de quien la tiene) · `[!]` bloqueada (con la razón).
- Prioridad por orden: lo de arriba se hace primero.
- Detalle de pantallas en `pantallas.md`; reglas en `../AGENTS.md`.

## En orden de trabajo

- [ ] **T-03b Probar el login en Expo Go** contra el mock server de Postman y, cuando haya backend, contra el real; si su respuesta difiere de `api-auth.md`, ajustar los tipos de `auth/services/authService.ts`.
- [ ] **T-05 Componentes base** (`shared/ui`): `Button`, `Input`, `Avatar`, `CategoryChip`, `ToggleRow`, `HeaderTeal` (con ocultar al hacer scroll).
- [!] **T-06 Foro — servicio de publicaciones pendiente del backend.** La vista, los filtros, el feed y la caché están listos; falta conectar `forumService` con `useAuthorizedHttpClient()` cuando el backend publique sus endpoints y DTOs de publicaciones. No inventar rutas ni usar datos ficticios.
- [ ] **T-07 Comentarios** (modal inferior).
- [ ] **T-10b Integrar el Perfil.** La ruta `(tabs)/profile` y el footer ya apuntan a la pantalla de Perfil integrada desde `main`; queda envolverla en el header verde con título «Mi perfil» y engranaje cuando el header compartido esté disponible, retirar su `insets.top` y conectar Ajustes (T-12). Cuando el backend publique los endpoints de `api-profile.md`, ajustar `profile/services/profileService.ts`.
- [ ] **T-11 Perfil de otra persona** (seguir / siguiendo).
- [ ] **T-12 Ajustes** (visibilidad de datos, quién puede seguirte, cerrar sesión). Mover aquí el «Cerrar sesión» provisional del Foro (`useAuth().signOut`).
- [ ] **T-15 Ícono y splash de la app.** Reemplazar los de la plantilla en `app.json` (`icon`, `adaptiveIcon`, `splash`) por los de ASISCO UP.

## Bloqueadas o por decidir

- [!] **Registro de cuenta** (el botón «Crear cuenta» ya está en el login, sin función). El backend lo permite (solo ACUDIENTE y DONANTE), pero falta diseñar la pantalla. Campos: `username`, `email`, `clave` de 12+ caracteres, `rol`.
- [!] **Recuperar contraseña** (enlace visible en el login, sin función). El backend no tiene endpoint.
- [!] **Ingresar como invitado** (botón visible en el login, sin función). No existe en el backend y hay que decidir qué ve un invitado (Ley 1581).
- [!] **Qué roles entran a la app móvil.** Los roles son los mismos del backend para todos los proyectos (ADMIN, ESTUDIANTE, ACUDIENTE, DONANTE, TALLERISTA). Falta confirmar si ADMIN usa la app o solo el backend, y qué ve cada rol en el Foro (por ejemplo, quién puede publicar Avisos).
- [!] **URL del backend en Render.** La compartirá SAGA UP; hasta entonces se usa el repositorio simulado.
- [!] **Respuestas del Asistente.** Algunas respuestas de política son provisionales; confirmar con la fundación.

## Pendiente del backend

Lo que la app necesita y todavía no existe. Nadie edita el contrato del backend desde este repo.

- [ ] Publicaciones (crear, listar por tema, tipos imagen, video y texto).
- [ ] Comentarios y respuestas.
- [ ] Notificaciones (listar, agrupar por fecha, marcar leídas y conservar máximo 30 días).
- [ ] Seguir y dejar de seguir (con aprobación opcional).
- [ ] Preferencias de visibilidad del perfil.
- [ ] Perfil propio, publicaciones propias y guardados: propuesta en `api-profile.md` (`/usuarios/me`, `/usuarios/me/publicaciones`, `/usuarios/me/guardados`). Mientras tanto, agregarlos al mock server de Postman.
