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
