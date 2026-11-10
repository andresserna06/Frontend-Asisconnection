# Contrato administrativo

Fuente: Swagger del backend en `https://asisconection.onrender.com/api/docs`.
Las operaciones requieren una sesión autenticada. El backend es la autoridad para
verificar permisos; la app solo ofrece el panel a cuentas con el rol `ADMIN`.

## Capacidades disponibles

| Operación | Endpoint | Uso |
|---|---|---|
| Consultar pendientes | `GET /v1/admin/moderation/pending?page=1&limit=20&type=POST\|COMMENT` | Lista publicaciones y comentarios pendientes, con paginación (máximo 50 por página). |
| Revisar publicación | `PATCH /v1/admin/moderation/posts/{id}/status` | Envía `{"status":"APPROVED"}` o `{"status":"REJECTED"}`. |
| Revisar comentario | `PATCH /v1/admin/moderation/comments/{id}/status` | Envía `{"status":"APPROVED"}` o `{"status":"REJECTED"}`. |
| Listar moderadores | `GET /v1/admin/moderators` | Lista cuentas que tienen el rol local `MODERATOR`. |
| Asignar moderador | `PUT /v1/admin/moderators/{userAccountId}` | Asigna el rol local `MODERATOR` a una cuenta registrada. |
| Revocar moderador | `DELETE /v1/admin/moderators/{userAccountId}` | Retira el rol local `MODERATOR`. |

El backend permite consultar la cola de moderación tanto a `ADMIN` como a
`MODERATOR`, pero la aplicación móvil expone este panel solo a `ADMIN`.

## Limitación del contrato: directorio de cuentas

No existe una operación para buscar o listar cuentas que todavía no son
moderadoras. `GET /v1/admin/moderators` solo devuelve las cuentas que ya tienen
ese rol, por lo que no permite descubrir a quién más se le puede asignar.

Para completar la gestión desde la app, el backend debe exponer un endpoint
protegido para `ADMIN`, por ejemplo
`GET /v1/admin/users?page=1&limit=20&search=...`, con paginación. Cada resultado
debe incluir el `userAccountId` aceptado por `PUT /v1/admin/moderators/{userAccountId}`,
el nombre de usuario y los roles actuales; no hace falta incluir el correo para
identificar la cuenta en el panel. El backend debe excluir sesiones anónimas y
aplicar la autorización aunque se invoque la ruta fuera de la aplicación.

Hasta que ese contrato esté desplegado, la app no puede construir un directorio
real de usuarios ni debe inventar datos o intentar enumerar cuentas usando otros
endpoints. El campo manual de ID y la lista de moderadores existentes son las
únicas capacidades disponibles.
