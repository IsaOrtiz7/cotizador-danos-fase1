/**
 * Value Object - Monto (inmutable, validado)
 * Demuestra Value Objects de DDD + Utility Types + inmutabilidad
 */

import { Readonly } from '../../types/utility-types'; // we'll create this

export class Monto {
  private readonly _valor: number;
  private readonly _moneda: 'COP' | 'USD';

  private constructor(valor: number, moneda: 'COP' | 'USD' = 'COP') {
    if (valor < 0) throw new Error('El monto no puede ser negativo');
    this._valor = valor;
    this._moneda = moneda;
  }

  static create(valor: number, moneda: 'COP' | 'USD' = 'COP'): Monto {
    return new Monto(valor, moneda);
  }

  get valor(): number { return this._valor; }
  get moneda(): string { return this._moneda; }

  toString(): string {
    return `${this._moneda} $${this._valor.toLocaleString()}`;
  }

  // Utility type example: Partial for updates
  static fromPartial(partial: Partial<{valor: number; moneda: 'COP'|'USD'}>): Monto {
    return new Monto(partial.valor ?? 0, partial.moneda ?? 'COP');
  }
}