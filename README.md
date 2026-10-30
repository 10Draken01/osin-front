# OSIN Front: pedidos e inventario

Frontend Angular que consume la API `osinapi` (Spring Boot). Cubre las 14 operaciones de la API: catálogo de productos, captura y edición de pedidos en borrador, listado con filtros, detalle y cambios de estado (confirmar, cancelar y completar).

## Documentación

| # | Documento | Contenido |
|---|---|---|
| 1 | [Stack tecnológico](docs/01-stack-tecnologico.md) | Versiones, dependencias y por qué se agregó Tailwind CSS |
| 2 | [Arquitectura](docs/02-arquitectura.md) | Arquitectura limpia, capas, regla de dependencias y flujo de una petición |
| 3 | [Atomic Design](docs/03-atomic-design.md) | Inventario de átomos, moléculas, organismos, plantillas y páginas |
| 4 | [Sistema de diseño](docs/04-sistema-de-diseno.md) | Colores, tipografía, accesibilidad |
| 5 | [Vistas y decisiones](docs/05-vistas-y-decisiones.md) | Cada vista y cada botón: por qué existe y qué endpoint usa |
| 6 | [Principios y patrones](docs/06-principios-y-patrones.md) | SOLID y patrones de diseño aplicados, con su archivo |
| 7 | [Errores](docs/07-manejo-de-errores.md) | Cómo se traduce cada ProblemDetail a la interfaz |
| 8 | [Pruebas](docs/08-pruebas.md) | Pruebas automáticas y recorrido manual de los escenarios A–F |

## Requisitos

- Node.js `^20.19.0`, `^22.12.0` o `^24` (requisito de Angular 20; cumple el "Node.js 20+" del backend).
- Backend en `http://localhost:8080` con `CORS_ORIGENES=http://localhost:4200` (valor por defecto).

## Uso

```bash
npm install
npm start            # http://localhost:4200
npm run build        # producción en dist/osin-front
npm test             # pruebas en Chrome con recarga
npm run test:ci      # pruebas una vez, Chrome sin interfaz, con cobertura
```
o simplemente usar 
```bash 
ng server
``` 
despues de instalar dependencias y solo para dev.


`npm run test:ci` necesita Chrome o Chromium. Si no está en la ruta por defecto: `CHROME_BIN=/ruta/a/chrome npm run test:ci`.

La URL de la API está en `src/environments/environment.ts`.

## Estructura

```
src/app
├── core/                 Lógica sin interfaz (arquitectura limpia)
│   ├── domain/           Modelos, reglas, puertos y errores. Sin Angular ni HTTP
│   ├── application/      Casos de uso (CU-01 a CU-09)
│   ├── infrastructure/   Adaptadores HTTP, DTO, mappers, interceptor
│   └── providers.ts      Enlaza cada puerto con su adaptador
├── shared/ui/            Atomic Design genérico: atoms, molecules, organisms, templates, services
└── features/             Una carpeta por funcionalidad
    ├── pedidos/          pages, state (stores), ui (moléculas y organismos de pedidos)
    ├── productos/
    └── sistema/          Página 404
```
