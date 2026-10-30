// URL base de la API. El backend permite CORS desde http://localhost:4200 (CORS_ORIGENES),
// por eso el front llama directo al puerto 8080 sin proxy.
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
