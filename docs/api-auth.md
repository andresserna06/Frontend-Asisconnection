# Contrato de autenticación y sesiones (`AsisConexión Backend`)

Fuente de verdad: `specs/001-asisconexion-mvp/contracts/openapi.yaml` del repositorio `Asisconnection` desplegado en Render (`https://asisconection.onrender.com/v1`).

Base configurada en `.env`:
```env
EXPO_PUBLIC_API_URL=https://asisconection.onrender.com/v1
```

## 1. Roles del Ecosistema

Los códigos de rol se comparten en `src/shared/domain/models/RoleCode.ts` y sus etiquetas/prioridades viven en `src/modules/auth/domain/models/Role.ts`:

| Rol del backend (`RoleCode`) | Etiqueta en pantalla | Prioridad | Tono (`RoleBadge`) |
|---|---|---:|---|
| `ADMIN` | Administrador | 1 | `primary` |
| `MODERATOR` | Moderador | 2 | `primary` |
| `VOLUNTARIO` | Voluntario | 3 | `accent` |
| `INVERSOR` | Inversor | 4 | `neutral` |
| `ACUDIENTE` | Acudiente | 5 | `neutral` |
| `BENEFICIARIO` | Beneficiario | 6 | `neutral` |

Cuando un usuario posee múltiples roles (`local_role`, `rol`, `external_roles`), `getPrimaryRole` selecciona el de mayor prioridad (menor número).

## 2. Endpoints consumidos por `src/modules/auth/services/authService.ts`

| Método y ruta | Auth | Uso en la app |
|---|---|---|
| `POST /auth/login` | No | Autentica contra el servicio central de identidad, sincroniza `UserAccount` + `Actor` en `ASISCONEXION_DB` y devuelve `device_token` + `user`. |
| `POST /auth/registro` | No | Registra cuenta nueva, sincroniza `UserAccount` + `Actor` y devuelve `device_token` + `user`. |
| `POST /sessions/anonymous` | No | Crea sesión rápida por dispositivo (`device_token` + `session_id`) con aceptación de consentimiento Ley 1581. |
| `GET /actors/me` | `Bearer <device_token>` | Valida la sesión guardada en `expo-secure-store` al abrir la app y restaura `username` y `primary_role`. |

> **Cierre de sesión (`signOut`)**: el `device_token` es un JWT local de sesión de dispositivo; cerrar sesión limpia el token en `expo-secure-store` sin requerir petición HTTP adicional.

## 3. Payloads de entrada y salida

### `POST /auth/login`
**Envía (`SyncSessionDto`)**:
```json
{
  "email": "maria@prueba.com",
  "clave": "ClaveAcudiente2026",
  "accept_consent": true
}
```
> **Ley 1581 de 2012 y Ley 1098 de 2006**: `accept_consent` debe ser estrictamente el booleano `true`. El formulario de login incluye `ConsentCheckbox` obligatorio antes de enviar.

**Recibe (`200 OK` — `AuthSessionResponseDto`)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "maria.acudiente",
    "email": "maria@prueba.com",
    "rol": "ACUDIENTE",
    "external_roles": ["ACUDIENTE"],
    "local_role": null
  },
  "device_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "synced_with_global_db": true
}
```

### `POST /auth/registro`
**Envía (`RegisterUserDto`)**:
```json
{
  "username": "carlos.voluntario",
  "email": "carlos@prueba.com",
  "clave": "ClaveSegura123",
  "rol": "VOLUNTARIO",
  "accept_consent": true
}
```

### `POST /sessions/anonymous`
**Envía (`InitAnonymousSessionDto`)**:
```json
{
  "accept_consent": true,
  "nickname": "InvitadoFamiliar",
  "role_tag": "ACUDIENTE"
}
```

**Recibe (`201 Created` — `AnonymousSessionResponseDto`)**:
```json
{
  "device_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 4. Manejo de errores homologado (RFC 7807 `ProblemDetails`)

El backend responde todos los errores en formato estándar RFC 7807:
```json
{
  "type": "https://asisconexion.org/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Error de validación en los datos enviados.",
  "errors": [
    { "field": "email", "message": "email must be an email" },
    { "field": "accept_consent", "message": "Debe aceptar expresamente el tratamiento de datos personales." }
  ]
}
```

| Código HTTP | Traducción a `AuthError.kind` | Comportamiento en la UI |
|---|---|---|
| `400` | `validation` (`fieldErrors`) | Muestra el mensaje de error debajo del campo (`email`, `password`, `acceptConsent`). |
| `401` | `invalidCredentials` (en login) / `sessionExpired` (en `/actors/me`) | En login muestra credenciales inválidas; en rutas protegidas limpia `expo-secure-store` y redirige a `(auth)/login`. |
| `403` | `forbidden` | Muestra aviso de cuenta sin permisos o inactiva. |
| `502` o sin red | `network` | Muestra aviso de problema de conexión (incluye caída o rate-limit del servicio central de identidad). |
