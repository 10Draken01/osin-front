# 02. Arquitectura

El frontend sigue **arquitectura limpia** (Clean Architecture) en la lógica y **Atomic Design** en la interfaz. Este documento cubre la primera; el [03](03-atomic-design.md) la segunda.

## 1. Capas

```
┌──────────────────────────────────────────────────────────────┐
│ Presentación   features/*/pages, features/*/state, shared/ui │  Angular, plantillas, signals
├──────────────────────────────────────────────────────────────┤
│ Aplicación     core/application/use-cases                    │  Casos de uso CU-01..CU-09
├──────────────────────────────────────────────────────────────┤
│ Dominio        core/domain (models, rules, ports, errors)    │  TypeScript puro
├──────────────────────────────────────────────────────────────┤
│ Infraestructura core/infrastructure (http, interceptors)      │  HttpClient, DTO, mappers
└──────────────────────────────────────────────────────────────┘
```

| Capa | Contiene | No contiene |
|---|---|---|
| Dominio | Modelos (`Producto`, `Pedido`), reglas puras (tabla de transiciones de estado, carrito), puertos (`ProductoRepository`, `PedidoRepository`), `AppError` | Angular, HTTP, JSON de la API |
| Aplicación | Un caso de uso por acción del operador. Validan y normalizan antes de llamar al puerto | Plantillas, rutas, `HttpClient` |
| Infraestructura | Adaptadores HTTP que implementan los puertos, DTO idénticos a los records de Java, mappers DTO ↔ dominio, interceptor de errores | Reglas de negocio |
| Presentación | Páginas (contenedores), stores por pantalla, componentes de Atomic Design | Llamadas HTTP directas, reglas de transición |

## 2. Regla de dependencias

Las dependencias solo apuntan hacia el dominio:

```
Presentación ──▶ Aplicación ──▶ Dominio ◀── Infraestructura
```

- El dominio no importa nada de las demás capas.
- La infraestructura **implementa** los puertos del dominio; la aplicación los **usa**. Ninguna de las dos conoce a la otra.
- `core/providers.ts` es la raíz de composición: el único archivo que une puerto y adaptador.

```ts
{ provide: PedidoRepository, useClass: PedidoHttpRepository }
```

Consecuencia práctica: para probar un caso de uso basta un doble del puerto (ver `*.use-case.spec.ts`); para cambiar la API (otra URL, otro formato, datos simulados) se cambia un adaptador sin tocar casos de uso ni pantallas.

## 3. Por qué los puertos son clases abstractas

En TypeScript una `interface` desaparece al compilar y no puede ser token de inyección. Una `abstract class` sin implementación cumple el mismo papel de contrato y además sirve como token en `inject(PedidoRepository)`.

## 4. Modelos de dominio vs. DTO

| DTO (infraestructura) | Modelo (dominio) | Motivo de la diferencia |
|---|---|---|
| `PedidoResponseDto.productos` | `Pedido.partidas` | "Partida" es el término del negocio en los requerimientos |
| `estado: string` | `estado: EstadoPedido` | Unión cerrada; el mapper falla si llega un estado desconocido |
| Fechas como texto `LocalDateTime` | `Date` | El mapper recorta microsegundos e interpreta la hora como local (el backend no envía zona) |
| `PaginaDto` (`content` + `page`) | `Pagina<T>` | La interfaz no depende del formato de Spring Data |
| `ProductoDatosDto { id, cantidad }` | `NuevaPartida { idProducto, cantidad }` | Nombre explícito en el dominio; el mapper lo traduce al cuerpo que espera `PedidoRequest` |

## 5. Flujo de una acción: confirmar un pedido

```
Operador pulsa "Confirmar pedido"
  └─ AccionesPedidoComponent (organismo)  emite ejecutar('confirmar')
      └─ PedidoDetallePage (página)        pide confirmación con DialogoService
          └─ PedidoDetalleStore            marca procesando = 'confirmar'
              └─ ConfirmarPedidoUseCase    valida la transición con estado-pedido.rules
                  └─ PedidoRepository      (puerto)
                      └─ PedidoHttpRepository  POST /api/pedidos/{id}/confirmar
                          └─ problemaInterceptor  409 → AppError('CONFLICTO', detail)
              ◀─ store guarda el pedido o el error; si fue 409 recarga el pedido
          ◀─ página muestra aviso de éxito, o la alerta del error junto al pedido
```

## 6. Estado de la interfaz

Cada página provee su propio store (`providers: [PedidoDetalleStore]`):

- El estado vive lo mismo que la pantalla; al salir se destruye y no quedan datos viejos.
- Los stores exponen `signal`s de solo lectura para la plantilla (`pedido`, `cargando`, `error`, `procesando`).
- Las peticiones de listados pasan por un `Subject` + `switchMap`: si el usuario cambia de página o filtro rápido, la respuesta anterior se descarta y no pisa a la nueva.
- Los filtros y la página del listado viven en la URL (`?estado=&folio=&pagina=`), no en el store. Así se pueden compartir, recargar y usar atrás/adelante del navegador.

## 7. Rutas

| Ruta | Página | Carga |
|---|---|---|
| `/` | Redirige a `/pedidos` | — |
| `/pedidos` | Listado de pedidos | Diferida |
| `/pedidos/nuevo` | Captura de pedido | Diferida |
| `/pedidos/:id/editar` (solo números) | Edición de un borrador (misma página que la captura) | Diferida |
| `/pedidos/:id` (solo números) | Detalle del pedido | Diferida |
| `/productos` | Catálogo | Diferida |
| `/productos/nuevo` | Alta de producto | Diferida |
| `/productos/:id/editar` | Edición de producto | Diferida |
| `**` | Página no encontrada | Diferida |

Todas las páginas se cargan bajo demanda (`loadComponent`/`loadChildren`). El layout se carga al inicio porque envuelve a todas.
