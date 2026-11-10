# ADR-001: Arquitectura de Integración del Frontend Móvil con el Backend AsisConexión

- **Estado**: Aceptado e Implementado
- **Fecha**: 2026-11-08
- **Proyecto**: ASISCONNECTION (App Móvil — Expo SDK 57 + React Native + TypeScript estricto)
- **Backend objetivo**: `https://asisconection.onrender.com/v1` (`Asisconnection` — NestJS + PostgreSQL `ASISCONEXION_DB`)

---

## 1. Contexto

La aplicación móvil comunitaria de la Fundación ASISCO UP fue estructurada siguiendo una arquitectura modular por capas (`ui → application → domain ← services`) y Atomic Design en `shared/ui`, con reglas estrictas forzadas por ESLint (`eslint.config.js`):
- Ningún componente de `ui/` puede importar directamente de `services/` ni llamar a `fetch`.
- Ningún archivo de `domain/` puede depender de React, React Native, Expo ni de otras capas.
- Ningún módulo puede importar rutas internas de otro módulo; toda comunicación inter-módulo ocurre a través del `index.ts` público de cada módulo.
- La app maneja datos sensibles de personas con síndrome de Down, menores de edad y sus familias, sujetos a la **Ley 1581 de 2012** y la **Ley 1098 de 2006** en Colombia.

Al conectar los 9 módulos del frontend (`auth`, `forum`, `posts`, `comments`, `profile`, `settings`, `assistant`, `ecosystem`, `notifications`) con el backend real en Render, surgieron diferencias de contrato (paginación `{ data, meta }`, códigos de rol, identificadores UUID de categorías, moderación previa en dos capas, errores RFC 7807 y trazabilidad de consentimiento) que debían resolverse sin romper la arquitectura ni las garantías legales.

---

## 2. Decisiones Arquitectónicas

### Decisión 1: Cliente HTTP Único y Sesión Autorizada Centralizada en `auth`
- **Qué se decidió**: Todas las llamadas de red utilizan `createHttpClient(EXPO_PUBLIC_API_URL)` en `src/shared/lib/http`. El módulo `auth` expone `useAuthorizedHttpClient()`, que inyecta automáticamente el `device_token` almacenado en `expo-secure-store` y cierra la sesión local ante cualquier respuesta `401 Unauthorized`.
- **Por qué**: Garantiza que el token de sesión nunca salga del módulo `auth`, evita duplicar lógica de cabeceras `Authorization: Bearer` o manejo de sesiones expiradas en los demás módulos, y cumple la Ley 1581 al persistir credenciales únicamente en almacenamiento cifrado (`expo-secure-store`).

### Decisión 2: Raíces de Composición por Módulo (`useXService.ts` y `AppXProvider.tsx`)
- **Qué se decidió**: Para respetar la regla de que `ui/` no importe `services/` y que `application/` dependa solo de contratos de `domain/`, cada módulo define un punto de composición en su raíz (`usePostsService.ts`, `useProfileService.ts`, `useAssistantService.ts`, `useEcosystemService.ts`, `useNotificationsService.ts`, `AppForumProvider.tsx`, `AppCommentsProvider.tsx`).
- **Por qué**: Permite inyectar la implementación HTTP real en producción y sustituirla limpiamente por dobles de prueba (`createFakeXService` en `testUtils.ts`) durante las pruebas de interfaz y aplicación con Jest y Testing Library.

### Decisión 3: Contratos de Dominio Compartidos en `src/shared/domain/models/`
- **Qué se decidió**: Los tipos transversales que son utilizados por dos o más módulos (`RoleCode`, `CategoryCode` + `toCategoryCode`, `Post`) residen en `src/shared/domain/models/`.
- **Por qué**: Evita dependencias circulares entre `auth`, `forum`, `posts` y `profile`, manteniendo `domain/` libre de acoplamientos entre módulos.

### Decisión 4: Traducción de Categorías por Nombre/Tema con Caché Ligera en Memoria
- **Qué se decidió**: El backend identifica las categorías por UUID (`category_id`) y nombre (`Noticias`, `Salud`, `Apoyo Pedagógico`, `Voluntariado`), mientras que el diseño del frontend aplica paletas de color semánticas mediante `CategoryCode` (`announcements`, `questions`, `guides`, `achievements`). Se implementó `toCategoryCode(name, mainTopic)` y una caché ligera de `GET /categories` dentro de `forumService`, `postsService` y `profileService`.
- **Por qué**: Conserva intactos los tokens visuales y de accesibilidad del diseño móvil mientras consume y envía los UUID reales exigidos por `ASISCONEXION_DB`.

### Decisión 5: Moderación Previa Transparente en Publicaciones y Comentarios (RN-02)
- **Qué se decidió**: Dado que el backend aplica moderación en dos capas (Filtro Automático OCP + Moderación Humana `PENDING` → `APPROVED`), `postsService` y `commentsService` devuelven el objeto `PendingSubmissionResponseDto` (`{ id, status, rejection_reason, message }`) para que la UI informe explícitamente al usuario que su publicación o comentario fue enviado a moderación antes de hacerse público.
- **Por qué**: Evita que el usuario crea erróneamente que su publicación falló cuando aún no aparece en el listado público (`GET /posts` y `GET /posts/:postId/comments` solo exponen contenido `APPROVED`).

### Decisión 6: Privacidad por Defecto y Consentimiento Explícito (Ley 1581 de 2012)
- **Qué se decidió**:
  1. Se añadió `ConsentCheckbox` obligatorio en `LoginScreen` enviando `accept_consent: true` en `POST /auth/login`, `POST /auth/registro` y `POST /sessions/anonymous`.
  2. En `SettingsScreen` (`PrivacySettings.ts` + `settingsService.ts`), todos los interruptores de exposición de datos personales (`showEmail`, `showBirthDate`, `showCity`, `requireFollowApproval`) están apagados (`false`) por defecto y se sincronizan de forma optimista con `GET /actors/me` y `PATCH /actors/me`.
  3. No se registra ningún dato sensible ni token en `console.log`.

### Decisión 7: Hooks de Aplicación Listos para Consumo por el Equipo de UI
- **Qué se decidió**: Dejar implementada y probada toda la estructura funcional (`domain` + `services` + `application`) de los flujos restantes para que el equipo de diseño/interfaz únicamente conecte los componentes visuales:
  1. **Modo Invitado y Registro**: `AuthProvider.tsx` (`signInAnonymous`, `register`) y `useLogin.ts` (`submitAnonymous`).
  2. **Perfil Público y Conexiones**: `usePublicProfile(actorId, service)` (`GET /actors/:id` y `POST /connections`).
  3. **Cola de Moderación Humana**: `useModerationQueue(repository, isEnabled)` (`GET /admin/moderation/pending` y `PATCH /admin/moderation/(posts|comments)/:id/status` con invalidación automática de caché de TanStack Query).

---

## 3. Consecuencias

- **Positivas**:
  - Cobertura completa de pruebas automatizadas: **27 suites y 111 tests pasando** en `domain/`, `application/`, `services/` y `ui/`.
  - Cumplimiento estricto de `tsc --noEmit` (0 errores) y `eslint src --max-warnings=0` (0 errores, 0 advertencias).
  - Desacoplamiento total entre vistas y red: cambiar de entorno (local, staging o producción en Render) solo requiere actualizar `EXPO_PUBLIC_API_URL`.
- **Compromisos**:
  - Cualquier nuevo endpoint futuro debe declararse primero como contrato en `domain/*Service.ts`, implementarse en `services/*Service.ts` con `HttpClient` y exponerse a la UI mediante el hook de composición del módulo.
