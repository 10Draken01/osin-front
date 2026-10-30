import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { provideCore } from '@core/providers';
import { problemaInterceptor } from '@core/infrastructure/interceptors/problema.interceptor';
import { TituloOsinStrategy } from './titulo.strategy';

// Moneda MXN, fechas y separadores en español de México
registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Parámetros de ruta y query params llegan como input() a las páginas
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([problemaInterceptor])),
    provideCore(),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: TitleStrategy, useClass: TituloOsinStrategy },
  ],
};
