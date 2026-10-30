# 06. Principios y patrones de diseño

## 1. Principios SOLID

| Principio | Aplicación | Archivo |
|---|---|---|
| Responsabilidad única | Un caso de uso por acción; los organismos solo muestran; los stores solo guardan estado; los mappers solo traducen | `core/application/use-cases/*`, `features/*/state/*` |
| Abierto/cerrado | Agregar o quitar una transición de estado es editar una tabla; los botones, el recorrido y los casos de uso no cambian | `estado-pedido.rules.ts` |
| Sustitución de Liskov | Cualquier implementación de `PedidoRepository` (HTTP, doble de pruebas) funciona igual para los casos de uso | `core/domain/ports/*`, `*.spec.ts` |
| Segregación de interfaces | Dos puertos pequeños (productos, pedidos) en lugar de un "ApiService" con todo | `core/domain/ports/*` |
| Inversión de dependencias | Casos de uso dependen de abstracciones; `providers.ts` decide la implementación | `core/providers.ts` |

Otros principios: **DRY** (límites de validación definidos una vez en `LIMITES_PRODUCTO`), **KISS** (sin librería de estado; signals bastan), **YAGNI** (no se implementó autenticación ni edición de pedidos porque el backend no la tiene, supuestos S-05 y alcance).

## 2. Patrones

| Patrón | Dónde | Para qué |
|---|---|---|
| **Repository** | `ProductoRepository`, `PedidoRepository` | Ocultar de dónde vienen los datos |
| **Ports & Adapters** (hexagonal) | Puertos en `domain/ports`, adaptadores en `infrastructure/http/adapters` | Desacoplar la aplicación de HTTP |
| **Data Mapper / DTO** | `infrastructure/http/dto` + `mappers` | El JSON de Spring no se filtra a la interfaz |
| **Command** (caso de uso) | `*UseCase.execute()` | Cada intención del operador es un objeto con una sola operación |
| **Strategy por tabla** | `ACCIONES_POR_ESTADO`, `DEFINICION_ACCION`, `casos` en `PedidoDetalleStore` | Elegir comportamiento según estado o acción sin cadenas de `if` |
| **Facade / Store** | `features/*/state/*.store.ts` | La página ve una API simple (`cargar`, `ejecutar`, `pedido()`) en lugar de varios casos de uso |
| **Observer** | Signals y `computed`; RxJS en HTTP | La vista se actualiza sola cuando cambia el estado |
| **Chain of Responsibility** | `problemaInterceptor` | Todo error HTTP pasa por un solo punto que lo convierte en `AppError` |
| **Container / Presentational** | Páginas (contenedores) vs organismos (presentacionales) | Organismos reutilizables y fáciles de probar |
| **Composition Root** | `core/providers.ts`, `app.config.ts` | Un solo lugar para el cableado |
| **Service as dialog** | `DialogoService.confirmar()` devuelve `Promise<boolean>` | Pedir confirmación desde cualquier página sin poner un modal en cada plantilla |
| **Inmutabilidad** | `carrito.ts` devuelve copias; modelos `readonly` | Cambios predecibles con signals |

## 3. Decisiones que respetan la autoridad del backend

El backend es la fuente de verdad. El frontend repite algunas reglas solo para dar mejor experiencia:

| Regla repetida en el front | Por qué | Si diverge |
|---|---|---|
| Tabla de transiciones | Mostrar solo botones válidos | El servidor responde 409 y la página recarga el pedido |
| Validaciones de producto y pedido | Mostrar el error al instante | El servidor responde 400 y sus mensajes se muestran |
| Total estimado del carrito | Referencia mientras se captura | El total que se muestra después es siempre el del servidor |

El frontend **nunca** envía precios ni totales (`PedidoRequest` solo lleva id y cantidad).
