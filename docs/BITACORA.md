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
