import { aFecha } from './pedido.mapper';

describe('aFecha (LocalDateTime → Date)', () => {
  it('interpreta la fecha como hora local y recorta microsegundos', () => {
    const f = aFecha('2026-10-30T07:41:12.123456')!;
    expect([f.getFullYear(), f.getMonth(), f.getDate(), f.getHours(), f.getMinutes()]).toEqual([
      2026, 9, 30, 7, 41,
    ]);
    expect(f.getMilliseconds()).toBe(123);
  });

  it('null o inválida devuelve null', () => {
    expect(aFecha(null)).toBeNull();
    expect(aFecha('no-es-fecha')).toBeNull();
  });
});
