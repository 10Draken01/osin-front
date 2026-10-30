# OSIN Front: pedidos e inventario

Aplicación web en Angular 20 para operar la tienda: catálogo de productos, captura y edición de pedidos en borrador, listado con filtros, detalle y cambios de estado (confirmar, cancelar y completar). Consume la API REST `osinapi` y cubre sus 14 operaciones.

## IMPORTANTE MIRAR EL VIDEO PARA ENTENDER MEJOR
```
https://youtu.be/f1pAgcBTV0k
```

## Contenido

1. [Documentación](#documentación)
2. [Cómo correr el proyecto](#cómo-correr-el-proyecto) ← **empieza aquí**
3. [Scripts disponibles](#scripts-disponibles)
4. [Pruebas](#pruebas)
5. [Compilación de producción](#compilación-de-producción)
6. [Solución de problemas](#solución-de-problemas)
7. [Estructura](#estructura)

## Documentación

| # | Documento | Contenido |
|---|---|---|
| 1 | [Stack tecnológico](docs/01-stack-tecnologico.md) | Versiones, dependencias y por qué se agregaron Tailwind CSS y Fontsource |
| 2 | [Arquitectura](docs/02-arquitectura.md) | Arquitectura limpia, capas, regla de dependencias, rutas y flujo de una petición |
| 3 | [Atomic Design](docs/03-atomic-design.md) | Inventario de átomos, moléculas, organismos, plantillas y páginas |
| 4 | [Sistema de diseño](docs/04-sistema-de-diseno.md) | Colores, tipografía, accesibilidad, adaptación a pantallas |
| 5 | [Vistas y decisiones](docs/05-vistas-y-decisiones.md) | Cada vista y cada botón: por qué existe y qué endpoint usa |
| 6 | [Principios y patrones](docs/06-principios-y-patrones.md) | SOLID y patrones de diseño aplicados, con su archivo |
| 7 | [Errores](docs/07-manejo-de-errores.md) | Cómo se traduce cada error de la API a la interfaz |
| 8 | [Pruebas](docs/08-pruebas.md) | Pruebas automáticas y recorrido manual de los escenarios |

---

## Cómo correr el proyecto

### Paso 0. Requisitos

| Herramienta | Versión | Comprobar con | Debe mostrar |
|---|---|---|---|
| Node.js | `20.19+`, `22.12+` o `24` (requisito de Angular 20) | `node -v` | p. ej. `v22.12.0` |
| npm | La que viene con Node | `npm -v` | Una versión, p. ej. `10.9.0` |
| Navegador | Chrome, Edge o Firefox recientes | — | — |
| Chrome o Chromium | Solo para correr las pruebas | — | — |

No hace falta instalar Angular CLI de forma global: el proyecto usa la versión incluida en `node_modules` a través de los scripts de npm.

> Si `node -v` muestra una versión menor (por ejemplo `v18` o `v20.10`), instala una versión compatible desde [nodejs.org](https://nodejs.org) o con `nvm install 22` y `nvm use 22`.

### Paso 1. La API debe estar corriendo

El frontend no tiene datos propios: todo lo obtiene de la API.

| Qué | Valor esperado |
|---|---|
| URL de la API | `http://localhost:8080/api` |
| Orígenes permitidos por CORS en la API | Debe incluir `http://localhost:4200` (es el valor por defecto de la API) |

Compruébalo abriendo en el navegador `http://localhost:8080/api/productos/activos`: debe mostrar un JSON con productos. Si no responde, levanta la API siguiendo su propio README antes de continuar.

### Paso 2. Instalar dependencias (solo la primera vez)

Desde la carpeta del proyecto (la que contiene `package.json`):

```bash
cd osin-front
npm install
```

Tarda uno o dos minutos y crea la carpeta `node_modules`. Al final debe decir `added N packages` sin errores. Repite `npm install` solo si cambia `package.json` o si borras `node_modules`.

> Usa `npm ci` en lugar de `npm install` si quieres instalar exactamente las versiones de `package-lock.json` (recomendado en CI o en una máquina limpia).

### Paso 3. Configurar la URL de la API (solo si no es la de por defecto)

La URL está en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
```

Cámbiala solo si la API corre en otra máquina o en otro puerto (por ejemplo `http://localhost:8081/api`). El frontend llama directo a la API, sin proxy; por eso la API debe permitir el origen del frontend en CORS.

### Paso 4. Iniciar el servidor de desarrollo

```bash
npm start
```

La primera compilación tarda unos segundos. Está listo cuando la terminal muestra:

```
➜  Local:   http://localhost:4200/
```

Deja esa terminal abierta: cerrarla o pulsar `Ctrl + C` detiene el frontend. Mientras corre, cualquier cambio en el código recarga el navegador automáticamente.

Para usar otro puerto: `npx ng serve --port 4300` (y agrega `http://localhost:4300` a los orígenes CORS de la API).

### Paso 5. Comprobar que funciona

Abre `http://localhost:4200` y revisa:

| Pantalla | Qué debe verse |
|---|---|
| Inicio (`/pedidos`) | Listado de pedidos con folio, fecha, partidas, total y estado. Con los datos de ejemplo: `PED-000001` a `PED-000003` |
| Filtros | Elegir *Estado: Borrador* deja solo los borradores; la URL cambia a `?estado=BORRADOR` |
| Detalle (clic en un folio) | Recorrido Borrador → Confirmado → Completado, partidas, total y los botones del siguiente paso |
| Productos (menú lateral) | Catálogo con precio, existencia y disponibilidad |
| Nuevo pedido (menú lateral) | Catálogo a la izquierda y resumen a la derecha |

Si en lugar de datos aparece *"No se pudo conectar con el servidor"*, la API no está corriendo o la URL del paso 3 no es correcta.

### Resumen rápido (cuando ya está instalado)

```bash
cd osin-front
npm start
# Abrir http://localhost:4200 (con la API corriendo en http://localhost:8080)
```

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` con recarga automática |
| `npm run build` | Compilación de producción en `dist/osin-front/browser` |
| `npm run watch` | Compila en modo desarrollo cada vez que guardas, sin servidor |
| `npm test` | Pruebas unitarias en Chrome; se vuelven a ejecutar al guardar |
| `npm run test:ci` | Pruebas una sola vez, Chrome sin ventana, con reporte de cobertura en `coverage/` |

---

## Pruebas

```bash
npm test          # abre Chrome; útil mientras desarrollas
npm run test:ci   # una sola vez, sin ventana
```

No necesitan la API: los casos de uso y los adaptadores HTTP se prueban con dobles y con `HttpTestingController`. El resultado esperado es `TOTAL: 59 SUCCESS`.

Requieren Chrome o Chromium instalado. Si Karma no lo encuentra, indica su ruta:

```bash
# Linux / WSL / macOS
CHROME_BIN=/ruta/a/chrome npm run test:ci
```

```powershell
# PowerShell
$env:CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"; npm run test:ci
```

Qué cubre cada prueba y el recorrido manual de los escenarios: [docs/08-pruebas.md](docs/08-pruebas.md).

---

## Compilación de producción

```bash
npm run build
```

Genera archivos estáticos en `dist/osin-front/browser` (`index.html`, JavaScript y CSS). Se pueden publicar en cualquier servidor web estático (Nginx, Apache, IIS, etc.). Dos detalles:

1. **Rutas del navegador.** La aplicación usa rutas como `/pedidos/4`. El servidor debe responder `index.html` para cualquier ruta que no sea un archivo (en Nginx: `try_files $uri $uri/ /index.html;`). Si no, recargar la página en una ruta interna da 404.
2. **URL de la API.** Antes de compilar, ajusta `apiBaseUrl` en `src/environments/environment.ts` a la URL pública de la API, y agrega el dominio del frontend a los orígenes CORS de la API.

La compilación no necesita Internet: la tipografía se incluye desde `node_modules` (ver [docs/01](docs/01-stack-tecnologico.md)).

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `npm install` muestra *"Unsupported engine"* o Angular dice *"Node.js version ... is not supported"* | Versión de Node incompatible | Instala Node 20.19+, 22.12+ o 24 y vuelve a ejecutar `npm install` |
| `npm install` falla por red o certificado | Sin Internet o proxy corporativo | Revisa la conexión; con proxy: `npm config set proxy http://usuario:clave@proxy:puerto` |
| `'ng' no se reconoce como un comando` | Se ejecutó `ng` directamente | Usa `npm start` o `npx ng ...`; no hace falta instalar Angular CLI global |
| `npm start` dice *"Port 4200 is already in use"* | Otro `ng serve` abierto | Cierra la otra terminal o usa `npx ng serve --port 4300` (y agrega ese origen al CORS de la API) |
| La página muestra *"No se pudo conectar con el servidor"* | La API no está corriendo o la URL es otra | Abre `http://localhost:8080/api/productos/activos`; si no responde, levanta la API; si responde en otra URL, corrige `environment.ts` |
| La consola del navegador (F12) muestra un error de **CORS** | El origen del frontend no está permitido en la API | Agrega `http://localhost:4200` (o el puerto que uses) a los orígenes CORS de la API y reiníciala |
| Las listas aparecen vacías | La base de datos de la API no tiene datos | Carga los datos de ejemplo de la API o crea productos desde *Productos → Nuevo producto* |
| *"Stock insuficiente…"* al confirmar | Comportamiento esperado: alguna partida supera la existencia | Ajusta la existencia en *Productos* o edita el borrador |
| `npm test` dice *"No binary for Chrome browser"* | Chrome no está instalado o no está en la ruta por defecto | Instala Chrome o define `CHROME_BIN` (ver [Pruebas](#pruebas)) |
| Pantalla en blanco después de `npm run build` en un servidor | Falta la regla de rutas o la carpeta publicada no es `browser` | Publica `dist/osin-front/browser` y configura la redirección a `index.html` |
| Errores extraños después de cambiar de rama o de versión | Caché o dependencias desactualizadas | Borra `node_modules` y `.angular`, y ejecuta `npm install` |

---

## Estructura

```
src/app
├── core/                 Lógica sin interfaz (arquitectura limpia)
│   ├── domain/           Modelos, reglas, puertos y errores. Sin Angular ni HTTP
│   ├── application/      Casos de uso (CU-01 a CU-10)
│   ├── infrastructure/   Adaptadores HTTP, DTO, mappers, interceptor
│   └── providers.ts      Enlaza cada puerto con su adaptador
├── shared/ui/            Atomic Design genérico: atoms, molecules, organisms, templates, services
└── features/             Una carpeta por funcionalidad
    ├── pedidos/          pages, state (stores), ui (moléculas y organismos de pedidos)
    ├── productos/
    └── sistema/          Página 404
src/environments/         URL de la API
src/testing/              Datos de prueba compartidos por las pruebas
docs/                     Documentación de decisiones
```
