# Contrato Administrativo y de Moderación (`AsisConexión Backend`)

Fuente: Swagger del backend en `https://asisconection.onrender.com/api/docs`.
Todas las operaciones requieren sesión autenticada (`DeviceSessionGuard` + `RolesGuard`).

## Capacidades Disponibles

| Operación | Endpoint | Rol Requerido | Uso |
|---|---|---|---|
| Consultar cola pendiente | `GET /v1/admin/moderation/pending?page=1&limit=20&type=POST\|COMMENT` | `ADMIN` o `MODERATOR` | Lista publicaciones y comentarios pendientes, con paginación. |
| Cambiar estado de publicación | `PATCH /v1/admin/moderation/posts/{id}/status` | `ADMIN` o `MODERATOR` | Envía `{"status":"APPROVED"}` o `{"status":"REJECTED"}`. |
| Cambiar estado de comentario | `PATCH /v1/admin/moderation/comments/{id}/status` | `ADMIN` o `MODERATOR` | Envía `{"status":"APPROVED"}` o `{"status":"REJECTED"}` (rechaza en cascada respuestas hijas). |
| Listar reportes comunitarios | `GET /v1/admin/moderation/reports?page=1&limit=20&status=OPEN\|RESOLVED\|DISMISSED` | `ADMIN` o `MODERATOR` | Lista denuncias comunitarias con vista previa del contenido reportado. |
| Resolver reporte comunitario | `PATCH /v1/admin/moderation/reports/{id}/resolve` | `ADMIN` o `MODERATOR` | Envía `{"status":"RESOLVED"\|"DISMISSED","reject_target":true\|false}`. |
| Buscar cuentas registradas | `GET /v1/admin/accounts?search=...` | `ADMIN` | Busca cuentas activas por `username`, `email`, `first_names` o `last_names` con `display_name` y `avatar_url`. |
| Listar moderadores | `GET /v1/admin/moderators` | `ADMIN` | Lista cuentas que tienen el rol local `MODERATOR`. |
| Asignar moderador | `PUT /v1/admin/moderators/{userAccountId}` | `ADMIN` | Asigna el rol local `MODERATOR` a una cuenta registrada. |
| Revocar moderador | `DELETE /v1/admin/moderators/{userAccountId}` | `ADMIN` | Retira el rol local `MODERATOR`. |
| Crear FAQ | `POST /v1/admin/faqs` | `ADMIN` | Crea una pregunta frecuente (`{ question, answer, category }`). |
| Actualizar FAQ | `PATCH /v1/admin/faqs/{id}` | `ADMIN` | Actualiza una pregunta frecuente (`{ question?, answer?, category? }`). |
| Eliminar FAQ | `DELETE /v1/admin/faqs/{id}` | `ADMIN` | Elimina una pregunta frecuente de `faq_knowledge`. |
| Crear enlace del ecosistema | `POST /v1/admin/directory/links` | `ADMIN` | Crea un enlace en `redirection_links` (`{ project_name, url, description }`). |
| Actualizar enlace del ecosistema | `PATCH /v1/admin/directory/links/{id}` | `ADMIN` | Actualiza un enlace (`{ project_name?, url?, description?, is_active? }`). |
| Eliminar enlace del ecosistema | `DELETE /v1/admin/directory/links/{id}` | `ADMIN` | Elimina un enlace de `redirection_links`. |
