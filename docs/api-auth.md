# Contrato de autenticación (backend SAGA UP)

Fuente: correo de la profesora. El backend lo desarrolla otro equipo y se despliega en Render; **la URL aún no se ha compartido**. Hasta entonces, se trabaja con un repositorio simulado (ver `tarea-login.md`). No se edita el contrato desde este repo; si algo falla o falta, se anota en `PENDIENTES.md` y se reporta a la profesora.

Base: `EXPO_PUBLIC_API_URL` (sin barra final).

## Roles

`ADMIN`, `ESTUDIANTE`, `ACUDIENTE`, `DONANTE`, `TALLERISTA`. Un usuario puede tener varios. Son los mismos roles para todos los proyectos del curso: la app los usa tal cual, sin inventar otros.

Cómo se muestran en la app (etiqueta del rol junto al nombre, antes «Familia» o «Profesional» en los mockups):

| Rol del backend | Etiqueta en pantalla |
|---|---|
| `ACUDIENTE` | Acudiente |
| `DONANTE` | Donante |
| `TALLERISTA` | Tallerista |
| `ESTUDIANTE` | Estudiante |
| `ADMIN` | Administrador |

Si una persona tiene varios roles, la etiqueta muestra el primero según este orden: ADMIN, TALLERISTA, ESTUDIANTE, ACUDIENTE, DONANTE. Las etiquetas y el orden viven en un solo lugar (el modelo `modules/auth/domain/models/Role.ts`), no repartidas por la UI. Propuesta inicial: el equipo puede cambiarla.

## Endpoints

| Método y ruta | Auth | Para qué |
|---|---|---|
| `POST /auth/registro` | No | Registro público. **Solo `ACUDIENTE` y `DONANTE`**. |
| `POST /auth/login` | No | Inicio de sesión. Devuelve `token` y los roles. |
| `GET /auth/perfil` | Bearer | Datos y roles del usuario de la sesión. |
| `POST /auth/logout` | Bearer | Cierra la sesión. |
| `POST /auth/usuarios` | Bearer de `ADMIN` | Crea usuarios `ESTUDIANTE`, `TALLERISTA` o `ADMIN`. No se usa desde la app de la comunidad. |

El token va en todas las rutas protegidas: `Authorization: Bearer <token>`.

## Cuerpos

Registro (un solo rol, campo `rol`):
```json
{ "username": "maria.acudiente", "email": "maria@prueba.com", "clave": "ClaveAcudiente2026", "rol": "ACUDIENTE" }
```

Login:
```json
{ "email": "maria@prueba.com", "clave": "ClaveAcudiente2026" }
```

Crear usuario (admin; varios roles, campo `roles` como arreglo):
```json
{ "username": "ana.tallerista", "email": "ana@prueba.com", "clave": "ClaveTallerista2026", "roles": ["TALLERISTA"] }
```

## Reglas

- La clave debe tener **al menos 12 caracteres** (al registrar; en el login no se valida longitud en el cliente).
- El cuerpo solo admite los campos indicados: **cualquier campo extra se rechaza**. No mandes campos de más.
- La forma exacta de la respuesta del login (nombres de campos del token y de los roles) **no está documentada**: se sabe que incluye `token` y los roles. Tipa la respuesta de forma defensiva y confírmala con la URL real.

## Respuestas

| Código | Significado | Qué hace la app |
|---|---|---|
| 201 | Creado | Registro correcto. |
| 200 | OK (login, perfil, logout) | Seguir el flujo. |
| 400 | Datos inválidos, con detalle por campo | Mostrar el error junto a cada campo. |
| 401 | Sin token, token inválido o sesión expirada | Borrar la sesión local y volver al login. |
| 403 | Sin permisos | Mostrar mensaje de «no tienes permiso». |
| 409 | Usuario o correo ya registrado | Mensaje junto al campo de correo o usuario. |

Los usuarios de los ejemplos son solo de prueba. **No uses datos reales de la Fundación.**
