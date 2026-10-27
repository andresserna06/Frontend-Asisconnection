# Contrato esperado del Perfil (propuesta del frontend)

**Estos endpoints todavía no existen en el backend.** Es lo que la app espera para la pantalla «Mi perfil» (`05-Perfil`, `05c-Perfil-guardados`). No es el contrato oficial: cuando SAGA UP publique los endpoints reales, se ajustan **solo** las rutas (`PATHS`) y los tipos de respuesta de `src/modules/profile/services/profileService.ts`, y los modelos si cambian los campos. La pantalla no se toca.

Base: `EXPO_PUBLIC_API_URL`. Todas las rutas requieren `Authorization: Bearer <token>` (lo pone `useAuthorizedHttpClient()`; un 401 cierra la sesión).

## Endpoints

| Método y ruta | Para qué | Respuesta (200) | Modelo en la app |
|---|---|---|---|
| `GET /usuarios/me` | Perfil propio: datos, cifras y datos personales | objeto `MyProfile` | `profile/domain/models/MyProfile.ts` |
| `GET /usuarios/me/publicaciones` | Publicaciones propias, de la más nueva a la más vieja | arreglo de `Post` | `posts/domain/models/Post.ts` |
| `GET /usuarios/me/guardados` | Publicaciones guardadas (privadas, nunca se muestran a otros) | arreglo de `Post` | `posts/domain/models/Post.ts` |

## Cuerpos de respuesta

`GET /usuarios/me`:
```json
{
  "id": "u-123",
  "fullName": "Nombre Apellido",
  "roles": ["ACUDIENTE"],
  "photoUrl": null,
  "email": "persona@ejemplo.com",
  "birthDate": "1988-05-14",
  "city": "Manizales",
  "memberSince": "2026-03-01",
  "postCount": 4,
  "followerCount": 38,
  "followingCount": 21,
  "savedCount": 2
}
```
- `birthDate` y `city` pueden ser `null` si la persona no los agregó (la app muestra «Sin agregar»).
- Fechas: `birthDate` y `memberSince` como `YYYY-MM-DD`.
- `roles`: los mismos códigos de `api-auth.md`.

Cada elemento de `/publicaciones` y `/guardados`:
```json
{
  "id": "p-1",
  "category": "achievements",
  "text": "Texto de la publicación",
  "imageUrl": "https://…/foto.jpg",
  "imageDescription": "Descripción de la foto para lectores de pantalla",
  "createdAt": "2026-10-24T12:00:00Z",
  "likeCount": 61,
  "commentCount": 23,
  "author": { "id": "u-123", "fullName": "Nombre Apellido", "roles": ["ACUDIENTE"], "photoUrl": null }
}
```
- `category`: `announcements` (Avisos), `questions` (Preguntas), `guides` (Guías) o `achievements` (Logros).
- `imageUrl` e `imageDescription` en `null` si la publicación no tiene foto.
- `createdAt` en ISO 8601 (la app muestra «hace 2 días»).

## Errores

| Caso | Qué hace la app |
|---|---|
| Sin conexión o tiempo agotado | «No hay conexión…» con botón Reintentar |
| `401` | Cierra la sesión y vuelve al login (lo hace `auth`) |
| Cualquier otro código | «No pudimos cargar tu perfil…» con Reintentar |

## Privacidad (Ley 1581)

Estos endpoints devuelven datos **de la propia persona** y solo deben responder a su token. Lo que ven los demás (perfil de otra persona, `5b`) depende de los interruptores de Ajustes y es otro endpoint.

## Para probar antes de que exista el backend

Agregar estas tres rutas, con los ejemplos de arriba, al mock server de Postman del equipo. La app no simula datos en el código.
