# BITÁCORA

Registro de lo que se **implementa**, lo más reciente arriba. Una entrada por tarea terminada (la tarea sale de `PENDIENTES.md`). Sirve para que cualquier persona o agente sepa qué existe, cómo se probó y por qué se hizo así.

Formato de cada entrada:

```
## AAAA-MM-DD · T-XX Título corto
- Qué se hizo: …
- Archivos principales: …
- Decisiones (y por qué): …
- Cómo se probó: (Expo Go / pruebas / typecheck / lint)
- Queda pendiente: … (y se agregó a PENDIENTES.md)
```

---

## 2026-11-09 · T-15 Ícono y splash de ASISCO UP

- Qué se hizo: se generaron recursos de marca en PNG: icono cuadrado, foreground/monocromo adaptive para Android y wordmark de splash. Se actualizaron `icon`, `ios.icon`, `android.adaptiveIcon`, `web.favicon` y el plugin `expo-splash-screen`.
- Archivos principales: `app.json`, `assets/images/asisco-icon.png`, `assets/images/android-icon-foreground.png`, `assets/images/android-icon-monochrome.png`, `assets/images/asisco-splash.png`.
- Decisiones: se usa fondo verde ASISCO (`#1F6B65`); se quitó el `backgroundImage` azul de plantilla para que Android use `backgroundColor`. El icono iOS ahora apunta al PNG cuadrado porque el directorio `.icon` anterior prevalecía sobre el icono raíz.
- Cómo se probó: `expo config --type public` terminó sin errores; se parseó `app.json` y se verificó que las seis rutas configuradas existan. No se generó build nativo; Expo Go no representa el splash nativo.
- Queda pendiente: T-03b (login en Expo Go con cuenta válida) y T-11 (endpoints públicos faltantes de conexiones/perfil).

## 2026-11-09 · T-05 Componentes base compartidos

- Qué se hizo: se reutilizaron los átomos `Button` e `Input` ya existentes y se incorporaron `Avatar`, `CategoryChip`, `ToggleRow` y `HeaderTeal` en `shared/ui`. Foro y Perfil ahora comparten Avatar/CategoryChip; Ajustes usa ToggleRow; Foro y Notificaciones usan HeaderTeal con el hook compartido de ocultamiento al desplazar.
- Archivos principales: `src/shared/ui/atoms/{Avatar,CategoryChip}.tsx`, `src/shared/ui/molecules/ToggleRow.tsx`, `src/shared/ui/organisms/HeaderTeal.tsx`, pantallas de Foro, Perfil, Ajustes y Notificaciones.
- Decisiones: CategoryChip expone variantes de filtro y etiqueta; la variante de filtro recibe la etiqueta accesible del consumidor para conservar «Filtrar por…». HeaderTeal recibe sus accesorios y la altura animada, dejando las acciones en cada pantalla.
- Cómo se probó: `tsc --noEmit` sin errores, ESLint focalizado sin hallazgos, Jest de Ajustes (2/2) y Foro (2/2) pasaron. La suite de Notificaciones se inició, pero el terminal no devolvió un resultado final.
- Queda pendiente: T-03b, probar login y módulos en Expo Go con una cuenta válida del equipo.

## 2026-11-08 · T-09, T-10b, T-12, T-13, T-14 Integración de Asistente, Ecosistema, Perfil, Ajustes y Notificaciones (Fase 4 — Bloques A, B y C)

- Qué se hizo:
  - **Bloque A (Asistente y Ecosistema)**:
    - `assistantService` conectado a `GET /assistant/faqs` y `POST /assistant/escalate`, con hook `useAssistant` (selección de categoría, respuesta de regla + `disclaimer` legal y derivación a WhatsApp vía `Linking.openURL`) e integración en `AssistantScreen`.
    - `ecosystemService` conectado a `GET /directory/links`, con hook `useEcosystemLinks` (combina con las 5 tarjetas oficiales de la fundación y abre `url` externa cuando el backend la entrega) e integración en `EcosystemScreen` y `EcosystemCard`.
  - **Bloque B (Perfil, Ajustes y Auth Invitado/Registro)**:
    - Backend (`Asisconnection`): se enriqueció `GET /v1/actors/me` con `email` (solo para el propio titular conforme a Ley 1581), `posts_count`, `followers_count` y `following_count`, y se añadió `GET /v1/actors/me/posts`.
    - Frontend (`profileService`): adaptado a `GET /actors/me`, `PATCH /actors/me` (`updateMyProfile`) y `GET /actors/me/posts`.
    - Módulo `settings`: se implementaron `PrivacySettings` (todos los interruptores en `false` por defecto conforme a Ley 1581), `usePrivacySettings` y `SettingsScreen` con vista previa en vivo y botón «Cerrar sesión» conectado a `useAuth().signOut()`.
    - Módulo `auth`: se añadieron `register` (`POST /auth/registro`) y `loginAnonymous` (`POST /sessions/anonymous`) en `AuthService` y `authService.ts`.
  - **Bloque C (Notificaciones)**:
    - Backend (`Asisconnection`): se agregaron `GET /v1/notifications` (actividad reciente en publicaciones propias dentro de los últimos 30 días) y `PATCH /v1/notifications/read-all`.
    - Frontend (`notifications`): se implementaron `NotificationItem`, `groupNotificationsByPeriod` (`Hoy`, `Ayer`, `Últimos 7 días`, `Últimos 30 días`, descartando mayores a 30 días), `notificationsService`, `useNotifications` y `NotificationsScreen`.
- Archivos principales: `src/modules/assistant/**`, `src/modules/ecosystem/**`, `src/modules/profile/services/profileService.ts`, `src/modules/settings/**`, `src/modules/notifications/**`, `src/modules/auth/{domain/AuthService,services/authService}.ts`.
- Decisiones (y por qué): cada pantalla recibe su service mediante un hook de composición en la raíz del módulo (`useXService.ts`) que envuelve `useAuthorizedHttpClient()`, respetando las reglas de capas de ESLint (`ui → application → domain`, `ui` nunca importa `services/` directamente).
- Cómo se probó:
  - Frontend: `tsc --noEmit` (0 errores), `eslint src --max-warnings=0` (0 errores/warnings) y `jest` (27 suites pasadas, 109/109 tests en verde).
  - Backend: `npm run lint` (0 errores/warnings) y `npm test` (6/6 tests unitarios en verde).
- Queda pendiente: hacer `git push` del backend para que Render redespliegue los nuevos endpoints y probar en Expo Go (T-03b).

## 2026-11-07 · T-07 Comentarios y Reacciones del Foro (Fase 3b)

- Qué se hizo:
  - Backend (`Asisconnection`): se agregó `GET /v1/posts/:postId/comments` paginado (solo comentarios `APPROVED` con `likes_count`) y se enriqueció `AuthorBadgeDto` con `actor_id` y `avatar_url` desde la tabla `actors`.
  - Frontend (`Frontend-Asisconnection`): se creó `commentsService` (`GET /posts/:postId/comments` con fallback a `recent_comments`, `POST /posts/:postId/comments` omitiendo `parent_id` cuando es raíz, y `POST /comments/:id/reactions`), se conectó en `AppCommentsProvider`, se retiró `demoCommentsRepository` y se conectaron las reacciones (`POST /posts/:postId/reactions`) en `ForumPostCard` y `ForumScreen`.
- Archivos principales: `src/modules/comments/services/commentsService.ts`, `src/modules/comments/AppCommentsProvider.tsx`, `src/modules/comments/application/useComments.ts`, `src/modules/comments/ui/{CommentsScreen,components/CommentItem}.tsx`, `src/modules/forum/services/forumService.ts`, `src/modules/forum/ui/{ForumScreen,components/ForumPostCard}.tsx`.
- Decisiones (y por qué): `commentsService.listComments` hace fallback automático a `recent_comments` de `/posts` si `/posts/:postId/comments` responde 404 mientras se redespliega Render.
- Cómo se probó: `tsc --noEmit` (0 errores), `eslint` (0 errores) y `jest` en frontend (23 suites, 99/99 tests) y backend (5/5 tests unitarios).
- Queda pendiente: redesplegar backend en Render y continuar con Fase 4 (Perfil, Asistente y Ecosistema).

## 2026-11-07 · T-06 y T-08 Conexión del Foro y Creación de Publicaciones (Fases 2 y 3a)

- Qué se hizo:
  - Se creó `forumService` (`GET /categories` y `GET /posts` con filtro `categoryId`), se conectó en `AppForumProvider` usando `useAuthorizedHttpClient()` y se eliminó `demoForumRepository`.
  - Se creó `postsService` (`POST /posts` resolviendo el `category_id` desde `GET /categories`), `usePostsService`, `useCreatePost` y se conectó `NewPostScreen` mostrando el aviso de moderación (`PENDING` o `REJECTED`) e invalidando el feed del foro.
  - Se alinearon los nombres de las categorías en el frontend con las 4 categorías del backend (`Noticias`, `Salud`, `Apoyo Pedagógico`, `Voluntariado`) y se creó `toCategoryCode` en `shared/domain/models/CategoryCode.ts`.
- Archivos principales: `src/shared/domain/models/CategoryCode.ts`, `src/modules/forum/services/forumService.ts`, `src/modules/forum/AppForumProvider.tsx`, `src/modules/forum/ui/strings.ts`, `src/modules/posts/domain/PostsService.ts`, `src/modules/posts/domain/models/{Category,PostSubmission}.ts`, `src/modules/posts/services/postsService.ts`, `src/modules/posts/application/useCreatePost.ts`, `src/modules/posts/usePostsService.ts`, `src/modules/posts/ui/{NewPostScreen,strings}.ts`.
- Decisiones (y por qué): se reutiliza la caché en memoria de `GET /categories` dentro de cada service para traducir entre `CategoryCode` del frontend y el UUID `category_id` del backend sin repetir peticiones en cada cambio de filtro.
- Cómo se probó: `tsc --noEmit` (0 errores), `eslint src` (0 errores) y `jest` (22 suites pasadas, 95/95 tests en verde).
- Queda pendiente: probar flujo completo en Expo Go contra `https://asisconection.onrender.com/v1` y conectar reacciones/comentarios.

## 2026-11-07 · T-03c Login contra el backend AsisConexión (Fase 1)

- Qué se hizo: `authService` usa el contrato de AsisConexión (`POST /auth/login` con `accept_consent`, respuesta `device_token` + `user`; perfil desde `GET /actors/me`; errores RFC 7807). Se quitó `logout` HTTP (el token es local). Casilla obligatoria de consentimiento (Ley 1581) en el login. Roles alineados al backend (ADMIN, MODERATOR, ACUDIENTE, VOLUNTARIO, INVERSOR, BENEFICIARIO). `User` ya no tiene `email` (no viene en `/actors/me`).
- Archivos principales: `modules/auth/services/authService.ts`, `domain/AuthService.ts`, `domain/models/{User,LoginCredentials,Role}.ts`, `domain/validateLoginForm.ts`, `application/AuthProvider.tsx`, `ui/LoginScreen.tsx`, `ui/components/ConsentCheckbox.tsx`, `shared/domain/models/RoleCode.ts`.
- Decisiones: `EXPO_PUBLIC_API_URL` debe incluir `/v1`. Un 502 (servicio de identidad caído) se muestra como error de red.
- Cómo se probó: `tsc --noEmit` (0 errores), `eslint` (0 errores) y `jest` en `auth` y `profile` (49/49 tests en verde). Falta probar en Expo Go.
- Pendientes: validar diseño de la casilla de consentimiento.

## 2026-10-27 · T-10b y T-14 Integración del Perfil y Ecosistema

- Qué se hizo:
  - Se resolvieron los conflictos del merge preservando la pantalla completa de Perfil integrada desde `main`; `(tabs)/profile` y la pestaña del footer llegan a `ProfileScreen` a través del `index.ts` público del módulo.
  - Se implementó Ecosistema según `03-Ecosistema`: cinco tarjetas con íconos, descripciones, tokens del tema y layout adaptable. El indicador de enlace es visual; no hay destinos inventados ni navegación externa.
  - Se restauró el feed completo del Foro, que había quedado reemplazado por un placeholder durante el merge, y se combinaron las cadenas del feed con las del estado provisional.
  - `AppAuthProvider` construye cliente, service y almacenamiento al montar el provider, de modo que importar auth no exige configurar la URL; valida `EXPO_PUBLIC_API_URL` al crear la composición.
  - `RoleCode`, `CategoryCode` y el modelo `Post` pasaron a `shared/domain/models` por ser contratos compartidos; así los modelos de dominio no dependen de otro módulo. Se actualizó `AGENTS.md` para documentar esa capa compartida.
  - Se retiraron los `.gitkeep` que mantenían capas vacías en Ecosistema. La prueba del compositor consulta el `TextInput` por su etiqueta accesible.
- Archivos principales: `src/modules/ecosystem/ui/**`, `src/modules/profile/ui/ProfileScreen.tsx`, `src/app/(tabs)/profile.tsx`, `src/modules/auth/AppAuthProvider.tsx`, `src/modules/forum/ui/ForumScreen.tsx`, `src/modules/posts/ui/NewPostScreen.test.tsx`, `src/shared/domain/models/**`, `src/shared/theme/{colors,layout,typography}.ts`, `.prettierrc`, `AGENTS.md`, `docs/pantallas.md`, `docs/PENDIENTES.md`.
- Decisiones (y por qué): se deja la navegación externa de Ecosistema sin configurar hasta tener las URL. Perfil conserva su service y estados; la envoltura con header verde y Ajustes queda pendiente de T-10b/T-12.
- Cómo se probó: `npx tsc --noEmit` pasó; `npm test -- --runInBand` pasó (19 suites, 85 tests); ESLint y Prettier pasaron en los archivos de código modificados. `npx expo lint` sigue reportando errores de finales de línea mezclados en archivos preexistentes y no modificados del repo (4,524 errores) y una advertencia de import no usado en `NotificationsScreen.test.tsx`. No se probó en Expo Go en este turno; no se abrió navegador.
- Queda pendiente: header verde y Ajustes para Perfil (T-10b/T-12); la integración de endpoints de Perfil y publicaciones cuando backend los publique; configurar destinos externos si el equipo define sus URL.

## 2026-10-26 · T-10 Perfil propio (contenido y conexión)

- Qué se hizo: pantalla «Mi perfil» según `05-Perfil` y `05c-Perfil-guardados`, sin el header verde ni la barra inferior (los hace otro compañero en T-04/T-05; queda T-10b).
  - **posts/domain**: modelos `Post` (con `PostAuthor`) y `Category` (`CATEGORIES` con sus etiquetas), exportados por `@/modules/posts` para que el Foro los reutilice.
  - **profile/domain**: `MyProfile`, `ProfileError` (`network`, `unknown`) y la interfaz `ProfileService`.
  - **profile/services**: `createProfileService(client)` con los endpoints **propuestos** en `docs/api-profile.md` (no existen aún en el backend).
  - **profile/useProfileService.ts**: composición; usa `useAuthorizedHttpClient()` de auth.
  - **profile/application**: `useMyProfile(service)` (perfil y lista de la pestaña activa; cada pestaña carga al mostrarse).
  - **profile/ui**: `ProfileScreen` (FlatList; estados de carga, error con Reintentar y vacío) y componentes del módulo `Avatar`, `CategoryLabel`, `ProfileSummary`, `StatsCard`, `InfoCard`, `DataRow`, `ProfileTabs`, `ProfilePostCard` (con autor y miniatura en Guardados), `StatusMessage`.
  - **shared**: `useAsyncData` (carga con `loading/error/success` y `reload`, hasta que llegue TanStack Query), `formatLongDate`/`formatMonthYear`, `formatRelativeTime` («hace 2 días») y `getInitials`.
  - **Tema**: `textBody`, colores de la etiqueta de categoría (`label`/`onLabel`: el chip de Guías es `#1F6B65` y el de Avisos lleva texto oscuro, como en el diseño), tamaños de avatar, miniatura y pestaña, bordes de 1.5, 3 y 4 px, interlineados.
  - **Ruta** `(tabs)/profile`. Botón provisional «Mi perfil» en el Foro provisional para llegar a ella mientras no haya barra inferior.
- Archivos principales: `src/modules/profile/**`, `src/modules/posts/{index.ts,domain/models/*}`, `src/shared/hooks/useAsyncData.ts`, `src/shared/lib/{formatDate,formatRelativeTime,getInitials}.ts`, `src/shared/theme/*`, `src/app/(tabs)/profile.tsx`, `docs/api-profile.md`.
- Decisiones (y por qué):
  - Pedido del equipo: dejar vistas y conexión listas; el líder conecta el backend. Los modelos usan los mismos nombres de campo que el contrato propuesto, así no hacen falta mappers.
  - `Avatar`, `CategoryLabel` y la tarjeta viven en `profile/ui/components` porque por ahora solo los usa el Perfil (AGENTS §4); suben a `shared/ui` cuando el Foro los necesite (T-05/T-06).
  - «Editar», la cámara y el enlace «Ajustes» muestran «Disponible pronto» (Ajustes llega en T-12).
  - Diferencias con el mockup por accesibilidad: «Editar» mide 44 px de alto (el diseño, 36) y la cámara (32 px) tiene `hitSlop` hasta 44. El enlace «Ajustes» dentro del texto no llega a 44 px; el engranaje del header será el acceso principal.
  - `AppAuthProvider` ahora valida `EXPO_PUBLIC_API_URL` al montarse y no al importarse: antes, cualquier prueba que importara `@/modules/auth` (por ejemplo `RoleBadge`) fallaba.
- Cómo se probó: `npm test` (69 + 5 de la pantalla: datos y cifras, cambio a Guardados con autor, «Sin agregar» y lista vacía, error con Reintentar, avisos «Disponible pronto»; además service con `fetch` simulado, `useMyProfile`, `useAsyncData` y formateadores). Typecheck y lint sin errores. **No se probó en Expo Go**: el mock de Postman aún no tiene estos endpoints, así que hoy la pantalla mostraría el error con Reintentar.
- Queda pendiente: T-10b (header, barra inferior y backend) y los endpoints en «Pendiente del backend».

## 2026-10-26 · Capa services y cliente HTTP compartido

- Qué se hizo:
  - La capa `data/` de cada módulo pasa a llamarse **`services/`** (pedido del equipo: nombre más familiar). En auth: `httpAuthRepository` → `services/authService.ts` (`createAuthService`) y la interfaz `AuthRepository` → `domain/AuthService.ts` (`AuthService`); `secureTokenStorage` se mueve a `services/`.
  - **`shared/lib/http`**: `createHttpClient(baseUrl)` y `HttpError` (`status` null si no hubo respuesta, más el cuerpo del error). Es el único lugar que llama a `fetch` y maneja URL base, timeout de 30 s, JSON y `Authorization: Bearer`. Los services lo reciben y solo conocen sus endpoints y sus errores de dominio.
  - **`useAuthorizedHttpClient()`** (exportado por `@/modules/auth`): cliente para los services de los demás módulos; pone el token de la sesión y cierra la sesión ante un 401. El token no sale de `auth`.
  - **ESLint** (`eslint.config.js`) hace cumplir la arquitectura con reglas nativas (`no-restricted-imports`, `no-restricted-globals`): módulos solo por su `index.ts`, `ui` sin services, `domain` sin React/Expo ni otras capas, `shared` sin módulos, rutas sin `StyleSheet`, átomos sin moléculas y moléculas sin organismos, y `fetch` solo en `shared/lib/http`.
- Archivos principales: `src/shared/lib/http/*`, `src/modules/auth/{services,domain/AuthService.ts,application/AuthProvider.tsx,AppAuthProvider.tsx,testUtils.tsx}`, `eslint.config.js`.
- Decisiones (y por qué): sin dependencias nuevas (no axios). **Cambia AGENTS.md (secciones 1, 3 y 5)**: `services/` en lugar de `data/`, ejemplo de cómo se arma un service y regla 7 (ESLint vigila las capas). Se ajustaron `STACK.md`, `api-auth.md`, `tarea-login.md` y `PENDIENTES.md` (T-06 ya no necesita resolver el 401).
- Cómo se probó: `npm test` (pruebas nuevas del cliente HTTP y del cliente autenticado: token, 401 cierra sesión, otros errores no); las del service de auth pasan por el cliente real con `fetch` simulado. Typecheck y lint sin errores. Se verificó con archivos temporales que cada regla de ESLint salta. No se probó en Expo Go.
- Queda pendiente: nada nuevo.

## 2026-10-27 · Integración de auth services y Foro

- Qué se hizo: `AppAuthProvider` ahora compone `createHttpClient(API_URL)` y `createAuthService(client)` y los inyecta al `AuthProvider`, validando `EXPO_PUBLIC_API_URL` al montar. El Foro dejó de leer el token de sesión directamente; su contrato recibe solo el filtro y queda preparado para que el futuro service use `useAuthorizedHttpClient()` (incluye cierre de sesión en 401). Se eliminaron referencias viejas a `httpAuthRepository`/`AuthRepository` del código fuente.
- Archivos principales: `src/modules/auth/AppAuthProvider.tsx`, `src/modules/auth/application/AuthProvider.tsx`, `src/modules/forum/domain/ForumRepository.ts`, `src/modules/forum/application/useForumFeed.ts` y pruebas del Foro.
- Decisiones (y por qué): no se conectó un endpoint de publicaciones porque el backend aún no ha compartido su contrato. La URL local de Postman se comprobó sin imprimir su valor. El feed conserva el estado de servicio no configurado y no presenta datos inventados.
- Cómo se probó: `npx tsc --noEmit`, lint dirigido y pruebas Jest completas (45 tests). Expo Web compiló y se abrió en navegador; la ruta protegida mostró el login. No se usaron credenciales para entrar al Foro.
- Queda pendiente: conectar el `forumService` autenticado cuando exista el endpoint/DTO del backend; probar Foro en navegador y Expo Go con una sesión de prueba autorizada.

## 2026-10-26 · T-06 Base visual del Foro

- Qué se hizo: se reemplazó el foro provisional por el header responsive, filtros por tema, feed `FlatList` con ajuste de desplazamiento, tarjetas preparadas para publicaciones de texto/imagen/video y estados de carga, error, vacío y servicio no conectado. El header se oculta al bajar y vuelve al subir.
- Archivos principales: `src/modules/forum/**`, `src/shared/lib/queryClient.ts`, `src/app/_layout.tsx`, `src/modules/auth/application/AuthProvider.tsx`, `src/modules/auth/AppAuthProvider.tsx`, `package.json`.
- Decisiones (y por qué): no se añadieron datos ficticios ni endpoints supuestos. `ForumRepository` define el contrato de aplicación; `AppForumProvider` es el punto para inyectar el service del backend. TanStack Query se agrega según `STACK.md`; `sessionToken` queda disponible en `useAuth()` y un `ForumError('sessionExpired')` cierra la sesión. Se pospuso la conexión HTTP porque el backend aún no tiene contrato de publicaciones. El proveedor de autenticación valida la URL al montarse, no al importar el módulo, para permitir consumir `useAuth()` desde el API público sin efectos de importación.
- Cómo se probó: `npm test -- --runInBand forum` (4 pruebas), `npx tsc --noEmit` y ESLint dirigido a los archivos modificados. `npx expo lint` global sigue encontrando errores de fin de línea Prettier en archivos preexistentes; no se reformateó el resto del repo. No se pudo validar en Expo Go.
- Queda pendiente: conectar el feed y sus acciones cuando exista el service/contrato del backend; implementar la barra inferior de pestañas (T-04) y las pantallas de comentarios, publicación y notificaciones.

## 2026-10-26 · Repo solo frontend

- Qué se hizo: se retiró del front todo lo que es responsabilidad del backend. Se borraron `auth/data/authMappers.ts` (y su prueba), que adivinaba formas de respuesta, normalizaba roles y traducía nombres de campos, y `isRoleCode` de `Role.ts`. `httpAuthRepository.ts` ahora solo hace la petición, tipa la respuesta según `api-auth.md` (`LoginResponse`, `ProfileResponse`, `ValidationErrorResponse`) y traduce códigos HTTP a `AuthError`. Se borró la carpeta `postman/` del repo.
- Decisiones (y por qué): pedido del equipo. Este repo es **solo frontend**: las vistas y su lógica de UI. Validar y dar forma a los datos (DTOs) lo hace el backend. Tampoco se simula nada en el código; de momento `EXPO_PUBLIC_API_URL` (en el `.env` de cada quien) apunta al mock server de Postman del equipo. **Cambia AGENTS.md (sección 5)**, `api-auth.md`, `tarea-login.md`, `pantallas.md` y `diseno/README.md`.
- Cómo se probó: `npm test`, typecheck y lint sin errores.

## 2026-10-26 · Solo el mock server de Postman

- Qué se hizo: el equipo trabaja de forma momentánea con el mock server de Postman creado desde la colección (URL en el `.env` de cada quien). Se borró el Code Mock local (`postman/mocks/`) y el script `npm run mock`. En el repo solo queda `postman/collections/asisconnection-auth.postman_collection.json`, que es la fuente del mock server. Se limpiaron las menciones en `.env.example`, `env.ts`, `AuthRepository.ts`, `AppAuthProvider.tsx` y AGENTS.md.
- Decisiones (y por qué): pedido del equipo. Las pruebas de Jest mantienen sus dobles (`testUtils.tsx`, `jest.spyOn(fetch)`): verifican el código, no simulan el backend para la app.
- Ojo: el mock server responde los ejemplos guardados y **no valida claves** (cualquier clave entra como María, Acudiente).
- Cómo se probó: `npm test`, typecheck y lint sin errores.

## 2026-10-26 · Mock de Postman en lugar de mocks en el código

- Qué se hizo: los datos simulados salen del código y pasan a Postman. Se borraron `auth/data/mockAuthRepository.ts` y `auth/data/mocks.ts`; la app siempre usa el repositorio HTTP y exige `EXPO_PUBLIC_API_URL` (si falta, error claro al arrancar).
  - `postman/collections/asisconnection-auth.postman_collection.json`: colección con login de 5 cuentas de prueba (una por rol), perfil, logout, registro y creación de usuarios por admin, con ejemplos y scripts que guardan el token.
  - `postman/mocks/asisconnection-auth/`: **Code Mock** (`postman mock generate` y reescrito a mano) que valida como el backend: credenciales (401), campos faltantes o extra (400), token por usuario en perfil, registro solo ACUDIENTE/DONANTE con clave de 12+ (409 si existe), creación de usuarios solo con token de ADMIN (403). Con CORS para web. Se levanta con `npm run mock` (puerto 4500).
  - Mock **clásico** en Postman cloud creado desde la colección (URL en el `.env` local de cada quien): responde los ejemplos guardados y **no valida claves**.
- Decisiones (y por qué): pedido del equipo, para no llenar `data/` de archivos de mocks y probar siempre la misma capa HTTP que usará el backend real. **Cambia AGENTS.md (sección 5), `pantallas.md`, `diseno/README.md` y `tarea-login.md`**: los datos de ejemplo de los demás módulos también van al mock de Postman. Las pruebas no dependen del mock (usan `testUtils.tsx`). Script nuevo `npm run mock`.
- Cómo se probó: 19 verificaciones contra el Code Mock local (login por rol, clave mala, campos extra, perfil por token, registro, 409, 403 de admin, logout, 404); llamadas al mock clásico (login, perfil, logout responden 200); `npm test` (42), typecheck y lint sin errores.
- Queda pendiente: publicar el Code Mock en Postman cloud (en `PENDIENTES.md`). No ejecutar `postman mock generate --update` sobre el Code Mock: sobrescribe la lógica.

## 2026-10-26 · T-03 Login

- Qué se hizo: login completo según `tarea-login.md` y el mockup `01-Login`.
  - **domain**: modelos `Session`, `LoginCredentials` y `AuthError` (`invalidCredentials`, `sessionExpired`, `forbidden`, `network`, `validation` con detalle por campo, `unknown`); interfaces `AuthRepository` y `TokenStorage`; `validateLoginForm` (correo válido y contraseña no vacía, sin exigir 12 caracteres).
  - **data**: `createHttpAuthRepository` (`fetch`, timeout de 30 s, `Authorization: Bearer`, manda solo `email` y `clave`); `createMockAuthRepository` con la cuenta ficticia del mockup; mappers defensivos (`authMappers.ts`); `createSecureTokenStorage` con `expo-secure-store`.
  - **application**: `AuthProvider` / `useAuth` (estados `loading | signedOut | signedIn`, restaura la sesión al abrir; un 401 borra el token, sin conexión lo conserva) y `useLogin` (validación, carga, errores, sin doble envío).
  - **ui**: `LoginScreen` igual al mockup; «Crear cuenta», «¿Olvidaste tu contraseña?» e «Ingresar como invitado» muestran el aviso único `showComingSoonNotice`.
  - **shared/ui**: átomos `Icon`, `Button` (primary / outline, con carga), `TextButton`, `IconButton`, `Input`, y la molécula `TextField`.
  - **Rutas**: `(auth)/login` y `(tabs)/index` con `Stack.Protected`. El splash se mantiene hasta cargar fuentes y sesión (el login no parpadea). `(tabs)` muestra un Foro provisional con saludo, `RoleBadge` y «Cerrar sesión» para probar el flujo completo.
- Archivos principales: `src/modules/auth/**`, `src/modules/forum/ui/ForumScreen.tsx`, `src/shared/ui/{atoms,molecules}/*`, `src/shared/lib/showComingSoonNotice.ts`, `src/shared/config/env.ts`, `src/shared/hooks/useHideSplashScreen.ts`, `src/app/_layout.tsx`, `src/app/(auth)/*`, `src/app/(tabs)/*`, `assets/images/logo-asisco-up.png`.
- Decisiones (y por qué):
  - Dependencias nuevas, ambas en `STACK.md`: `expo-secure-store` (token de sesión; agrega su config plugin a `app.json`) y `@expo/vector-icons` (Feather), declarada aunque venga con Expo.
  - `AppAuthProvider.tsx`, en la raíz del módulo, es el único punto que conecta `data` con `application`: usa el backend si existe `EXPO_PUBLIC_API_URL` y el mock si no. `AuthProvider` recibe el repositorio por props, así se prueba con dobles.
  - Repositorios como funciones fábrica (`createHttpAuthRepository`), no clases.
  - El aviso «disponible pronto» es un `Alert` nativo (una función, no un componente): simple y accesible.
  - `app.json` → `userInterfaceStyle: "light"`: el diseño solo tiene modo claro.
  - Medidas propias del mockup del login (logo y círculos de fondo) quedan como constantes con nombre en `LoginScreen.tsx`; lo reutilizable va al tema (`OPACITY`, `BORDER_WIDTH`, `LINE_HEIGHT`, `LETTER_SPACING`, tamaños de íconos y botón secundario).
  - Jest: `moduleNameMapper` explícito para `@/` y `@/assets/` (el mapeo de `jest-expo` falla en Windows) y `testTimeout` de 15 s (el primer render en frío pasa de 5 s).
  - El error de un campo se muestra con `COLORS.danger` (más contraste que `alert`); el borde del campo usa `alert`.
- Cómo se probó: `npm test` (42 pruebas: dominio, mappers, repositorio HTTP con `fetch` simulado, `AuthProvider`, `useLogin` y `LoginScreen`: mostrar/ocultar contraseña, errores por campo, botón deshabilitado mientras carga, credenciales incorrectas y aviso «disponible pronto»); `npm run typecheck` y `npm run lint` sin errores. **No se probó en Expo Go** (queda como T-03b).
- Queda pendiente: T-03b (probar en Expo Go y confirmar la respuesta real del backend); el 401 en peticiones autenticadas de otros módulos (anotado en T-06); mover «Cerrar sesión» a Ajustes (T-12).

## 2026-10-26 · Nombres en inglés y modelos de dominio

- Qué se hizo: los módulos pasan a inglés (`forum`, `comments`, `notifications`, `posts`, `profile`, `settings`, `assistant`, `ecosystem`; `auth` se queda). Las claves de categoría también (`announcements`, `questions`, `guides`, `achievements`). Los roles pasan a ser un modelo: `auth/domain/models/Role.ts` (`RoleCode` + `Role` con `code`, `label` y `priority`, y el registro `ROLES`) y se agrega `auth/domain/models/User.ts` (`username`, `email`, `roles`), que pide `tarea-login.md`. Se borró `roles.ts`.
- Archivos principales: `src/modules/*`, `src/modules/auth/domain/models/{Role,Role.test,User}.ts`, `src/modules/auth/ui/RoleBadge.tsx`, `src/modules/auth/index.ts`, `src/shared/theme/colors.ts`.
- Decisiones (y por qué): pedido del equipo. Carpetas, archivos, rutas, código y commits van en inglés, y los textos visibles en español. Cada entidad es un modelo en `domain/models/` con todos sus atributos, para cambiar su estructura en un solo lugar. **Cambia AGENTS.md** (secciones 3, 4 y 5), `pantallas.md` (rutas y módulos en inglés: `posts/new`, `comments/[postId]`, `(tabs)/profile`…) y `api-auth.md`. Hay que avisar al equipo.
- Cómo se probó: `npm test` (5 pruebas), `npm run typecheck` y `npm run lint` sin errores.
- Queda pendiente: nada nuevo.

## 2026-10-26 · T-02b Roles en la app

- Qué se hizo: tipo `Role`, etiquetas en español y orden de prioridad en `modules/auth/domain/roles.ts` (con `getPrimaryRole`). Átomo genérico `Badge` en `shared/ui/atoms` (píldora con tonos `neutral`, `accent`, `primary` y tamaños `small` 10.5 px para foro y comentarios, `medium` 12 px para perfil). `RoleBadge` en `modules/auth/ui` elige el rol principal y su tono. Todo se exporta por `modules/auth/index.ts`.
- Archivos principales: `src/modules/auth/domain/roles.ts`, `roles.test.ts`, `src/modules/auth/ui/RoleBadge.tsx`, `src/shared/ui/atoms/Badge.tsx`, `src/modules/auth/index.ts`; tokens nuevos `COLORS.onSurfaceMuted` (`#40514F`), `SPACING.s1` y `SPACING.s11`; `tsconfig.json` con `"types": ["jest"]`.
- Decisiones (y por qué):
  - `Badge` vive en `shared` y no conoce los roles, porque `shared/` no puede importar de módulos. La traducción rol → tono vive en `RoleBadge` (auth).
  - Tonos (propuesta, el equipo puede cambiarla): Acudiente y Donante → neutro (el «Familia» del mockup); Tallerista y Estudiante → naranja (el «Profesional»); Administrador → verde (el sello «Fundación»).
  - TypeScript 6 ya no incluye los `@types` automáticamente; por eso `tsconfig.json` declara `jest`.
- Cómo se probó: `npm test` (4 pruebas de `getPrimaryRole` y etiquetas), `npm run typecheck` y `npm run lint` sin errores. `RoleBadge` todavía no se muestra en ninguna pantalla.
- Queda pendiente: validar los roles que llegan del backend (mapper en `auth/data`) cuando se haga el login (T-03).

## 2026-10-26 · T-02 Tema y fuentes

- Qué se hizo: tokens del diseño en `src/shared/theme` (colores, colores por categoría, tamaños de letra, espaciados, radios y medidas fijas) y carga de Nunito y Source Sans 3 con el splash visible hasta que terminan. La pantalla provisional del login ya usa el tema.
- Archivos principales: `src/shared/theme/{colors,typography,layout,index}.ts`, `src/shared/hooks/useAppFonts.ts`, `src/app/_layout.tsx`, `src/modules/auth/ui/LoginScreen.tsx`.
- Decisiones (y por qué):
  - Colores sacados de `docs/diseno/README.md` (más `primaryPressed` `#164B47` y `divider` `#E0D9CC`, que aparecen en el HTML). `primary` es `#1F6B65` (header y botones) y `secondary` `#2D938B`, como en el diseño; AGENTS.md los listaba al revés, y gana el diseño.
  - Fuentes con `useFonts` de `@expo-google-fonts` (funciona en Expo Go, sin build nativo). Cada peso es una familia aparte (`FONT_FAMILY.heading`, `body`…), sin `fontWeight`.
  - Se carga también **Source Sans 3 700**: AGENTS.md dice 400/600, pero los mockups usan 700 en 86 lugares.
  - `FONT_SIZE` y `SPACING` usan claves con el valor en px (`s12_5`, `s14`) porque los mockups usan casi todos los valores entre 2 y 16 px y se copian 1:1 del HTML. Colores y radios llevan nombres semánticos. Si falta un valor, se agrega al tema.
  - Si las fuentes fallan, la app abre igual con la fuente del sistema.
- Cómo se probó: `npm run lint` y `npm run typecheck` sin errores. Falta verlo en Expo Go.
- Queda pendiente: nada nuevo.

## 2026-10-26 · T-01 Base del proyecto

- Qué se hizo: se retiró la plantilla de `create-expo-app` (`explore.tsx`, `components/`, `constants/`, `hooks/`, `global.css` e imágenes de ejemplo; se conservan los íconos que usa `app.json`). Se creó la estructura modular de la sección 3 (9 módulos con `ui/application/domain/data` e `index.ts`, y `shared/ui/{atoms,molecules,organisms,templates}`, `theme`, `hooks`, `lib`, `config`). Se configuraron ESLint + Prettier, Jest (`jest-expo`, `@testing-library/react-native`), los scripts `lint`, `typecheck`, `test` y `format`, y `.env.example`. El alias `@/` → `src/` ya venía en `tsconfig.json`.
- Archivos principales: `src/app/_layout.tsx` (Stack sin header), `src/app/index.tsx` (ruta delgada), `src/modules/auth/ui/LoginScreen.tsx` (provisional hasta T-03), `src/shared/config/strings.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.env.example`, `package.json`, `.gitignore` (ahora ignora `.env`).
- Decisiones (y por qué): código, comentarios y commits en **inglés** (pedido del equipo; los textos visibles siguen en español). Se trabaja con una rama por funcionalidad: T-01 a T-03 van en `feat/auth-login`. Las carpetas vacías llevan `.gitkeep` para que git las conserve. `test` usa `--passWithNoTests` mientras no haya pruebas. `docs/diseno/` queda fuera de Prettier (es copia estática de los mockups). El tema y las fuentes quedan para T-02 y los grupos `(auth)`/`(tabs)` para T-03/T-04.
- Cómo se probó: `npm run lint`, `npm run typecheck` y `npm test` sin errores. No se probó en Expo Go ni se corrió `expo-doctor`.
- Queda pendiente: abrir la app en Expo Go (`npx expo start`) y correr `npx expo-doctor`. Reemplazar los íconos y el splash de la plantilla en `app.json` por los de ASISCO UP.

## 2026-10-26 · Arranque del proyecto

- Qué se hizo: se creó el proyecto con `npx create-expo-app@latest proyecto-integrador-mobile` (Expo SDK 57, Expo Router, TypeScript). Se definieron `AGENTS.md`, `STACK.md`, `PENDIENTES.md` y `pantallas.md`.
- Decisiones: arquitectura modular por capas + Atomic Design en `shared/ui`; stack mínimo (ver `STACK.md`); login con correo y contraseña según el contrato del backend de SAGA UP (`api-auth.md`).
- Queda pendiente: todo lo de `PENDIENTES.md`, empezando por T-01.
