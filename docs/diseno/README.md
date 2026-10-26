# Diseño de referencia (mockups)

Aquí está todo lo que el agente necesita para construir las pantallas **tal como se diseñaron**. Los mockups originales son un prototipo web de 390×844 px; esta carpeta es su copia estática.

## Cómo usarlo

Antes de construir una pantalla:
1. Mira su captura en `pantallas/` (es la referencia visual).
2. Abre su HTML en `html/` (`html/<mismo nombre>.html`): ahí están los valores exactos de tamaños, espaciados, radios, colores y pesos de letra, en `style="..."`. **Respeta esos números.** Convierte px a las unidades de React Native 1:1 (390 px de ancho = pantalla de referencia).
3. Usa los tokens de abajo y de `src/shared/theme`; no copies colores sueltos.
4. Traduce el HTML a componentes de React Native según `AGENTS.md`: nada de CSS grid, nada de etiquetas web; la estructura flexbox del HTML se traduce directo a `View` con `flexDirection`, `gap` y `padding`.

Si el diseño y el código difieren, gana el diseño. Si algo no se puede hacer igual en React Native, deja la diferencia anotada en `BITACORA.md`.

## Pantallas

| Archivo (`pantallas/*.png` y `html/*.html`) | Qué muestra |
|---|---|
| `01-Login` | Inicio de sesión |
| `02-Foro` · `02b-Foro-header-oculto` | Foro con header completo · con el header oculto al bajar |
| `03-Ecosistema` | Ecosistema (tarjetas con enlaces externos) |
| `04-Asistente` · `04b-Asistente-respuesta` · `04c-Asistente-gestor` | Asistente: inicio · con una respuesta · derivado a una persona |
| `05-Perfil` · `05b-Perfil-header-oculto` · `05c-Perfil-guardados` | Perfil propio: normal · header oculto · pestaña Guardados |
| `06-Comentarios` · `06b-Comentarios-respondiendo` | Hoja de comentarios · respondiendo a alguien |
| `07-Notificaciones` · `07b-Notificaciones-mas-abajo` | Notificaciones desde arriba · más abajo con el header oculto |
| `08-PerfilUsuario` · `08b-…-siguiendo` · `08c-…-sin-datos` | Perfil de otra persona: con Seguir · con Siguiendo · sin datos compartidos |
| `09-Ajustes` · `09b-…-con-datos-visibles` · `09c-…-cerrar-sesion` | Ajustes: normal · con datos activados · al final con Cerrar sesión |
| `10-Nueva-publicacion` · `10b-…-otra-foto` · `10c-…-sin-foto` | Nueva publicación |

Las capturas muestran los estados clave; los demás (interruptores, seguir, chips) se deducen de los pares de frames.

## Assets (`assets/`)

| Archivo | Uso |
|---|---|
| `logo-asisco-up.png` | Logo de la fundación (2450×900). Login. Copiar a `assets/images/` del proyecto. |
| `logo-palabra.png` | Logo en versión palabra |
| `foro-pintura.jpg`, `foro-infografia.jpg`, `foro-acordeones.jpg` | Imágenes de las publicaciones de ejemplo del Foro |
| `foro-perro.jpg` | Foto de ejemplo de Nueva publicación |

Son imágenes de ejemplo para los mocks. No son datos reales de la fundación.

## Datos de ejemplo (mocks)

Los textos de los HTML (nombres, publicaciones, comentarios, notificaciones, fechas relativas) son los datos ficticios que debe servir el mock de Postman (`postman/`). Cópialos de ahí para que la app se vea igual que el mockup.

Ojo: los mockups muestran «Familia» y «Profesional» como etiqueta de rol. En la app la etiqueta sale del rol del backend (ver `../api-auth.md`); en los mocks usa roles reales (Acudiente, Donante, Tallerista…).

## Tokens

**Colores.** Los más usados en los mockups:

| Uso | Valor |
|---|---|
| Verde principal (header, botones) | `#1F6B65` |
| Verde secundario | `#2D938B` · fondo claro `#E7F1EF` · borde `#B9D5D1` · texto sobre claro `#17544F` |
| Verde botón de header (fondo oscuro) | `#175650` |
| Naranja (acento) | `#F19700` · pálido `#FDEFD9` · texto `#8A4E00` / `#6B3D00` |
| Azul (Preguntas) | `#2F6AB0` · pálido `#E3EDF8` · texto `#1B4677` |
| Morado (Logros) | `#7B4FB0` · pálido `#EFE7F7` · texto `#4A2A72` |
| Fondo de pantalla | `#F7F4EE` |
| Superficie / tarjeta | `#FFFFFF`, borde `#E4DED2`; superficie suave `#EFE9DC` |
| Campos | fondo `#F7F4EE`, borde `#DDD5C6` |
| Texto | `#16302E` (títulos) · `#1C2B2A` (principal) · `#3E4F4D` · `#5A6B69` (secundario) · `#6B7A78` (terciario) |
| Alerta / punto de no leído | `#D9534F` |
| Peligro (cerrar sesión) | `#8A2F2F` |

**Tipografía.** Títulos y botones: **Nunito** 700/800. Cuerpo: **Source Sans 3** 400/600. Tamaños frecuentes: 12, 12.5, 13, 14, 14.5, 15, 16, 21 px; etiquetas de la barra inferior 10.5 px.

**Radios.** 999 (chips, avatares, píldoras) · 12–14 (campos y botones) · 18–22 (tarjetas, header verde de 22 abajo) · 13 (botones cuadrados del header, 44×44).

**Medidas fijas.** Pantalla de referencia 390×844. Área segura ≈ 50 px arriba y 30 px abajo. Header verde 108 px de alto. Áreas táctiles mínimas 44×44. Barra inferior con 4 pestañas.
