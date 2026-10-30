import { EnvironmentProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { ProductoRepository } from './domain/ports/producto.repository';
import { PedidoRepository } from './domain/ports/pedido.repository';
import { ProductoHttpRepository } from './infrastructure/http/adapters/producto-http.repository';
import { PedidoHttpRepository } from './infrastructure/http/adapters/pedido-http.repository';

/**
 * Raíz de composición: único lugar donde se decide qué implementación usa cada puerto.
 * Para cambiar a datos simulados o a otra API basta con cambiar useClass.
 */
export const REPOSITORIOS: Provider[] = [
  { provide: ProductoRepository, useClass: ProductoHttpRepository },
  { provide: PedidoRepository, useClass: PedidoHttpRepository },
];

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders(REPOSITORIOS);
}
