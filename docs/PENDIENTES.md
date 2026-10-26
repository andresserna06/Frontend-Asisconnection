# PENDIENTES

Lista viva de tareas **abiertas**. Cuando una tarea se termina, se **borra de aquí** y se registra en `BITACORA.md`.

Cómo se usa:
- Una tarea = una pantalla o un componente, revisable en un solo cambio.
- Estados: `[ ]` pendiente · `[~]` en curso (con nombre de quien la tiene) · `[!]` bloqueada (con la razón).
- Prioridad por orden: lo de arriba se hace primero.
- Detalle de pantallas en `pantallas.md`; reglas en `../AGENTS.md`.

## En orden de trabajo

- [ ] **T-02 Tema y fuentes.** Tokens de `shared/theme` y carga de Nunito y Source Sans 3.
- [ ] **T-02b Roles en la app.** Tipo `Role`, etiquetas en español y `RoleBadge` (ver `api-auth.md`). Depende de T-02.
- [ ] **T-03 Login** (pantalla igual al mockup; crear cuenta, olvidé contraseña e invitado visibles con aviso «disponible pronto»). Detalle en `tarea-login.md`. Depende de T-01 y T-02.
- [ ] **T-04 Estructura de pestañas.** Barra inferior con Foros, Ecosistema, Asistente y Perfil (avatar), pantallas vacías y rutas protegidas.
- [ ] **T-05 Componentes base** (`shared/ui`): `Button`, `Input`, `Avatar`, `CategoryChip`, `ToggleRow`, `HeaderTeal` (con ocultar al hacer scroll).
- [ ] **T-06 Foro.** Feed con `snapToInterval`, filtros por tema, tipos imagen, video y texto. Aquí se instala TanStack Query y se monta su proveedor.
- [ ] **T-07 Comentarios** (modal inferior).
- [ ] **T-08 Nueva publicación.**
- [ ] **T-09 Notificaciones** agrupadas por fecha.
- [ ] **T-10 Perfil propio.**
- [ ] **T-11 Perfil de otra persona** (seguir / siguiendo).
- [ ] **T-12 Ajustes** (visibilidad de datos, quién puede seguirte, cerrar sesión).
- [ ] **T-13 Asistente** (preguntas frecuentes por reglas).
- [ ] **T-14 Ecosistema** (tarjetas con enlaces externos).
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
- [ ] Notificaciones (agrupables por fecha, máximo 30 días).
- [ ] Seguir y dejar de seguir (con aprobación opcional).
- [ ] Preferencias de visibilidad del perfil.
- [ ] Datos del usuario en el perfil (correo, fecha de nacimiento, ciudad, miembro desde).
