# Guía Técnica: Implementación Multimedia, Publicaciones de Perfil y Hoja de Ruta UI
## Frontend Móvil (Expo SDK 57 + React Native + TypeScript)

**Fecha:** 9 de noviembre de 2026  
**Repositorio:** `Frontend-Asisconnection`  
**Rama:** `feat/services-backend-integration`  
**Destinatarios:** Equipo de Desarrollo Frontend y Diseñadores de Interfaz  

---

## 1. ¿Qué se hizo y para qué? (Propósito y Contexto)

La aplicación móvil de la Fundación ASISCO UP contaba con la estructura visual y de navegación base, pero requería habilitar tres capacidades funcionales críticas conectadas con el backend en la nube:

1. **Gestión de Imágenes en Perfil y Foro:**
   - **Para qué:** Permitir que los usuarios personalicen su avatar con fotos reales de su galería y que puedan acompañar sus publicaciones en el foro con fotos tomadas desde la cámara o seleccionadas de la galería.
   - **Qué se resolvió:** Se eliminaron los avisos estáticos de *"Próximamente"* y se implementó un flujo completo de subida que procesa las imágenes localmente, las envía al backend (`POST /v1/media/upload`) mediante subida *multipart* y las aloja en la CDN de Cloudinary, persistiendo únicamente URLs seguras en la base de datos.
2. **Consulta Pública de Publicaciones de Cualquier Perfil:**
   - **Para qué:** Cuando un usuario ingresa al perfil de otro miembro de la comunidad (Pantalla 5b — `users/[userId]`), debe ver no solo su información biográfica permitida, sino también el muro con sus publicaciones aprobadas.
   - **Qué se resolvió:** Se creó la conexión lógica con `GET /v1/actors/:id/posts` y se integró dentro del hook `usePublicProfile`, entregando los datos listos para renderizar (`posts.data`, `posts.status`, `posts.reload`).
3. **Auto-aprobación Administrativa:**
   - **Para qué:** Evitar que las publicaciones y respuestas de usuarios con rol `ADMIN` o `MODERATOR` quedaran atrapadas en la cola de revisión humana (`PENDING`), garantizando que los avisos oficiales aparezcan de inmediato en el foro.

---

## 2. Requerimientos Técnicos para la Gestión de Imágenes

Para garantizar compatibilidad con iOS y Android sin romper el build nativo ni violar la arquitectura, se establecieron los siguientes requerimientos obligatorios:

### 2.1. Librería Oficial y Ecosistema Expo
- **Librería permitida:** Exclusivamente `expo-image-picker` (~57.0.0).
- **Prohibido:** Instalar librerías nativas externas (como `react-native-image-picker` o `react-native-image-crop-picker`) ya que romperían Expo Go y requerirían desarrollo nativo personalizado.
- **Visualización:** Para renderizar imágenes se debe utilizar `expo-image` (`<Image source={{ uri }} />`), no el componente `<Image>` básico de React Native, por motivos de optimización de memoria y caché.

### 2.2. Manejo de Permisos Nativos
Antes de invocar el selector nativo, siempre se debe solicitar permiso al usuario:
```typescript
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Permiso para Galería
const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (!libraryPermission.granted) {
  Alert.alert('Permiso necesario', 'Se requiere acceso a la galería para seleccionar fotos.');
  return;
}

// Permiso para Cámara
const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
if (!cameraPermission.granted) {
  Alert.alert('Permiso necesario', 'Se requiere acceso a la cámara para tomar fotografías.');
  return;
}
```

### 2.3. Parámetros de Recorte y Compresión
* **Foto de Perfil (Avatar):**
  - Debe permitir edición con relación de aspecto cuadrada 1:1:
    ```typescript
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Forzado cuadrado para el avatar circular
      quality: 0.8,   // Compresión óptima para carga rápida
    });
    ```
* **Fotos de Publicaciones (Foro):**
  - Relación de aspecto libre con compresión `quality: 0.8`:
    ```typescript
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    ```
* **Límite de Tamaño:** El backend rechaza archivos mayores a 5 MB (`5 * 1024 * 1024` bytes).
* **Formatos Aceptados:** JPEG (`.jpg`, `.jpeg`), PNG (`.png`) y WebP (`.webp`).

### 2.4. Protocolo HTTP Multipart y Aislamiento de Tokens
- React Native requiere que cuando el cuerpo sea un `FormData`, el motor nativo del dispositivo calcule la cabecera `Content-Type: multipart/form-data; boundary=...`.
- El cliente HTTP de la app (`src/shared/lib/http/createHttpClient.ts`) cuenta con el método `uploadFile<T>(path, formData, token)`. **Nunca debe colocarse manualmente la cabecera `Content-Type`**.
- El empaquetado de `FormData` está resuelto en la utilidad [`src/shared/lib/uploadMedia.ts`](file:///Users/press/Documents/Frontend-Asisconnection/src/shared/lib/uploadMedia.ts).

---

## 3. Arquitectura y Cómo Consumir las Funcionalidades

En cumplimiento de las reglas de `AGENTS.md` (`ui → application → domain ← services`), los componentes visuales **tienen estrictamente prohibido llamar a `fetch` o manipular tokens**. Toda la lógica ya está envuelta en servicios y hooks.

### 3.1. Consumo del Perfil de Otra Persona (Pantalla 5b: `users/[userId]`)
El hook `usePublicProfile` provee de forma automática tanto los datos del perfil (con privacidad Ley 1581 aplicada por el backend) como la lista de publicaciones aprobadas de ese usuario:

```tsx
import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProfileService, usePublicProfile } from '@/modules/profile';
import { ProfilePostCard } from '@/modules/profile/ui/components/ProfilePostCard';

export function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const service = useProfileService();
  
  // Hook de aplicación listo para usar:
  const { 
    profile,              // Estado del perfil { status, data, error, reload }
    posts,                // Estado del muro { status, data, error, reload }
    connection,           // Estado de la conexión ('PENDING' | 'ACCEPTED')
    follow,               // Función para seguir al usuario
    isFollowingLoading,   // Indicador de seguimiento en progreso
    followError           // Error al intentar seguir
  } = usePublicProfile(service, userId);

  if (profile.status === 'loading') {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Cabecera con datos del perfil: profile.data?.fullName, etc. */}

      {/* Lista de publicaciones del usuario */}
      {posts.status === 'loading' && <ActivityIndicator />}
      {posts.status === 'success' && (
        <FlatList
          data={posts.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProfilePostCard post={item} />}
          onRefresh={posts.reload}
          refreshing={posts.status === 'loading'}
          ListEmptyComponent={<Text>Este usuario no tiene publicaciones aún.</Text>}
        />
      )}
    </View>
  );
}
```

### 3.2. Subida de Avatar en Mi Perfil
En `ProfileScreen.tsx`, el servicio ya expone `uploadAvatar` y `updateMyProfile`:
```typescript
const service = useProfileService();

async function handleUpdateAvatar(localUri: string) {
  // 1. Sube la foto al endpoint de media y obtiene la URL de Cloudinary
  const uploadedUrl = await service.uploadAvatar(localUri);
  // 2. Persiste la nueva URL en el perfil del usuario autenticado
  await service.updateMyProfile({ avatarUrl: uploadedUrl });
  // 3. Recarga los datos del perfil en pantalla
  profile.reload();
}
```

### 3.3. Creación de Publicación con Imagen Adjunta
En `NewPostScreen.tsx`, el hook `useCreatePost` acepta `mediaUrls`:
```typescript
const { createPost, isSubmitting } = useCreatePost(service);

async function handlePublish(content: string, categoryId: string, localImageUri?: string) {
  let mediaUrls: string[] = [];
  if (localImageUri) {
    // Sube la imagen y obtiene la URL pública
    const uploadedUrl = await service.uploadMedia(localImageUri);
    mediaUrls = [uploadedUrl];
  }

  const result = await createPost({
    categoryId,
    content,
    mediaUrls,
  });

  // result.message indica si fue enviada a moderación o aprobada de inmediato
}
```

---

## 4. Tareas Pendientes para el Equipo de UI (`docs/PENDIENTES.md`)

Con los servicios, clientes HTTP y contratos 100% terminados y probados, el equipo de maquetación solo debe construir los componentes visuales:

| Tarea | Pantalla | Archivo | Qué debe hacer el equipo de UI |
| :--- | :--- | :--- | :--- |
| **UI-01** | **Registro & Invitado** | `src/app/(auth)/register.tsx`<br>`LoginScreen.tsx` | 1. En `LoginScreen.tsx`, activar el botón *"Ingresar como invitado"* conectándolo a `useLogin().submitAnonymous(acceptConsent)`.<br>2. En `register.tsx`, maquetar el formulario con campos `username`, `email`, `password`, selector de rol (`ACUDIENTE`, `VOLUNTARIO`, `INVERSOR`, `BENEFICIARIO`), checkbox de consentimiento legal y botón de enviar a `useAuth().register(...)`. |
| **UI-02** | **Perfil de Terceros** | `src/app/users/[userId].tsx`<br>`UserProfileScreen.tsx` | 1. Maquetar la pantalla de perfil de otra persona (avatar, biografía respetando privacidad, contadores y botón *"Seguir / Siguiendo"* conectado a `follow`).<br>2. Renderizar el muro de publicaciones con `posts.data` de `usePublicProfile`.<br>3. En `ForumPostCard.tsx`, conectar el toque del autor con `router.push('/users/' + post.author.id)`. |
| **UI-03** | **Bandeja de Moderación** | `src/modules/forum/ui/ModerationModal.tsx` | 1. Mostrar un icono/botón de moderación en el header del Foro **únicamente si `user.roles` incluye `'ADMIN'` o `'MODERATOR'`**.<br>2. Construir la vista de lista de publicaciones y comentarios pendientes con `useModerationQueue(service)`, con botones accesibles (44×44): *"Aprobar"* y *"Rechazar"*. |
| **UI-04** | **Edición de Perfil Propio** | `src/modules/profile/ui/ProfileScreen.tsx` | Reemplazar el aviso provisional de *"Próximamente"* por un modal desplegable para editar nombres, apellidos, biografía corta y ciudad, conectándolo a `service.updateMyProfile(...)` y `profile.reload()`. |
| **UI-07** | **Restricción de Aviso** | `src/modules/posts/ui/NewPostScreen.tsx` | Ocultar o deshabilitar la categoría *"Avisos / Noticias"* cuando el usuario no posea rol `ADMIN` o `MODERATOR`. |

---

## 5. Verificación de Calidad y Comandos Obligatorios

Antes de entregar cualquier cambio en la interfaz, el equipo debe ejecutar los comandos de control de calidad:

```bash
# 1. Comprobación estricta de TypeScript
npx tsc --noEmit

# 2. Linter y formato con reglas arquitectónicas
npx eslint "src/**/*.{ts,tsx}"

# 3. Pruebas automatizadas unitarias
npm test
```

> [!NOTE]
> Todos los estilos deben utilizar exclusivamente los tokens de `src/shared/theme` (`COLORS`, `SPACING`, `RADIUS`, `TYPOGRAPHY`). Está terminantemente prohibido hardcodear colores o espaciados en los archivos de interfaz.
