# 03. Atomic Design

La interfaz se compone en cinco niveles. Cada nivel solo usa componentes de niveles inferiores.

```
Átomos ──▶ Moléculas ──▶ Organismos ──▶ Plantillas ──▶ Páginas
```

## 1. Dónde vive cada nivel

| Nivel | Genéricos (reutilizables en cualquier pantalla) | Del dominio (saben qué es un pedido o un producto) |
|---|---|---|
| Átomos | `shared/ui/atoms` | — |
| Moléculas | `shared/ui/molecules` | `features/pedidos/ui/molecules` |
| Organismos | `shared/ui/organisms` | `features/*/ui/organisms` |
| Plantillas | `shared/ui/templates` | — |
| Páginas | — | `features/*/pages` |

Los componentes del dominio se quedan en su carpeta de funcionalidad: así `shared/ui` nunca importa de `features` y puede reutilizarse en otro proyecto.

## 2. Átomos

Elementos indivisibles. No conocen el dominio ni hacen peticiones.

| Átomo | Selector | Por qué así |
|---|---|---|
| Botón | `button[uiBoton]`, `a[uiBoton]` | Se aplica como atributo sobre el elemento nativo para conservar teclado, foco y semántica. Variantes: primario, secundario, peligro, peligro-borde, fantasma. `cargando` lo deshabilita y muestra un spinner para evitar el doble clic |
| Campo | `input[uiCampo]`, `select[uiCampo]`, `textarea[uiCampo]` | Directiva y no componente: sigue funcionando con `formControlName` sin escribir un `ControlValueAccessor` |
| Etiqueta | `label[uiEtiqueta]` | Estilo único de etiquetas |
| Insignia | `ui-insignia` | Pastilla de color con texto (5 tonos) |
| Ícono | `ui-icono` | 16 trazos SVG propios; `aria-hidden` porque siempre va acompañado de texto |
| Spinner | `ui-spinner` | Indicador de carga con texto para lectores de pantalla |

## 3. Moléculas

Combinación de átomos con un propósito único.

| Molécula | Compuesta por | Propósito |
|---|---|---|
| `ui-campo-formulario` | Etiqueta + control proyectado + ayuda/error | Un campo de formulario completo y accesible (`for`/`id`, `role="alert"` en el error) |
| `ui-alerta` | Ícono + título + texto + lista | Mensajes en línea; la lista muestra los `errores` del ProblemDetail |
| `ui-encabezado-pagina` | Enlace de regreso + título + descripción + acciones | Encabezado igual en todas las páginas |
| `ui-estado-vacio` | Ícono + título + descripción + acción | Indica qué hacer cuando no hay datos |
| `ui-paginador` | Botones + texto | "1–10 de 23", página X de Y; convierte base 1 (vista) a base 0 (API) |
| `ui-selector-cantidad` | Botones − / + y campo numérico | Captura de cantidades enteras ≥ 1 |
| `ui-estado-pedido` (pedidos) | Insignia | Estado del pedido con color **y** texto |

## 4. Organismos

Secciones completas de la interfaz. Reciben datos por `input()` y comunican intenciones por `output()`; **no** inyectan casos de uso ni stores (componentes presentacionales).

| Organismo | Carpeta | Contenido |
|---|---|---|
| `ui-navegacion-principal` | shared | Pedidos, Nuevo pedido, Productos |
| `ui-notificaciones` | shared | Avisos temporales (toasts) |
| `ui-dialogo-confirmacion` | shared | Modal con `<dialog>` nativo |
| `app-tabla-productos` | productos | Catálogo con disponibilidad y acciones |
| `app-formulario-producto` | productos | Alta/edición con validación local y del servidor |
| `app-filtros-pedidos` | pedidos | Estado y folio |
| `app-tabla-pedidos` | pedidos | Folio, fecha, partidas, total, estado |
| `app-catalogo-pedido` | pedidos | Productos activos con búsqueda y botón Agregar |
| `app-resumen-pedido` | pedidos | Partidas en captura, total estimado, avisos de existencia. El texto del botón (`textoGuardar`) cambia entre "Crear pedido" y "Guardar cambios" |
| `app-linea-vida-pedido` | pedidos | Recorrido Borrador → Confirmado → Completado |
| `app-tabla-partidas` | pedidos | Partidas y total calculados por el servidor |
| `app-acciones-pedido` | pedidos | Botones válidos para el estado actual |

## 5. Plantillas

Definen la distribución, no el contenido. El contenido entra por proyección con atributos (`<x encabezado>`, `<x principal>`, `<x lateral>`, `<x pie>`).

| Plantilla | Distribución | Usada por |
|---|---|---|
| `ui-layout-principal` | Barra lateral (escritorio) / barra superior (móvil) + contenido. Monta una vez los avisos y el diálogo | Todas las rutas |
| `ui-plantilla-listado` | Encabezado, filtros, tabla en tarjeta, paginación | Pedidos, Productos |
| `ui-plantilla-detalle` | Columna principal + columna lateral fija | Detalle de pedido, Nuevo pedido |

## 6. Páginas

Contenedores: leen parámetros de la URL, crean su store, coordinan diálogos y avisos, y pasan datos a la plantilla. Son las únicas piezas de la interfaz que conocen el estado de la aplicación.

| Página | Ruta | Plantilla |
|---|---|---|
| `PedidosListaPage` | `/pedidos` | Listado |
| `PedidoFormularioPage` | `/pedidos/nuevo`, `/pedidos/:id/editar` | Detalle |
| `PedidoDetallePage` | `/pedidos/:id` | Detalle |
| `ProductosListaPage` | `/productos` | Listado |
| `ProductoFormularioPage` | `/productos/nuevo`, `/productos/:id/editar` | Propia (una columna) |
| `NoEncontradoPage` | `**` | — |

## 7. Reglas que se siguieron

1. Un componente solo importa de su nivel o inferiores (`shared/ui/atoms/index.ts`, `molecules/index.ts`, … sirven de punto de entrada).
2. Todos los componentes usan `ChangeDetectionStrategy.OnPush` (configurado también en `angular.json` para los nuevos).
3. Las clases de Tailwind se escriben completas en mapas (`VARIANTES`, `TONOS`), nunca concatenando fragmentos, para que Tailwind las detecte al compilar.
4. Navegar es un enlace (`<a routerLink>`); modificar datos es un evento (`output()`). Así funcionan "abrir en otra pestaña" y el teclado, y los organismos siguen sin conocer los casos de uso.
