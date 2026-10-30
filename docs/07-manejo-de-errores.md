# 07. Manejo de errores

## 1. Flujo

```
HttpErrorResponse ─▶ problemaInterceptor ─▶ aAppError() ─▶ AppError { tipo, message, status, detalles }
```

Después del interceptor ninguna capa conoce `HttpErrorResponse`. `message` es el `detail` del ProblemDetail (RFC 9457) y `detalles` la lista `errores` de las validaciones.

## 2. Tipos

| HTTP | `tipo` | Ejemplo del backend | Cómo se muestra |
|---|---|---|---|
| 0 | `SIN_CONEXION` | (sin respuesta) | "No se pudo conectar con el servidor. Verifica que la API esté en ejecución en el puerto 8080." + Reintentar |
| 400 | `VALIDACION` | `Los datos enviados no son válidos.` + `errores` | Errores con campo junto al campo; el resto en una alerta con lista |
| 404 | `NO_ENCONTRADO` | `Pedido no encontrado con id: 99` | Pantalla "Este pedido no existe" con enlace de regreso. Al crear pedido: alerta y recarga del catálogo |
| 409 | `CONFLICTO` | `Stock insuficiente para el producto 'Cafe 250 g': disponible 40, solicitado 41` | Alerta junto al pedido y recarga del pedido |
| 409 | `CONFLICTO` | `El registro fue modificado por otro usuario…` | Igual; la recarga muestra la versión vigente |
| 409 | `CONFLICTO` | `La operacion viola una restriccion de datos…` (nombre duplicado) | Alerta sobre el formulario de producto |
| 409 | `CONFLICTO` | `El pedido no se puede modificar porque esta en estado Confirmado` | En la edición: alerta y recarga; la página pasa a "ya no se puede editar" |
| 5xx | `SERVIDOR` | `Error interno del servidor. Contacte al administrador.` | Alerta o aviso |

## 3. Dónde se muestra cada error

| Situación | Lugar | Motivo |
|---|---|---|
| Falla al cargar una pantalla | Alerta en la pantalla con "Reintentar" | El usuario no tiene otra cosa que hacer ahí |
| Falla al guardar un formulario | Alerta arriba del formulario + errores por campo | Los datos capturados se conservan para corregirlos |
| Falla al cambiar estado de un pedido | Alerta arriba del recorrido | Queda visible junto a lo que falló; no se duplica en un aviso |
| Falla al activar/desactivar producto | Aviso (toast) + recarga de la tabla | No hay otro lugar natural en la tabla |

## 4. Errores que se evitan antes de enviar

| Error del backend | Cómo se evita |
|---|---|
| 400 por lista vacía o producto repetido | El carrito no permite partidas repetidas; "Crear pedido" no aparece con el carrito vacío |
| 400 por cantidad ≤ 0 | El selector solo acepta enteros ≥ 1 |
| 400 por `estado=INVENTADO` | El estado de la URL se valida contra la lista; uno inválido se ignora |
| 400 por paginación fuera de rango | `normalizarSolicitud()` limita página ≥ 0 y tamaño 1..100 |
| 409 por transición inválida | Solo se dibujan botones válidos |
| 409 por doble clic | Los botones se deshabilitan mientras hay una petición |
