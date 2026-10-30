# 05. Vistas y decisiones

Por qué existe cada vista y cada botón, y qué endpoint usa.

## 1. Cobertura de la API

| # | Endpoint | Caso de uso | Dónde se usa |
|---|---|---|---|
| 1 | `GET /api/productos?pagina=&tamano=` | CU-01 | Productos |
| 2 | `GET /api/productos/activos` | CU-01 | Nuevo pedido (catálogo) |
| 3 | `GET /api/productos/{id}` | CU-01 | Editar producto (precarga) |
| 4 | `POST /api/productos` | CU-02 | Nuevo producto → "Registrar producto" |
| 5 | `PUT /api/productos/{id}` | CU-02 | Editar producto → "Guardar cambios" |
| 6 | `PATCH /api/productos/{id}/desactivar` | CU-03 | Productos → "Desactivar" |
| 7 | `PATCH /api/productos/{id}/activar` | CU-03 | Productos → "Activar" |
| 8 | `POST /api/pedidos` | CU-04 | Nuevo pedido → "Crear pedido" |
| 8b | `PUT /api/pedidos/{id}` | CU-10 | Editar pedido → "Guardar cambios" |
| 9 | `GET /api/pedidos?estado=&folio=&pagina=&tamano=` | CU-05 | Pedidos (listado y filtros) |
| 10 | `GET /api/pedidos/{id}` | CU-06 | Detalle del pedido |
| 11 | `POST /api/pedidos/{id}/confirmar` | CU-07 | Detalle → "Confirmar pedido" |
| 12 | `POST /api/pedidos/{id}/cancelar` | CU-08 | Detalle → "Cancelar pedido" |
| 13 | `POST /api/pedidos/{id}/completar` | CU-09 | Detalle → "Completar pedido" |

Las 14 operaciones de los dos controladores están cubiertas (las rutas de Swagger/OpenAPI no son de negocio).

## 2. Navegación

Tres destinos, en el orden en que el operador los usa: **Pedidos** (revisar), **Nuevo pedido** (capturar), **Productos** (administrar). "Nuevo pedido" está en la navegación además de en el listado porque es la tarea más frecuente.

La raíz `/` abre Pedidos: es lo primero que necesita ver el operador al iniciar el día.

## 3. Pedidos (`/pedidos`)

| Elemento | Decisión |
|---|---|
| Columnas: folio, creado, partidas, total, estado | Son las que pide RF-11 (folio, fecha, estado, total). Se agregó el número de partidas porque ayuda a reconocer un pedido sin abrirlo |
| Orden | Más reciente primero; lo define el backend (`Sort.by("id").descending()`) |
| Filtro de estado (lista) | Filtra al elegir: es un solo clic y siempre produce una consulta válida |
| Filtro de folio (texto) + "Buscar" | Filtra al enviar, no al teclear, para no hacer una petición por letra. Se convierte a mayúsculas porque los folios son `PED-…` |
| "Quitar filtros" | Solo aparece si hay filtros activos |
| Filtros en la URL | Recargar, compartir el enlace o usar "atrás" conserva la vista. Un estado inventado en la URL se ignora en vez de provocar un 400 |
| Folio como enlace | Abre el detalle. Las acciones **no** están en el listado: obligar a abrir el pedido hace que el operador vea partidas y efecto en el inventario antes de confirmar o cancelar |
| "Nuevo pedido" | Acción principal de la pantalla (botón primario) |
| Vacío sin filtros / con filtros | Mensajes distintos: "Aún no hay pedidos" invita a crear uno; "Ningún pedido coincide" sugiere cambiar el filtro |
| Paginación de 10 | Cabe en pantalla sin scroll en un monitor común |

## 4. Nuevo pedido (`/pedidos/nuevo`)

Dos columnas: catálogo (izquierda) y resumen (derecha, fija al hacer scroll).

| Elemento | Decisión |
|---|---|
| Solo productos activos | Usa `/productos/activos`; el backend rechaza inactivos con 404 |
| Búsqueda local sin acentos | La API entrega todos los activos en una lista; filtrar en el navegador es instantáneo. "cafe" encuentra "Café" |
| "Agregar" / "Agregar otra (n)" | Agregar un producto ya incluido suma cantidad en lugar de crear otra partida (el backend rechaza productos repetidos con 400). El texto indica cuántas hay |
| Selector − / + | Cantidades enteras ≥ 1 (supuesto S-03: venta por pieza) |
| Producto sin existencia se puede agregar | El backend permite crear el borrador; la existencia se valida al confirmar. Se marca "Sin existencia" para que el operador lo sepa |
| Aviso "Solo hay N en existencia" | Anticipa el 409 de confirmar (escenario B) sin bloquear la captura |
| Total **estimado** | Se calcula con el precio actual (en centavos para evitar errores de redondeo). Se indica que el importe definitivo lo calcula el servidor (RF-05) |
| "Crear pedido" + nota "Se guarda como borrador" | Deja claro que crear no descuenta inventario (S-01) |
| "Vaciar" | Empezar de nuevo sin quitar partida por partida |
| Al crear | Lleva al detalle del pedido nuevo, donde está el siguiente paso (confirmar) |
| Producto desactivado durante la captura | Si el servidor responde 404 se recarga el catálogo y el producto sale del resumen |

## 5. Detalle del pedido (`/pedidos/:id`)

| Elemento | Decisión |
|---|---|
| Folio + insignia de estado en el título | Lo primero que se lee |
| "Editar pedido" (solo en borrador) | Lleva a la edición de partidas (sección 5b) |
| Recorrido Borrador → Confirmado → Completado | Muestra dónde está el pedido y qué implica cada paso para el inventario. Si está cancelado, los pasos posteriores se marcan con una X y se agrega el bloque "Cancelado". La API no guarda historial, por eso no se afirma si un cancelado estuvo confirmado |
| Tabla de partidas con precio unitario | RF-06: el precio es el de la creación o la última edición del borrador y queda fijo al confirmar; se explica bajo la tabla |
| "Siguiente paso" con solo los botones válidos | Se calcula con la tabla de transiciones (`estado-pedido.rules.ts`), copia de `EstadoPedido.java`. No se muestran botones que darían 409 |
| Cada botón con una línea de ayuda | Dice qué hace con el inventario antes de pulsarlo |
| Confirmación en diálogo para toda acción | Las tres cambian datos de forma irreversible. El diálogo repite el efecto en inventario (p. ej. "Se repondrán al inventario…" solo si el pedido está confirmado) |
| "Cancelar pedido" con borde rojo | Acción destructiva, visualmente secundaria frente a confirmar/completar |
| Botones deshabilitados mientras hay una petición | Evita la doble cancelación por doble clic (el backend la rechazaría con 409, sección 4.2 del stack del backend) |
| Error 409 junto al pedido + recarga | Stock insuficiente, transición inválida o "modificado por otro usuario": se muestra el mensaje del servidor y se recarga el pedido para ver su estado real |
| Fechas de creación, actualización y cancelación | RF-13; con segundos para distinguir cambios cercanos |
| Estado final | "Es un estado final y no admite más cambios", en lugar de dejar el panel vacío |

### Completar pedido

`COMPLETADO` sigue en revisión en el backend ("Decidir si se conserva el estado COMPLETADO"). El frontend lo incluye porque la API actual lo expone (`POST /completar`) y está probado en el backend.

- El botón aparece solo en pedidos `CONFIRMADO`, como acción principal (es el avance natural).
- El diálogo aclara: "El inventario no cambia. Un pedido completado ya no se puede cancelar."
- Si el backend retira el estado, basta con quitar `completar` de `estado-pedido.rules.ts`; el botón desaparece solo.

## 5b. Editar pedido (`/pedidos/:id/editar`)

Requiere `PUT /api/pedidos/{id}`, agregado al backend junto con este cambio (CU-10, supuesto S-05 actualizado).

| Elemento | Decisión |
|---|---|
| Misma página que "Nuevo pedido" | Editar es volver a capturar la lista de partidas; reutilizar catálogo y resumen evita una segunda interfaz que aprender. Cambian título, regreso ("Volver al pedido"), texto del botón y nota |
| "Editar pedido" solo en el detalle de un borrador | Va en el encabezado, separado de "Siguiente paso", porque no cambia el estado del pedido |
| El carrito se arma con el precio actual del catálogo | El servidor recalcula **todas** las partidas al precio vigente (decisión de negocio); así el total estimado coincide con lo que se guardará. La descripción de la página lo dice |
| Productos que ya no están activos | Se quitan del resumen al cargar y se listan en un aviso: el backend rechazaría el pedido con 404 si se envían |
| Envía la lista completa | El `PUT` reemplaza las partidas; no hay cambios parciales que puedan quedar a medias |
| "Guardar cambios" → regresa al detalle | El aviso repite el verbo: "Cambios guardados en el pedido PED-000001." |
| Pedido que ya no es borrador | Si se abre la URL de edición de un pedido confirmado, completado o cancelado, se explica por qué no se puede editar y se ofrece "Ver pedido" |
| 409 al guardar (otro usuario lo confirmó) | Se muestra el mensaje del servidor y se recarga el pedido; la página pasa a "ya no se puede editar" |
| Folio y fecha de creación | No cambian; se actualiza "Última actualización" |

## 6. Productos (`/productos`)

| Elemento | Decisión |
|---|---|
| Activos e inactivos juntos | Es la vista de administración; los inactivos se ven atenuados con la insignia "Inactivo" |
| Existencia 0 = "Agotado" | Se distingue de un número cualquiera |
| "Editar" (enlace) | Abre el formulario precargado |
| "Desactivar" pide confirmación; "Activar" no | Desactivar saca el producto de la captura de pedidos; activar no tiene efectos adversos |
| Actualización local tras activar/desactivar | Cambia solo ese renglón en lugar de recargar la tabla. Si falla, se recarga para mostrar el estado real |
| Página en la URL (`?pagina=`) | Igual que en pedidos |

## 7. Formulario de producto (`/productos/nuevo`, `/productos/:id/editar`)

| Elemento | Decisión |
|---|---|
| Un formulario para alta y edición | Mismos campos y reglas que `ProductoRequest`; cambian título, texto del botón y precarga |
| Validación local con los límites del backend | Nombre obligatorio ≤ 120, descripción ≤ 500, precio > 0 con hasta 10 enteros y 2 decimales, existencia entera ≥ 0. Evita viajes inútiles; el servidor vuelve a validar |
| Errores del servidor en su campo | Los `errores` del ProblemDetail (`"nombre: …"`) se colocan bajo el campo correspondiente |
| Nombre duplicado (409) | Se muestra arriba del formulario con el mensaje del servidor |
| Contador de la descripción | Muestra cuánto falta para el límite |
| Ayuda en el precio | "Los pedidos ya creados conservan su precio" (RF-06) |
| Ayuda en la existencia | Confirmar pedidos la descuenta automáticamente; se edita solo para ajustes de inventario |
| "Cancelar" | Regresa sin guardar |
| Id inexistente o no numérico | Muestra "Este producto no existe" con enlace al catálogo |

## 8. Elementos globales

| Elemento | Decisión |
|---|---|
| Avisos (toasts) | Solo para confirmar que algo terminó bien ("Pedido PED-000004 confirmado.") o errores sin otro lugar donde mostrarse. El mismo verbo del botón aparece en el aviso |
| Errores de carga con "Reintentar" | Si el backend no responde se dice qué pasó ("Verifica que la API esté en ejecución en el puerto 8080") y cómo seguir |
| Página 404 | Rutas inexistentes llevan de regreso a Pedidos |
| Título de la pestaña | "<Página> \| OSIN" |
