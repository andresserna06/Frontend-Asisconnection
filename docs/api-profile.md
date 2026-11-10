# Contrato del Perfil y Ajustes (`AsisConexión Backend`)

Documenta la integración real de `src/modules/profile/services/profileService.ts`, `src/modules/profile/services/publicProfileService.ts` y `src/modules/settings` con el backend `AsisConexión` (`https://asisconection.onrender.com/v1`).

Todas las rutas requieren `Authorization: Bearer <device_token>` inyectado automáticamente por `useAuthorizedHttpClient()`.

## 1. Endpoints consumidos

| Método y ruta                          | Uso en la app                                                                                                                               | Respuesta (`200 OK`)                                      | Modelo en el Frontend                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `GET /actors/me`                       | Carga el perfil propio (nombre, rol, avatar, correo, fecha de nacimiento, ciudad, switches de privacidad y contadores de actividad).        | `ActorProfileResponseDto`                                 | `MyProfile` (`profile/domain/models/MyProfile.ts`)                        |
| `PATCH /actors/me`                     | Actualiza nombres, apellidos, avatar, biografía corta, fecha de nacimiento, ciudad o switches de privacidad Ley 1581 del actor autenticado. | `ActorProfileResponseDto`                                 | `MyProfile` / `PrivacySettings`                                           |
| `GET /actors/me/posts?page=1&limit=20` | Lista las publicaciones propias con `status = APPROVED` ordenadas de la más reciente a la más antigua.                                      | `PostsPageDto` (`{ data, meta }`)                         | `Post[]` (`shared/domain/models/Post.ts`)                                 |
| `GET /categories?page=1&limit=50`      | Traduce el `category_id` (UUID) de cada publicación propia a `CategoryCode` (`announcements`, `questions`, `guides`, `achievements`).       | `CategoriesPageDto` (`{ data, meta }`)                    | `Record<string, CategoryCode>`                                            |
| `GET /actors/{id}`                     | Carga el perfil público de otra persona al tocar el autor en el Foro (filtrando `email`, `birth_date` y `city` según Ley 1581).             | `ActorProfileResponseDto` sin exponer el correo en la UI. | `PublicProfile` (`profile/domain/models/PublicProfile.ts`) / `MyProfile`  |
| `GET /actors/{id}/posts?page=1&limit=20` | Lista las publicaciones aprobadas de otro actor público.                                                                                  | `PostsPageDto` (`{ data, meta }`)                         | `Post[]` (`shared/domain/models/Post.ts`)                                 |
| `GET /connections?page=1&limit=50`     | Busca la relación actual con el actor en las conexiones paginadas.                                                                          | `ActorConnectionsPageDto`                                 | `ProfileConnectionStatus`                                                 |
| `POST /connections`                    | Envía una solicitud para seguir a la persona (`receiver_actor_id`).                                                                         | `ActorConnectionResponseDto` (`PENDING` o `ACCEPTED`)     | `ProfileConnectionStatus` / `ActorConnectionResult`                       |
| `POST /media/upload`                   | Sube un archivo de imagen (`multipart/form-data`) para actualizar el avatar del perfil.                                                     | `{ url, public_id, width, height, format }`               | `string` (`uploadAvatar`)                                                 |

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
  "birth_date": "1990-05-14",
  "city": "Manizales",
  "show_email": false,
  "show_birth_date": false,
  "show_city": false,
  "require_follow_approval": false,
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
- `email`, `birthDate`, `city`: `/actors/me` siempre los devuelve al titular junto con sus banderas `show_email`, `show_birth_date` y `show_city`. En cambio, `/actors/:id` **oculta (`null`)** cada campo cuyo switch de privacidad esté en `false` (cumplimiento Ley 1581 de 2012).
- `postCount`, `followerCount`, `followingCount`: mapeados desde `posts_count`, `followers_count` y `following_count`.

### Perfil público de otra persona (`GET /actors/{id}`)

La app muestra nombre, rol, avatar, biografía y contadores. Ciudad y fecha de
nacimiento solo se muestran cuando el DTO indica explícitamente
`show_city: true` o `show_birth_date: true`; valores sin su indicador activo se
descartan. El correo nunca se muestra en el perfil público.

## 3. Cuerpo de petición de `PATCH /actors/me`

```json
{
  "first_names": "Lucía",
  "last_names": "Gómez",
  "short_bio": "Mamá cuidadora",
  "birth_date": "1990-05-14",
  "city": "Manizales",
  "show_email": false,
  "show_birth_date": false,
  "show_city": true,
  "require_follow_approval": false
}
```

## 4. Privacidad en Ajustes (`src/modules/settings`)

Conforme a la **Ley 1581 de 2012**, todos los interruptores de visibilidad de datos personales inician apagados (`false` = _«Solo yo»_) y se sincronizan con el backend mediante `settingsService` (`GET /actors/me` y `PATCH /actors/me`):

- `showEmail: false` (`show_email`)
- `showBirthDate: false` (`show_birth_date`)
- `showCity: false` (`show_city`)
- `requireFollowApproval: false` (`require_follow_approval`)
