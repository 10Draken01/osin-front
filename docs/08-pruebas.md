# 08. Pruebas

## 1. Ejecutar

```bash
npm test          # Chrome con recarga al guardar
npm run test:ci   # una vez, Chrome sin interfaz, con cobertura en coverage/
```

59 pruebas (Jasmine + Karma). No necesitan el backend: las capas se prueban con dobles de los puertos o con `HttpTestingController`.

## 2. Qué se prueba

| Archivo | Capa | Qué verifica |
|---|---|---|
| `estado-pedido.rules.spec.ts` | Dominio | Tabla de transiciones idéntica a `EstadoPedido.java`; efecto en inventario por acción |
| `carrito.spec.ts` | Dominio | Sin partidas repetidas, inmutabilidad, cantidades enteras ≥ 1, total del escenario A (99.00), suma en centavos, detección del escenario B |
| `guardar-producto.use-case.spec.ts` | Aplicación | Registrar vs actualizar, limpieza de datos, mismas validaciones que `ProductoRequest`, no llama a la API con datos inválidos |
| `cambiar-disponibilidad-producto.use-case.spec.ts` | Aplicación | Elige activar o desactivar según el estado |
| `registrar-pedido.use-case.spec.ts` | Aplicación | Envía solo id y cantidad; rechaza vacío, repetidos y cantidades inválidas |
| `listar-pedidos.use-case.spec.ts` | Aplicación | Normaliza folio y paginación |
| `actualizar-pedido.use-case.spec.ts` | Aplicación | CU-10: envía las partidas de un borrador; 409 local en cualquier otro estado; no deja el pedido vacío |
| `cambios-de-estado.use-case.spec.ts` | Aplicación | Confirmar, cancelar y completar; escenarios D y E; completar un borrador no llama a la API |
| `pedido-http.repository.spec.ts` | Infraestructura | URL, método, parámetros y cuerpo de cada endpoint de pedidos; formato `content` + `page`; 409 → `AppError` |
| `producto-http.repository.spec.ts` | Infraestructura | Los 7 endpoints de productos |
| `problema.mapper.spec.ts` | Infraestructura | ProblemDetail 0/400/404/409/500 → `AppError` |
| `pedido.mapper.spec.ts` | Infraestructura | `LocalDateTime` con microsegundos → `Date` local |
| `pedido-formulario.store.spec.ts` | Presentación | Crear vs editar; el carrito de edición toma el precio vigente y quita productos inactivos; guardar usa PUT; un 409 recarga el pedido |
| `pedido-detalle.store.spec.ts` | Presentación | Completar actualiza la vista; un 409 guarda el error y recarga el pedido |

## 3. Recorrido manual (escenarios del backend)

Con Oracle cargado con `02_data.sql`, el backend en 8080 y `npm start`:

| ID | Pasos en la interfaz | Resultado esperado |
|---|---|---|
| A | Nuevo pedido → Leche 1 L ×2 y Aceite 1 L ×1 → Crear pedido | Detalle en Borrador; subtotales 54.00 y 45.00; total 99.00. En Productos, existencias sin cambio |
| B | Nuevo pedido → Café 250 g ×41 (aviso "Solo hay 40") → Crear → Confirmar pedido | Alerta "Stock insuficiente… disponible 40, solicitado 41"; el pedido sigue en Borrador; Café sigue en 40 |
| C | Abrir el pedido de A → Confirmar pedido | Estado Confirmado; en Productos, Leche 118 y Aceite 59 |
| D | Mismo pedido → Cancelar pedido | Cancelado; Leche 120 y Aceite 60. El botón Cancelar ya no aparece (no hay segunda cancelación) |
| E | Abrir PED-000003 (cancelado) | Sin botones; "Es un estado final". Desde la API un intento devolvería 409 |
| F | Detener y reiniciar backend y Oracle; recargar el navegador | Mismos pedidos, estados y existencias |
| Completar | Abrir un pedido Confirmado → Completar pedido | Estado Completado; existencias sin cambio; ya no aparece Cancelar |
| Editar | Abrir PED-000001 (borrador) → Editar pedido → cambiar cantidades y agregar un producto → Guardar cambios | Mismo folio, partidas nuevas con precio vigente, existencias sin cambio. En un pedido confirmado no aparece "Editar pedido" |
