# 01. Stack tecnológico

El backend (`docs/01-stack-tecnologico.md` y `README.md` de `osinapi`) define tres condiciones para el frontend:

| Condición del backend | Cómo se cumple |
|---|---|
| "El frontend Angular es un proyecto aparte que consume esta API" | Proyecto Angular independiente (`osin-front`) |
| "Node.js 20+ (cuando exista el frontend)" | Angular 20 funciona con Node `^20.19`, `^22.12` o `^24` |
| `CORS_ORIGENES=http://localhost:4200` | `ng serve` usa el puerto 4200 y llama directo a `http://localhost:8080/api` |

## 1. Versiones

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Angular (componentes standalone, signals, control flow `@if`/`@for`) | 20.3 |
| Lenguaje | TypeScript en modo `strict` y `strictTemplates` | 5.9 |
| Programación reactiva | RxJS (peticiones HTTP) + Angular Signals (estado de la vista) | 7.8 |
| Estilos | Tailwind CSS con `@tailwindcss/postcss` | 4.3 |
| Compilación | `@angular/build` (esbuild + Vite) | 20.3 |
| Pruebas | Jasmine + Karma + Chrome Headless | 5.9 / 6.4 |
| Tipografía | IBM Plex Sans vía `@fontsource/ibm-plex-sans` | 5.x |

Además de Angular solo hay dos dependencias agregadas: Tailwind CSS (estilos, sección 3) y Fontsource (tipografía, sección 4). Sin librería de componentes, de íconos ni gestor de estado externo.

## 2. Por qué Angular 20

La documentación del backend solo dice "Angular". Se eligió la versión 20 porque:

- Es compatible con "Node.js 20+" que exige el README. Versiones posteriores dejan de aceptar Node 20.
- Ya trae estables las piezas que usa la arquitectura: `input()`/`output()` basados en signals, `inject()`, `withComponentInputBinding()` (los parámetros de la URL llegan como inputs) y el control flow nativo.

## 3. Librería agregada: Tailwind CSS

**Qué es:** un framework de CSS de utilidades. Mantenido por Tailwind Labs desde 2017, con millones de descargas semanales en npm. Solo genera CSS en tiempo de compilación; no agrega JavaScript a la aplicación.

**Por qué se agregó:**

| Motivo | Detalle |
|---|---|
| Encaja con Atomic Design | Los átomos se construyen a mano con clases utilitarias; no se envuelven componentes ajenos. Así cada átomo es realmente el nivel más bajo del sistema y no un adaptador de otra librería |
| Tokens de diseño en un solo lugar | Colores y tipografía se declaran una vez en `@theme` (`src/styles.css`) y Tailwind genera las clases (`bg-marca`, `text-cancelado`, …). Cambiar un color es cambiar una línea |
| CSS mínimo | Solo se emiten las clases usadas. El CSS de producción completo pesa unos 30 kB |
| Sin acoplamiento de comportamiento | A diferencia de Angular Material o PrimeNG, no impone componentes, temas ni versiones de Angular. Actualizar Angular no depende de que la librería de estilos lo soporte |
| Confiable | Proyecto maduro, documentación oficial completa y soporte oficial en el builder de Angular vía PostCSS |

**Alternativas descartadas:**

| Opción | Por qué no |
|---|---|
| Angular Material | Los átomos serían envoltorios de componentes de Material; el diseño queda atado a Material Design |
| PrimeNG | Muchos componentes listos, pero la tabla y el diálogo ya traen su propia composición, lo que choca con construir organismos a partir de átomos propios |
| Bootstrap | Depende de clases de componente (`.btn`, `.card`) más difíciles de componer y de personalizar sin sobrescribir CSS |
| Solo CSS propio | Viable, pero obliga a mantener a mano un sistema de utilidades que Tailwind ya resuelve |

**Configuración:** `.postcssrc.json` activa `@tailwindcss/postcss`; `src/styles.css` importa Tailwind y declara los tokens con `@theme`.

## 4. Librería agregada: Fontsource (`@fontsource/ibm-plex-sans`)

**Qué es:** paquetes npm con fuentes de código abierto para servirlas desde la propia aplicación. Proyecto abierto y muy usado; IBM Plex se distribuye con licencia SIL Open Font License.

**Por qué se agregó:**

| Motivo | Detalle |
|---|---|
| Compilación sin red | Con Google Fonts, `ng build` intenta descargar e incrustar la fuente y falla sin Internet (error "Inlining of fonts failed"). Con Fontsource la fuente viene en `node_modules` |
| Sin peticiones a terceros | El navegador no llama a Google al abrir la aplicación |
| Solo lo necesario | Se importan únicamente el subconjunto latino y los pesos 400, 500, 600 y 700 (`src/styles.css`) |

## 5. Otras decisiones del stack

| Decisión | Motivo |
|---|---|
| Sin NgRx ni otra librería de estado | El estado de cada pantalla es pequeño y local. Un store por página con signals (`features/*/state`) es suficiente y no agrega dependencias |
| Íconos como SVG propios (`ui-icono`) | Solo se necesitan 16 íconos; una librería completa sería peso innecesario |
| `provideHttpClient(withFetch())` | Usa la API Fetch del navegador |
| Locale `es-MX` registrado | Montos en pesos (`$1,234.50`) y fechas en español (`30 oct 2026, 07:41`) con los pipes nativos de Angular |
| Alias de rutas (`@core`, `@shared`, `@features`) | Las importaciones muestran la capa de origen y no dependen de `../../..` |
| `karma.conf.js` con `ChromeHeadlessCI` | Permite correr las pruebas en contenedores y CI (`--no-sandbox`) |
