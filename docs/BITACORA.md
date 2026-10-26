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
