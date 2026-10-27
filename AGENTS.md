# AGENTS.md — ASISCONNECTION (app móvil)

App móvil de comunidad para la Fundación ASISCO UP (personas con síndrome de Down, sus familias y profesionales). Proyecto Integrador I, Universidad de Caldas. Equipo: ASISCONNECTION.

Este archivo manda sobre cualquier hábito por defecto. Si algo aquí choca con lo que pide una tarea, avisa antes de saltarte la regla.

## 1. Stack y comandos (no cambiar sin preguntar)

- Expo (SDK 57) + React Native + **TypeScript estricto**, creado con `create-expo-app`.
- Navegación: **Expo Router**. Las rutas viven en `src/app/`: cada archivo es una pantalla y los `_layout.tsx` definen los navegadores. Importa `Link`, `router` y `useLocalSearchParams` desde `expo-router`. Fuera de `src/app/` va todo lo que no sea ruta.
- Gestor de paquetes: **npm** (hay `package-lock.json`; no uses bun, yarn ni pnpm).
- Backend: repositorio aparte (`proyecto-integrador-backend`, equipo SAGA UP), desplegado en Render. La app solo habla con él desde la capa `services` (ver `docs/api-auth.md`).

### Expo cambia mucho: no confíes en tu memoria

Cada SDK de Expo trae cambios que rompen cosas; las APIs que recuerdas pueden estar renombradas, movidas o eliminadas. Antes de escribir código que toque Expo, EAS o React Native:

1. Lee la versión mayor de `expo` en `package.json`.
2. Consulta la documentación de esa versión: `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Para lo demás, usa el índice `https://docs.expo.dev/llms.txt` (trae correcciones a errores comunes de los LLM) y sigue sus enlaces. Nunca respondas de memoria sobre una API de Expo.

### Comandos

```bash
npx expo install <paquete>   # SIEMPRE esto para añadir librerías (versiones compatibles con el SDK); nunca npm install <paquete>
npx expo start               # servidor de desarrollo (--tunnel si la red falla)
npx expo lint                # lint
npx tsc --noEmit             # chequeo de tipos
npx expo-doctor              # diagnostica dependencias y configuración
npx expo install --fix       # arregla versiones incompatibles
npm test                     # pruebas (Jest), cuando existan
```

En la primera tarea agrega scripts `lint`, `typecheck` y `test` en `package.json` que envuelvan estos comandos.

### Reglas de Expo

- Si no existen `ios/` ni `android/`, se generan solos (Continuous Native Generation). **Nunca los crees ni edites a mano**: la configuración nativa va en `app.json` y en config plugins.
- Expo Go solo trae sus módulos nativos incluidos. Si una librería nueva tiene código nativo, la app necesita un development build (`npx expo run:ios|android` o `eas build --profile development`). Antes de añadir una librería con código nativo, avisa al equipo.
- Prefiere los módulos recomendados de Expo sobre librerías de terceros y revisa los skills disponibles antes de añadir dependencias. Docs: `https://docs.expo.dev/versions/latest/index.md`.
- Builds y actualizaciones: EAS (`npx eas-cli@latest build|submit|update`). No lo ejecutes sin que el equipo lo pida; requiere cuenta y credenciales.
- Prioriza patrones mobile-first, rendimiento y compatibilidad Android/iOS.
- No agregues dependencias sin justificarlas en el PR. Antes, revisa si ya existe algo en el proyecto o en Expo que lo resuelva.

## 2. Fuente de verdad del diseño

- **Diseño de referencia: `docs/diseno/`** (capturas en `pantallas/`, HTML con las medidas exactas en `html/`, logos e imágenes en `assets/`, tokens en su `README.md`). Antes de construir una pantalla mira su captura y su HTML y respeta las medidas.
- Stack tecnológico: `docs/STACK.md` (no agregues dependencias fuera de esa lista sin aprobación).
- Prototipo interactivo (canvas) y Figma: **si el código y el diseño difieren, gana el diseño** salvo que el equipo diga lo contrario.
- `docs/pantallas.md`: mapa de pantallas, rutas, estados y navegación. Léelo antes de construir una pantalla.
- Los datos de los mockups son **ficticios**. Úsalos solo como datos de ejemplo (mocks), nunca como datos reales.
- **Oportunidades** está fuera del alcance por ahora: no la construyas ni la enlaces.

## 3. Arquitectura: modular por capas

Cada funcionalidad es un **módulo** con cuatro capas. Lo compartido vive en `shared/`.

```
src/
  app/                      Rutas de Expo Router. Delgadas: solo importan la pantalla del módulo.
  modules/
    auth/  forum/  comments/  notifications/  posts/
    profile/  settings/  assistant/  ecosystem/
      ui/                   Pantallas y componentes propios del módulo
      application/          Hooks y casos de uso (useForumFeed, useFollow…)
      domain/               Modelos (models/), interfaces y reglas puras (sin React, sin red)
      services/             Services HTTP del módulo (llamadas al backend)
      index.ts              API pública del módulo
  shared/
    ui/                     Atomic Design (ver sección 4)
    theme/                  Tokens: colores, tipografía, espaciado, radios
    lib/http/               Cliente HTTP único (fetch, timeout, token, HttpError)
    hooks/  lib/  config/   Utilidades transversales
```

**Reglas de dependencia (obligatorias):**

1. `ui → application → domain`. `services` implementa lo que `domain` define. `domain` no importa nada del resto.
2. `ui` nunca llama a la red ni lee mocks directamente: pide todo a `application`.
3. Un módulo solo usa a otro a través de su `index.ts`. Prohibido importar rutas internas (`modules/forum/ui/...` desde otro módulo).
4. `shared/` no importa de `modules/`.
5. Las rutas de `src/app/` no contienen lógica ni estilos: solo componen.
6. Alias de importación `@/` apunta a `src/`. Nada de rutas relativas largas (`../../..`).
7. ESLint hace cumplir estas reglas y las de Atomic Design (`eslint.config.js`): si `npx expo lint` marca un import, se corrige la arquitectura, no la regla.

**Cómo se arma un service** (ejemplo con el foro):

```ts
// domain/ForumService.ts — el contrato, sin saber de HTTP
export type ForumService = { listPosts(topic: Topic): Promise<Post[]> };

// services/forumService.ts — la implementación: endpoints, tipos de respuesta y errores
export function createForumService(client: HttpClient): ForumService {
  return {
    async listPosts(topic) {
      try {
        return await client.request<Post[]>(`/posts?tema=${topic}`);
      } catch (error) {
        throw toForumError(error); // HttpError -> error del dominio
      }
    },
  };
}
```

- Ningún service llama a `fetch`: recibe un `HttpClient` de `@/shared/lib/http`.
- Las rutas protegidas usan el cliente de `useAuthorizedHttpClient()` (de `@/modules/auth`): pone el token y cierra la sesión ante un 401. El token nunca sale del módulo `auth`.
- Nombres: interfaz `XService` en `domain/`, fábrica `createXService` en `services/xService.ts`, doble de prueba `createFakeXService` en `testUtils.tsx`.

## 4. Atomic Design (solo en `shared/ui` y en componentes de módulo)

- **atoms/**: elementos mínimos sin lógica de negocio. `Text`, `Button`, `Avatar`, `Chip`, `Badge`, `Switch`, `Icon`, `Input`.
- **molecules/**: combinación pequeña de átomos. `CategoryChip`, `AvatarNameRole`, `DataRow`, `TextField`.
- **organisms/**: bloques completos y reutilizables. `PostCard`, `CommentItem`, `NotificationRow`, `BottomNavBar`, `HeaderTeal`.
- **templates/**: esqueletos de pantalla sin datos. `ScreenWithCollapsingHeader`, `ModalSheet`.
- **pages** = las pantallas de cada módulo (`modules/*/ui/*Screen.tsx`). Reciben datos de `application` y los pasan a la plantilla.

Un componente sube a `shared/ui` cuando lo usan **dos o más módulos**. Antes de eso vive en `modules/<x>/ui/components/`. Un átomo no importa moléculas; una molécula no importa organismos.

## 5. Convenciones de código

**Nombres**
- Código, comentarios, nombres de carpetas y archivos, rutas y commits en **inglés**; textos visibles al usuario en **español**. Los textos van en `shared/config/strings.ts` o en el módulo, nunca repartidos como literales dentro de JSX largos.
- Componentes y pantallas: `PascalCase.tsx` (`PostCard.tsx`, `ForumScreen.tsx`). Un componente por archivo, con su `export` nombrado; `export default` solo en las rutas de `src/app/`.
- Hooks: `useCamelCase.ts`. Tipos e interfaces: `PascalCase`, sin prefijo `I`. Constantes: `UPPER_SNAKE_CASE`.
- Archivos de rutas de Expo Router: minúsculas y guiones (`new.tsx`, `[postId].tsx`).
- Booleanos con prefijo `is/has/can`. Handlers: `handleX` en el componente, `onX` en las props.

**TypeScript**
- `strict: true`. Prohibido `any` (usa `unknown` y estrecha). Evita `as` salvo en el borde de la capa `services`.
- Las props se tipan con `type XProps = {...}`. Cada entidad del dominio es un **modelo** en `domain/models/<Name>.ts` (`Role.ts`, `User.ts`) que reúne todos sus atributos; si cambia su estructura, se cambia solo ahí y se reutiliza en todo el código.
- **Este repo es solo frontend.** Validar, transformar y dar forma a los datos (DTOs) es responsabilidad del backend. La capa `services/` solo hace la petición HTTP (con el `HttpClient` compartido), tipa la respuesta según el contrato (`docs/api-auth.md`) y traduce los códigos de error a errores del dominio. No se escriben mappers que adivinen o corrijan respuestas.

**React Native**
- Componentes funcionales y hooks. Sin clases.
- Estilos con `StyleSheet.create` al final del archivo, usando los tokens de `shared/theme`. **Prohibido** hardcodear colores, tamaños de letra o espaciados: si falta un token, agrégalo al tema.
- Layout solo con **flexbox** (`View`, `gap`). Sin CSS grid ni conceptos web.
- Listas largas con `FlatList`; el foro usa `snapToInterval` (una publicación por pantalla, con la anterior y la siguiente asomando). No uses `ScrollView` + `.map()` para listas que crecen.
- Imágenes con `expo-image`; video con `expo-video`; fotos con `expo-image-picker`. Íconos con `@expo/vector-icons` (familia Feather, de trazo, parecida a los mockups). Todo viene con Expo: no instales librerías de íconos aparte.
- Fuentes: **Nunito** (títulos, 700/800) y **Source Sans 3** (cuerpo, 400/600), cargadas con `expo-font`/`@expo-google-fonts`.
- Áreas seguras con `react-native-safe-area-context`, nunca con alturas fijas. (En los mockups: ~50 px arriba y ~30 px abajo.)
- Evita renders innecesarios: `React.memo` en filas de listas, `useCallback` solo cuando la función pasa a un hijo memorizado. No optimices por reflejo.
- Animaciones con la API `Animated` de React Native; usa `react-native-reanimated` solo si algo no se puede lograr con eso. El header que se oculta al hacer scroll hacia abajo y vuelve al subir es un patrón compartido: impleméntalo **una vez** en un template o hook y reúsalo (Foro, Perfil, Notificaciones, Perfil de otra persona, Ajustes). La hoja de Comentarios es una pantalla modal de Expo Router (`presentation: 'transparentModal'`), sin librería de bottom sheet.

**Estado y datos**
- Estado local con `useState`/`useReducer`. Estado global **solo** para la sesión, con React Context (`AuthProvider`). No agregues Redux, Zustand ni similares sin aprobación.
- Los datos del servidor se piden desde hooks de `application/`, que usan los services del módulo (estados `loading`, `error`, `data`). TanStack Query entra en T-06 (Foro) para las listas; hasta entonces, solo `fetch`. No agregues axios ni otras librerías de datos sin aprobación. Mientras no haya backend, no se simula nada en el código: `EXPO_PUBLIC_API_URL` apunta de momento al mock server de Postman del equipo, y cambiar al backend real es solo cambiar esa URL. Las pruebas usan dobles propios (`testUtils.tsx`).
- Nada de `fetch` fuera de `shared/lib/http` (lo vigila ESLint). URL base desde `process.env.EXPO_PUBLIC_API_URL` (ver `.env.example`).

**Accesibilidad (requisito, no extra)**
- Área táctil mínima 44×44. `accessibilityRole` y `accessibilityLabel` en todo elemento interactivo; los íconos sin texto siempre llevan etiqueta.
- Contraste suficiente (los colores del tema ya cumplen; no los cambies). No transmitas información solo con color: las categorías llevan texto además de color.
- Interfaz pensada para personas con distintas capacidades: textos claros y cortos, sin flujos largos ni gestos ocultos.

## 6. Tema (tokens base)

Fuente: `src/shared/theme`. Valores de los mockups:

| Token | Valor |
|---|---|
| primary (verde azulado) | `#2D938B` / oscuro `#1F6B65` |
| accent (naranja) | `#F19700` |
| background | `#F7F4EE` |
| surface | `#FFFFFF`, borde `#E4DED2` |
| texto | `#1C2B2A` (principal), `#5A6B69` (secundario) |
| Avisos | naranja `#F19700` |
| Preguntas | azul `#2F6AB0` |
| Guías | verde `#2D938B` |
| Logros | morado `#7B4FB0` |
| peligro (cerrar sesión) | `#8A2F2F` |

Radios habituales: 13 (botones del header), 18–22 (tarjetas), 999 (chips, avatares). Header verde con esquinas inferiores de 22.

## 7. Privacidad y datos (Colombia, Ley 1581 de 2012)

- Esta app maneja datos de personas con discapacidad y de menores: son **datos sensibles**. No registres ni imprimas datos personales en logs.
- En Perfil, los datos personales (correo, fecha de nacimiento, ciudad) están **apagados por defecto**; solo los ve la comunidad si la persona los activa en Ajustes. Los guardados nunca se muestran a nadie. Respeta esto en el modelo y en la UI.
- El token de sesión se guarda **solo** en `expo-secure-store` (nunca en AsyncStorage ni en el estado persistido en claro). Nunca imprimas correos, claves ni tokens en logs.
- No hay datos reales en el repo ni en los mocks. Sin tokens, llaves ni contraseñas en el código: usa variables de entorno y no subas `.env`.

## 8. Calidad

- Antes de dar una tarea por terminada: `npx tsc --noEmit`, `npx expo lint` y probar la pantalla en Expo Go (o decir que no pudiste).
- Pruebas con Jest + `jest-expo` y `@testing-library/react-native`. Obligatorias para `domain/` y `application/`; para `ui` basta con las pantallas con lógica (seguir, interruptores de privacidad, notificaciones agrupadas por fecha).
- Prettier y ESLint (config de Expo) son la autoridad de formato. No discutas estilo en las revisiones.
- Sin código muerto, `console.log` ni `TODO` sin dueño ni explicación.

## 9. Cómo trabajar (reglas para el agente)

1. **Tareas y registro.** Toma la tarea de `docs/PENDIENTES.md` (si no está, agrégala antes) y márcala «en curso». Lee `docs/pantallas.md` y el módulo afectado antes de escribir. Al terminar: quita la tarea de `PENDIENTES.md` y agrega una entrada arriba en `docs/BITACORA.md` (qué hiciste, archivos, cómo probaste, pendientes que quedaron). Las decisiones que cambien algo de este archivo se anotan en la bitácora y se avisa al equipo.
2. Cambios pequeños y revisables: una pantalla o un componente por tarea. No reorganices carpetas ni renombres archivos que no te pidieron.
3. Reutiliza antes de crear: busca primero en `shared/ui` y en el módulo.
4. Si la tarea es ambigua o contradice este archivo o el diseño, **pregunta**; no inventes.
5. No toques el backend ni su contrato desde este repositorio. Si falta un endpoint, anótalo en la sección «Pendiente del backend» de `docs/PENDIENTES.md`.
6. Commits con **Conventional Commits** en español o inglés, coherentes en todo el repo (`feat(foro): …`, `fix(perfil): …`). Ramas: `feat/<modulo>-<tema>`, `fix/<modulo>-<tema>`. Nunca hagas push a `main`.
7. Al terminar, resume: qué cambiaste, qué probaste y qué falta. Sin relleno.

## 10. Estado actual del repo y primer arranque

El repo salió de `create-expo-app` y hoy tiene: `src/app/` (`_layout.tsx`, `index.tsx`, `explore.tsx`), `src/components/`, `src/constants/`, `src/hooks/`, `src/global.css`, `scripts/`, `assets/`, `app.json`, `tsconfig.json`. Todo eso es **plantilla de ejemplo**.

En la **primera tarea de infraestructura** (antes del login):
1. Confirmar que corre con `npx expo start`.
2. Crear la estructura de la sección 3 y retirar el código de ejemplo (`explore.tsx`, y lo que sobre en `components/`, `constants/`, `hooks/`). Borrar `src/global.css` (solo tiene variables CSS para web) y su import si existe. Si `scripts/` trae `reset-project`, déjalo.
3. Configurar alias `@/` → `src/`, scripts de `package.json`, Prettier y `.env.example` (con `EXPO_PUBLIC_API_URL=`).
4. Crear `shared/theme` con los tokens de la sección 6 y cargar Nunito y Source Sans 3.
5. Montar el grupo `(auth)` para el login y el grupo `(tabs)` con las 4 pestañas vacías (Foros, Ecosistema, Asistente, Perfil).

**Primera tarea funcional: el login** → `docs/tarea-login.md`.
