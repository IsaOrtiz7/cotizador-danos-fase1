/**
 * Strategy Pattern - Diferentes algoritmos de cálculo
 * Intercambiables en runtime (Factory + Strategy)
 */

import { TipoEstrategia } from '../../domain/enums';
import { Monto } from '../../domain/value-objects/Monto';
import { Daño } from '../../domain/entities/Daño';

export interface IEstrategiaCalculo {
  readonly nombre: string;
  calcular(daños: Daño[], montoBase: Monto): Monto;
  getDescripcion(): string;
}

export class EstrategiaEstandar implements IEstrategiaCalculo {
  readonly nombre = 'Estándar';
  calcular(daños: Daño[], montoBase: Monto): Monto {
    const factor = daños.reduce((acc, d) => acc + d.calcularFactorRiesgo(), 1.0);
    return Monto.create(Math.round(montoBase.valor * factor * 0.95));
  }
  getDescripcion(): string { return 'Cálculo estándar con descuento del 5%'; }
}

export class EstrategiaPremium implements IEstrategiaCalculo {
  readonly nombre = 'Premium';
  calcular(daños: Daño[], montoBase: Monto): Monto {
    const factor = daños.reduce((acc, d) => acc + d.calcularFactorRiesgo(), 1.3);
    return Monto.create(Math.round(montoBase.valor * factor * 1.15));
  }
  getDescripcion(): string { return 'Cálculo premium con cobertura ampliada +15%'; }
}

export class EstrategiaRapida implements IEstrategiaCalculo {
  readonly nombre = 'Rápida';
  calcular(daños: Daño[], montoBase: Monto): Monto {
    const factor = daños.reduce((acc, d) => acc + d.calcularFactorRiesgo() * 0.8, 0.9);
    return Monto.create(Math.round(montoBase.valor * factor));
  }
  getDescripcion(): string { return 'Cálculo rápido para emergencias (menor precisión)'; }
}

// Factory para estrategias (Factory Pattern)
export class EstrategiaFactory {
  static crear(tipo: TipoEstrategia): IEstrategiaCalculo {
    switch (tipo) {
      case TipoEstrategia.ESTANDAR: return new EstrategiaEstandar();
      case TipoEstrategia.PREMIUM: return new EstrategiaPremium();
      case TipoEstrategia.RAPIDA: return new EstrategiaRapida();
      default: return new EstrategiaEstandar();
    }
  }
}