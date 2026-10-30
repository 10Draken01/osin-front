import {
  accionesPermitidas,
  efectoEnInventario,
  esEstadoFinal,
  puedeEjecutar,
} from './estado-pedido.rules';

describe('Reglas de estado del pedido (espejo de EstadoPedido.java)', () => {
  it('BORRADOR puede confirmarse o cancelarse, pero no completarse', () => {
    expect(accionesPermitidas('BORRADOR')).toEqual(['confirmar', 'cancelar']);
    expect(puedeEjecutar('BORRADOR', 'completar')).toBeFalse();
  });

  it('CONFIRMADO puede completarse o cancelarse, pero no confirmarse otra vez', () => {
    expect(accionesPermitidas('CONFIRMADO')).toEqual(['completar', 'cancelar']);
    expect(puedeEjecutar('CONFIRMADO', 'confirmar')).toBeFalse();
  });

  it('COMPLETADO y CANCELADO son estados finales', () => {
    expect(esEstadoFinal('COMPLETADO')).toBeTrue();
    expect(esEstadoFinal('CANCELADO')).toBeTrue();
    expect(esEstadoFinal('BORRADOR')).toBeFalse();
  });

  it('describe la reposición de inventario solo al cancelar un pedido confirmado', () => {
    expect(efectoEnInventario('CONFIRMADO', 'cancelar')).toContain('repondrán');
    expect(efectoEnInventario('BORRADOR', 'cancelar')).toContain('no cambia');
    expect(efectoEnInventario('CONFIRMADO', 'completar')).toContain('no cambia');
  });
});
