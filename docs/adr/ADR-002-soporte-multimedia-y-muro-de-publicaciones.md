# ADR-002: Soporte Multimedia con Expo Image Picker y Consumo del Muro de Perfil
## Frontend Móvil (Expo SDK 57 + React Native)

- **Estado**: Aceptado e Implementado
- **Fecha**: 2026-11-09
- **Proyecto**: ASISCONNECTION (App Móvil — Expo SDK 57 + TypeScript estricto)
- **Backend**: `https://asisconection.onrender.com/v1` (`Asisconnection`)

---

## 1. Contexto

La aplicación móvil requería ampliar su alcance funcional en dos aspectos:
1. **Soporte de Imágenes:** Capacidad de capturar fotos con la cámara o seleccionarlas de la galería para actualizar la foto de perfil y adjuntar contenido gráfico a nuevas publicaciones en el foro.
2. **Consulta Pública de Publicaciones:** Capacidad de consultar y desplegar el muro de publicaciones aprobadas de un usuario específico al visitar su perfil (Pantalla 5b).

Estas capacidades debían integrarse respetando las directrices de `AGENTS.md`:
- Prohibición de librerías con código nativo no soportado por Expo Go sin previa justificación.
- Respeto al desacoplamiento estricto de capas (`ui → application → domain ← services`).
- Cumplimiento de la Ley 1581 de 2012 y Ley 1098 de 2006 (tratamiento de datos y protección de menores).

---

## 2. Decisiones Arquitectónicas

### Decisión 1: Adopción Exclusiva de `expo-image-picker`
- **Qué se decidió**: Se instaló `expo-image-picker` (~57.0.0) mediante `npx expo install expo-image-picker`.
- **Por qué**: Es el módulo oficial recomendado por Expo, compatible de fábrica con Expo Go y Continuous Native Generation (CNG), eliminando la necesidad de configurar módulos nativos manuales en iOS y Android.

### Decisión 2: Cliente HTTP Multipart sin Cabecera Manual `Content-Type`
- **Qué se decidió**: Se añadió el método `uploadFile<T>(path, formData, token)` en `createHttpClient.ts` que inyecta `Authorization: Bearer <token>`, pero **omite** la cabecera `Content-Type`.
- **Por qué**: En React Native, forzar `Content-Type: multipart/form-data` impide que el motor nativo inserte el `boundary` generado dinámicamente, lo que corrompe la subida en el servidor. Al omitirlo, el cliente nativo genera la cabecera completa correcta automáticamente.

### Decisión 3: Desacoplamiento de Servicios Multimedia en `ProfileService` y `PostsService`
- **Qué se decidió**: `ProfileService` expone `uploadAvatar(localUri)` y `PostsService` expone `uploadMedia(localUri)`. Los componentes de UI (`ProfileScreen` y `NewPostScreen`) consumen estos métodos sin interactuar directamente con `FormData`, endpoints HTTP ni tokens de sesión.
- **Por qué**: Mantiene el 100% de aislamiento arquitectónico y permite sustituir la subida por mocks en pruebas unitarias (`testUtils.ts`).

### Decisión 4: Encapsulamiento del Muro de Publicaciones en `usePublicProfile`
- **Qué se decidió**: El hook de aplicación `usePublicProfile(service, actorId)` consulta en paralelo los datos de perfil (`getPublicProfile`) y las publicaciones del usuario (`getActorPosts`), retornando ambos estados en objetos reactivos `useAsyncData`.
- **Por qué**: Simplifica radicalmente la labor del equipo de maquetación de UI, entregando datos listos para renderizar (`posts.data`, `posts.status`, `posts.reload`) y garantizando que el perfil público cargue sus publicaciones de forma declarativa y consistente.

---

## 3. Consecuencias y Estado

- **Positivo**: Cero errores de TypeScript (`npx tsc --noEmit`), cero errores de linter y 119 pruebas unitarias aprobadas.
- **Positivo**: El token `device_token` reside exclusivamente en `expo-secure-store` y nunca se expone en componentes de vista.
- **Pendiente**: Construcción de las pantallas de UI (`users/[userId].tsx`, `register.tsx`, `ModerationModal.tsx`) por el equipo de maquetación consumiendo los hooks provistos.
