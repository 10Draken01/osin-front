# 04. Sistema de diseño

Herramienta interna para el operador de una tienda pequeña: pocas pantallas, uso diario, muchas cifras. El diseño prioriza leer importes y estados de un vistazo y no equivocarse al cambiar un estado.

## 1. Color

Tokens en `src/styles.css` (`@theme`). Cada estado del pedido tiene un color fuerte (texto) y uno suave (fondo).

| Token | Valor | Uso |
|---|---|---|
| `tinta` | `#1c2733` | Texto principal y barra de navegación |
| `tinta-suave` | `#4a5866` | Texto secundario, ayudas |
| `papel` | `#f3f5f4` | Fondo de la aplicación |
| `superficie` | `#ffffff` | Tarjetas, tablas, formularios |
| `linea` / `linea-fuerte` | `#d6dcd9` / `#aab4af` | Bordes y separadores / bordes de campos |
| `marca` | `#0e6b5a` | Acción principal, enlaces, foco |
| `borrador` | `#4f5b69` | Estado BORRADOR (neutro: aún no afecta inventario) |
| `confirmado` | `#1d5bb8` | Estado CONFIRMADO |
| `completado` | `#0e6b5a` | Estado COMPLETADO (mismo verde que la marca: es el final esperado) |
| `cancelado` | `#ad2a20` | Estado CANCELADO y acciones destructivas |
| `aviso` | `#8a5300` | Existencia insuficiente, productos agotados |

El estado nunca se comunica solo con color: la insignia siempre lleva el texto ("Confirmado") y un punto.

## 2. Tipografía

**IBM Plex Sans** en una sola familia (400, 500, 600, 700). Se eligió por sus números claros y su carácter técnico, adecuado para una herramienta de inventario. Si la fuente no carga se usa la del sistema.

| Uso | Tamaño | Peso |
|---|---|---|
| Título de página | 24 px | 600 |
| Total del pedido | 18–20 px | 600 |
| Texto base | 15 px | 400 |
| Tablas, ayudas | 14 / 12 px | 400–500 |

Todas las cifras usan la clase `.cifra` (`font-variant-numeric: tabular-nums`) y se alinean a la derecha en las tablas, para comparar importes en columna.

## 3. Elemento principal

El **recorrido del pedido** (`app-linea-vida-pedido`) es el único elemento con peso visual propio. Muestra los tres pasos del ciclo de vida, en cuál está el pedido y qué pasó con el inventario en cada uno. El resto de la interfaz es deliberadamente sobrio.

## 4. Accesibilidad

| Medida | Dónde |
|---|---|
| Enlace "Saltar al contenido" | Layout |
| Foco visible de 2 px en color de marca | Global (`:focus-visible`) |
| `aria-current="page"` en la navegación y `aria-current="step"` en el paso actual del pedido | Navegación, línea de vida |
| Etiqueta asociada a cada campo; errores con `role="alert"` y `aria-invalid` | Formularios |
| `<dialog>` nativo: foco atrapado, Esc cierra, fondo inerte | Diálogo de confirmación |
| Avisos en región `aria-live` | Notificaciones |
| Tablas con `<caption>` y `scope` en encabezados | Todas las tablas |
| Respeta `prefers-reduced-motion` | Global |
| Botones de ícono con `aria-label` ("Quitar Leche 1 L") | Resumen del pedido, selector de cantidad |

## 5. Adaptación a pantallas

| Ancho | Cambio |
|---|---|
| < 768 px | La navegación pasa a una barra superior; las tablas se desplazan horizontalmente dentro de su tarjeta (la página no) |
| < 1024 px | La columna lateral (resumen del pedido, acciones) baja debajo del contenido |
| ≥ 1024 px | La columna lateral queda fija al hacer scroll, para tener el total y los botones siempre a la vista |

## 6. Fuera de alcance

- Modo oscuro: herramienta de mostrador, se usa con luz de oficina. Los tokens permiten agregarlo redefiniendo las variables.
- Internacionalización: la API responde mensajes en español y el locale es `es-MX`.
