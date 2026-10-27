# Mapa de pantallas

Capturas y HTML con las medidas exactas de cada pantalla: `diseno/` (ver `diseno/README.md`).

> Roles: los mockups muestran «Familia» y «Profesional» como etiqueta de rol. En la app real la etiqueta sale del rol del backend (Acudiente, Donante, Tallerista, Estudiante, Administrador); ver `api-auth.md`.

Referencia para construir cada pantalla. Los nombres de archivo son los del prototipo (`*.dc.html`) y los frames de Figma. Rutas de Expo Router sugeridas; el módulo indica dónde vive el código (ver `AGENTS.md`, sección 3).

## Navegación general

- **Barra inferior (4 pestañas):** Foros · Ecosistema · Asistente · Perfil (el Perfil se muestra con el avatar de la persona, como en Instagram). Aparece en las pantallas principales, no en las modales.
- Flujo de entrada: Login → Foro.
- Fuera de alcance por ahora: **Oportunidades**.

| # | Pantalla | Ruta | Módulo | Mockup |
|---|---|---|---|---|
| 1 | Inicio de sesión | `(auth)/login` | auth | Main |
| 2 | Foro | `(tabs)/index` | forum | Inicio |
| 2a | Nueva publicación (modal) | `posts/new` | posts | NuevaPublicacion |
| 2b | Comentarios (hoja inferior) | `comments/[postId]` | comments | Comentarios |
| 2c | Notificaciones | `(tabs)/notifications` | notifications | Notificaciones |
| 3 | Ecosistema | `(tabs)/ecosystem` | ecosystem | Modulos |
| 4 | Asistente | `(tabs)/assistant` | assistant | Chat |
| 5 | Perfil propio | `(tabs)/profile` | profile | Perfil |
| 5b | Perfil de otra persona | `users/[userId]` | profile | PerfilUsuario |
| 5c | Ajustes del perfil | `profile/settings` | settings | Ajustes |

## Detalle por pantalla

**1 · Login.** Un único login para todos los roles. Campos: correo y contraseña, con botón para mostrar u ocultar la contraseña. Hay además «¿Olvidaste tu contraseña?», «Crear cuenta» e «Ingresar como invitado»: se muestran, pero por ahora sin función (el backend todavía no los cubre; ver `tarea-login.md`). Detalle completo de la tarea y del contrato con el backend en `docs/tarea-login.md` y `docs/api-auth.md`.

**2 · Foro.** Feed vertical: una publicación ocupa el centro y se asoman la anterior y la siguiente (scroll con imán, `FlatList` + `snapToInterval`). Header verde con «+» (nueva publicación), nombre de la app y campana (punto naranja si hay notificaciones sin leer). Filtros por tema: Todos, Avisos, Preguntas, Guías, Logros, cada uno con su color (franja de la tarjeta, etiqueta y chip). Tipos de publicación: imagen, video y solo texto. El header se oculta al hacer scroll hacia abajo (solo quedan los filtros) y vuelve al subir. Tocar avatar o nombre del autor abre su perfil (5b); el botón de comentarios abre 2b.

**2a · Nueva publicación.** Pantalla modal estilo Instagram. Arriba: X (cancelar), título «Nueva publicación» en verde y «Publicar» (botón verde sólido). Cuerpo: avatar, nombre y rol; texto **sin límite de caracteres**; foto adjunta con X para quitarla; elegir un tema (Preguntas, Guías o Logros; **Avisos solo lo publica la fundación**). Abajo: tira «Recientes» con cámara y fotos. Publicar o cancelar vuelve al Foro. La vista actual ya incluye el borrador local y la selección de tema; el envío y la selección de archivos esperan su integración, sin respuestas simuladas.

**2b · Comentarios.** Hoja que sube desde abajo sobre la publicación (el foro queda atenuado; tocar el fondo o la flecha vuelve). Título «Comentarios» y flecha en verde. Cada comentario: avatar, nombre, hace cuánto, texto, «Responder», «Ver respuestas» (despliega el hilo) y corazón. Al responder aparece «Respondiendo a…». Campo de texto con «Publicar» en verde. Los comentarios de la fundación llevan el sello «Fundación».

**2c · Notificaciones.** Se abre con la campana y conserva el footer. Agrupadas por fecha: **Hoy, Ayer, Últimos 7 días, Últimos 30 días**; lo anterior a 30 días no se muestra. Tipos: comentaron tu publicación, me gusta a tu publicación, me gusta a tu comentario, respondieron tu comentario y avisos de la fundación (ASISCO UP, arriba de Hoy). «Marcar leídas»; al tocar una se marca como leída (punto naranja = sin leer). El header se oculta al bajar. La vista actual muestra los cuatro periodos vacíos hasta que exista el servicio; no inventa notificaciones ni confirma acciones del backend.

**3 · Ecosistema.** Muestra las tarjetas de SUMA 21, AULA UP, SAGA-UP, SON UP y LUPE, con sus descripciones e íconos de enlace externo. Por ahora son solo visuales: no navegan porque aún no se han definido las URL de los otros sistemas.

**4 · Asistente.** Preguntas frecuentes basadas en reglas, **sin texto libre**: la persona elige tema, luego pregunta, y recibe una respuesta fija (con enlace al sistema que corresponda). Las respuestas aparecen una a una (con indicador «escribiendo») y la pantalla baja sola. Si no le sirve, o con «Hablar con una persona», se deriva a un gestor con un resumen para no repetir. Algunas respuestas de política son provisionales: **confirmar con la fundación**. La vista inicial está disponible; opciones, respuestas y derivación muestran que aún falta confirmar el contenido y conectar sus flujos.

**5 · Perfil propio.** Avatar, nombre, rol, y cifras: publicaciones, seguidores y seguidos. «Mi información» (correo, fecha de nacimiento, ciudad, miembro desde) visible solo para la persona. Pestañas: **Publicaciones** y **Guardados** (privados). Engranaje abre Ajustes. El header se oculta al bajar.

**5b · Perfil de otra persona.** Nombre, rol, cifras y botón **Seguir / Siguiendo** (al seguir suma 1 a seguidores). Solo sus publicaciones. Los datos personales aparecen **únicamente si la persona los activó en Ajustes**; por defecto no se ve ninguno. Nunca se ven sus guardados.

**5c · Ajustes.** «Así te ven los demás» (vista previa que se actualiza al instante). «Información que muestras»: interruptores para Correo, Fecha de nacimiento y Ciudad (apagado = «Solo yo»). «Quién puede seguirte»: cualquier miembro o con aprobación. **Cerrar sesión** al final (vuelve al Login).

## Componentes compartidos que ya aparecen en varias pantallas

`HeaderTeal` (con y sin ocultarse al hacer scroll) · `BottomNavBar` · `PostCard` · `CategoryChip` · `Avatar` · `ModalSheet` · `ToggleRow` · `StatBlock` (publicaciones / seguidores / seguidos) · `NotificationRow` · `CommentItem`.

## Datos de ejemplo

Los datos de ejemplo (publicaciones, comentarios, notificaciones) salen de los mockups y son ficticios. La app no los simula: los recibe del backend (o, de momento, del mock server de Postman del equipo).
