# Stack tecnológico

Principio: **lo mínimo que cubre las funcionalidades de los diseños**. Casi todo viene incluido en Expo (SDK 57) o en la plantilla de `create-expo-app`. Cada dependencia extra tiene que justificarse en `BITACORA.md`. Instalación siempre con `npx expo install <paquete>`.

## Base

| Qué | Herramienta | Para qué |
|---|---|---|
| Framework | Expo SDK 57 + React Native | App Android e iOS; se prueba con Expo Go |
| Lenguaje | TypeScript (estricto) | Menos errores y modelos claros |
| Navegación | Expo Router | Pestañas (Foros, Ecosistema, Asistente, Perfil), modales y rutas protegidas |
| Gestor de paquetes | npm | Ya está en el repo |

## Lo que piden las pantallas

| Necesidad en el diseño | Solución | ¿Extra? |
|---|---|---|
| Estilos y tema (colores, radios, tipografía) | `StyleSheet` + tokens en `shared/theme` | No |
| Fuentes Nunito y Source Sans 3 | `expo-font` + `@expo-google-fonts/nunito` y `@expo-google-fonts/source-sans-3` | Sí (2 paquetes de fuentes) |
| Íconos (campana, corazón, burbuja, engranaje…) | `@expo/vector-icons` (Feather) | No, viene con Expo |
| Imágenes de publicaciones y avatares | `expo-image` | No |
| Publicaciones con video | `expo-video` | Sí |
| Elegir foto o abrir cámara (Nueva publicación) | `expo-image-picker` | Sí |
| Áreas seguras (arriba y abajo) | `react-native-safe-area-context` | No, viene en la plantilla |
| Feed del Foro con una publicación por pantalla | `FlatList` + `snapToInterval` | No |
| Header que se oculta al hacer scroll | API `Animated` de React Native | No |
| Hoja de Comentarios que sube desde abajo | Pantalla modal de Expo Router (`transparentModal`) + `Animated` | No |
| Interruptores, chips, pestañas, botones | Componentes propios (`shared/ui`, Atomic Design) | No |
| Guardar el token de sesión | `expo-secure-store` | Sí |
| Estado de la sesión | React Context (`AuthProvider`) | No |
| Llamadas al backend (login, sesión) | `fetch` en la capa `data/` | No |
| Listas que vienen del servidor (Foro, comentarios, notificaciones): carga, error, recargar, «me gusta» y «seguir» al instante | **TanStack Query** (`@tanstack/react-query`) | Sí. Se instala en T-06 (Foro), no antes |
| Teclado que no tapa el campo (Comentarios, Nueva publicación, Login) | `KeyboardAvoidingView` de React Native | No |
| Pantalla de arranque hasta que carguen fuentes y sesión | `expo-splash-screen` | No, viene en la plantilla |
| Abrir enlaces externos (tarjetas del Ecosistema, enlaces del Asistente) | `Linking` de React Native | No |
| Fechas tipo «hace 2 días» y agrupar notificaciones | Funciones propias en `shared/lib` | No |

## Sobre `global.css` de la plantilla

Solo trae variables CSS de tipografía para la versión web (Spline Sans, SF Pro Rounded…). No es Tailwind ni NativeWind y no afecta a Android ni iOS. En T-01 se borra y se quita su import si lo hay; las fuentes de la app se cargan con `expo-font`.

## Calidad

| Qué | Herramienta |
|---|---|
| Lint | ESLint (`npx expo lint`) |
| Formato | Prettier |
| Tipos | `npx tsc --noEmit` |
| Pruebas | Jest + `jest-expo` + `@testing-library/react-native` |

## Decidido NO usar (por ahora)

Redux o Zustand (basta Context) · axios (basta `fetch`) · NativeWind o librerías de componentes (los diseños son propios) · librerías de bottom sheet · librerías de formularios o validación (hay pocos formularios) · lucide, FontAwesome y otros paquetes de íconos · Firebase o Supabase (el backend es el de SAGA UP en Render).

Si más adelante el equipo necesita algo de esta lista, se aprueba y se anota en `BITACORA.md`.

## Se agrega más adelante, cuando llegue su pantalla

- Notificaciones push (`expo-notifications`): solo si la fundación las pide; requiere development build.
- Subir fotos y videos de las publicaciones: se hará con `fetch` y `FormData` cuando el backend defina el endpoint.
