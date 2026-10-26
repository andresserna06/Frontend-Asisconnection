# Tarea 1 · Login

Objetivo: pantalla de inicio de sesión funcionando contra el backend (o un repositorio simulado mientras no haya URL), con sesión guardada de forma segura y rutas protegidas.

Diseño: mockup `Main.dc.html` (frame `01-Login`). Contrato: `docs/api-auth.md`. Reglas de arquitectura: `AGENTS.md`.

## Alcance de esta tarea

Incluye: la pantalla completa como en el mockup, login funcional, sesión persistente, cerrar sesión, redirecciones según sesión, manejo de errores.
Solo con aviso «disponible pronto»: crear cuenta, recuperar contraseña e invitado (ver «Decisiones tomadas»).

## Qué construir

Módulo `src/modules/auth/` con las capas del `AGENTS.md`:

- `domain/`: tipos `Role` (`'ADMIN' | 'ESTUDIANTE' | 'ACUDIENTE' | 'DONANTE' | 'TALLERISTA'`), `Session` (`token`, `user`), `User` (`username`, `email`, `roles`), `AuthRepository` (interfaz: `login`, `logout`, `getProfile`) y errores tipados (`InvalidCredentials`, `SessionExpired`, `Forbidden`, `Network`, `Validation` con detalle por campo).
- `data/`: `HttpAuthRepository` (usa `fetch`, `EXPO_PUBLIC_API_URL`, encabezado `Authorization: Bearer`), y un mapper de la respuesta a `Session`. Mientras no haya backend, `EXPO_PUBLIC_API_URL` apunta al mock de Postman (`postman/`). El almacenamiento del token usa `expo-secure-store`.
- `application/`: `useAuth` (estado de sesión: `loading | signedOut | signedIn`), `useLogin` (envío, carga, errores) y la restauración de sesión al abrir la app.
- `ui/`: `LoginScreen` y sus componentes; los átomos (`Button`, `Input`, etc.) van en `shared/ui`.
- Rutas: `src/app/(auth)/login.tsx`; el `_layout.tsx` raíz decide a qué grupo ir según la sesión (`signedIn` → `(tabs)`, si no → `(auth)/login`). Mientras restaura la sesión, mostrar una pantalla de carga (no parpadear el login).

## Comportamiento

1. Campos: correo y contraseña (con mostrar/ocultar; el botón con `accessibilityLabel`). Teclado de correo, sin autocapitalizar ni autocorregir.
2. Validación en cliente mínima: correo con formato válido y contraseña no vacía. **No** exigir 12 caracteres al iniciar sesión (eso solo aplica al registro).
3. «Iniciar sesión» deshabilitado y con indicador de carga mientras se envía. Evitar doble envío.
4. Éxito: guardar el token en SecureStore, cargar el perfil (`GET /auth/perfil`) y entrar al Foro.
5. Errores, en español y claros, junto al campo cuando sea de un campo:
   - 400: mostrar el detalle por campo.
   - 401 en el login: «Correo o contraseña incorrectos».
   - Sin conexión o tiempo agotado: «No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo».
6. El servidor en Render puede tardar en despertar la primera vez: timeout generoso (~30 s) y mensaje de carga amable, sin dar la app por rota.
7. Cualquier 401 en una petición autenticada: borrar la sesión y volver al login.
8. **Cerrar sesión** (botón en Ajustes): llamar `POST /auth/logout`, borrar el token local aunque la llamada falle, y volver al login.

## Pruebas (Jest + testing-library)

- `domain`/`application`: login correcto, credenciales inválidas, 400 con detalle por campo, sesión expirada, restauración de sesión.
- `ui`: el botón se deshabilita mientras carga, se muestran los errores, se alterna la visibilidad de la contraseña.

## Decisiones tomadas

El login se construye **igual que el mockup** (`docs/diseno/pantallas/01-Login.png` y `html/01-Login.html`), con el logo de `docs/diseno/assets/logo-asisco-up.png`. Todos los botones se muestran, aunque algunos todavía no funcionen:

1. **Campo «Correo o documento»:** se muestra como en el mockup, pero por ahora solo funciona con correo, porque el login del backend recibe `email`. Si lo escrito no parece un correo, mostrar: «Por ahora ingresa con tu correo».
2. **«¿Olvidaste tu contraseña?»:** visible, sin funcionalidad. Al tocarlo, mostrar el aviso «Esta función estará disponible pronto».
3. **«Crear cuenta»:** visible, sin funcionalidad. Mismo aviso. (El registro y su pantalla quedan en `PENDIENTES.md`.)
4. **«Ingresar como invitado»:** visible, sin funcionalidad. Mismo aviso. (Falta decidir qué vería un invitado; Ley 1581.)
5. **Roles:** son los del backend (ver `api-auth.md`). Guardarlos tal como llegan y mostrar la etiqueta en español con la tabla de ese archivo.
6. **Respuesta del login:** tipar de forma defensiva y confirmar los nombres exactos de los campos cuando llegue la URL.

El aviso de «disponible pronto» es un componente único y reutilizable (por ejemplo `ComingSoonNotice`), para quitarlo fácil cuando cada función exista. Cuando una de estas funciones se implemente, se registra en `BITACORA.md` y se quita de `PENDIENTES.md`.

## Al terminar

Quitar T-03 de `PENDIENTES.md` y registrarla en `BITACORA.md`.
