# Contrato del Perfil y Ajustes (`AsisConexión Backend`)

Documenta la integración real de `src/modules/profile/services/profileService.ts` y `src/modules/settings` con el backend `AsisConexión` (`https://asisconection.onrender.com/v1`).

Todas las rutas requieren `Authorization: Bearer <device_token>` inyectado automáticamente por `useAuthorizedHttpClient()`.

## 1. Endpoints consumidos

| Método y ruta                          | Uso en la app                                                                                                                         | Respuesta (`200 OK`)                                      | Modelo en el Frontend                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| `GET /actors/me`                       | Carga el perfil propio (nombre, rol, avatar, correo del titular y contadores de actividad).                                           | `ActorProfileResponseDto`                                 | `MyProfile` (`profile/domain/models/MyProfile.ts`)         |
| `PATCH /actors/me`                     | Actualiza nombres, apellidos, avatar o biografía corta del actor autenticado.                                                         | `ActorProfileResponseDto`                                 | `MyProfile`                                                |
| `GET /actors/me/posts?page=1&limit=20` | Lista las publicaciones propias con `status = APPROVED` ordenadas de la más reciente a la más antigua.                                | `PostsPageDto` (`{ data, meta }`)                         | `Post[]` (`shared/domain/models/Post.ts`)                  |
| `GET /categories?page=1&limit=50`      | Traduce el `category_id` (UUID) de cada publicación propia a `CategoryCode` (`announcements`, `questions`, `guides`, `achievements`). | `CategoriesPageDto` (`{ data, meta }`)                    | `Record<string, CategoryCode>`                             |
| `GET /actors/{id}`                     | Carga el perfil público de otra persona al tocar el autor en el Foro.                                                                 | `ActorProfileResponseDto` sin exponer el correo en la UI. | `PublicProfile` (`profile/domain/models/PublicProfile.ts`) |
| `GET /connections?page=1&limit=50`     | Busca la relación actual con el actor en las conexiones paginadas.                                                                    | `ActorConnectionsPageDto`                                 | `ProfileConnectionStatus`                                  |
| `POST /connections`                    | Envía una solicitud para seguir a la persona (`receiver_actor_id`).                                                                   | `ActorConnectionResponseDto` (`PENDING` o `ACCEPTED`)     | `ProfileConnectionStatus`                                  |

## 2. Cuerpo de respuesta de `GET /actors/me`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_account_id": "u1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "persona.prueba",
  "email": "persona@prueba.com",
  "primary_role": "ACUDIENTE",
  "first_names": "Persona",
  "last_names": "Prueba",
  "avatar_url": "https://cdn.asisco.org/avatar.jpg",
  "short_bio": "Acudiente de la fundación",
  "posts_count": 2,
  "followers_count": 5,
  "following_count": 3,
  "created_at": "2026-03-01T00:00:00.000Z",
  "updated_at": "2026-03-01T00:00:00.000Z"
}
```

### Trazabilidad hacia `MyProfile`:

- `fullName`: concatena `first_names` y `last_names`; si ambos son `null`, usa `username`.
- `roles`: `[primary_role]` validado contra `ROLES`.
- `email`: sólo el endpoint `/actors/me` devuelve `email` (para que el titular lo vea en su propio perfil). El endpoint público `/actors/:id` **jamás** incluye `email` por cumplimiento de la Ley 1581 de 2012.
- `postCount`, `followerCount`, `followingCount`: mapeados desde `posts_count`, `followers_count` y `following_count`.

### Perfil público de otra persona (`GET /actors/{id}`)

La app muestra nombre, rol, avatar, biografía y contadores. Ciudad y fecha de
nacimiento solo se muestran cuando el DTO indica explícitamente
`show_city: true` o `show_birth_date: true`; valores sin su indicador activo se
descartan. El correo nunca se muestra en el perfil público.

El backend actual no ofrece una operación para listar publicaciones aprobadas
por actor. El perfil permite enviar una solicitud de seguimiento y consultar su
estado con las conexiones paginadas, pero no ofrece cancelar/dejar de seguir una
conexión. La cuadrícula del perfil queda pendiente del endpoint de publicaciones;
ver `PENDIENTES.md`.

## 3. Cuerpo de petición de `PATCH /actors/me`

```json
{
  "first_names": "Lucía",
  "last_names": "Gómez",
  "short_bio": "Mamá cuidadora"
}
```

## 4. Privacidad por defecto en Ajustes (`src/modules/settings`)

Conforme a la **Ley 1581 de 2012**, en `src/modules/settings/domain/models/PrivacySettings.ts` todos los interruptores de visibilidad de datos personales inician apagados (`false` = _«Solo yo»_):

- `showEmail: false`
- `showBirthDate: false`
- `showCity: false`
- `requireFollowApproval: false`
