/**
 * Discriminated Union para tipos de daño
 * + Interfaces vs Type Aliases
 * + Polimorfismo de OOP + FP
 */

import { TipoDaño, NivelSeveridad } from '../enums';
import { Monto } from '../value-objects/Monto';

// Interface para el contrato común (OOP)
export interface IDaño {
  readonly id: string;
  readonly tipo: TipoDaño;
  readonly descripcion: string;
  readonly severidad: NivelSeveridad;
  calcularFactorRiesgo(): number;
  toString(): string;
}

// Type Alias para Discriminated Union (mejor para narrowing)
export type Daño =
  | DañoVehiculo
  | DañoHogar
  | DañoSalud
  | DañoEmpresarial;

// Implementaciones concretas (Factory + Strategy interno)

export class DañoVehiculo implements IDaño {
  readonly tipo = TipoDaño.VEHICULO;
  constructor(
    public readonly id: string,
    public readonly descripcion: string,
    public readonly severidad: NivelSeveridad,
    public readonly placa: string,
    public readonly modelo: string,
    public readonly año: number
  ) {}

  calcularFactorRiesgo(): number {
    const severidadFactor = this.getSeveridadFactor();
    const antiguedad = Math.max(0, 2026 - this.año);
    return (severidadFactor * 1.2) + (antiguedad * 0.05);
  }

  private getSeveridadFactor(): number {
    switch (this.severidad) {
      case NivelSeveridad.BAJO: return 1.0;
      case NivelSeveridad.MEDIO: return 1.5;
      case NivelSeveridad.ALTO: return 2.2;
      case NivelSeveridad.CRITICO: return 3.0;
    }
  }

  toString(): string {
    return `🚗 Daño Vehículo [${this.placa}] - ${this.descripcion} (${this.severidad})`;
  }
}

export class DañoHogar implements IDaño {
  readonly tipo = TipoDaño.HOGAR;
  constructor(
    public readonly id: string,
    public readonly descripcion: string,
    public readonly severidad: NivelSeveridad,
    public readonly direccion: string,
    public readonly tipoVivienda: 'CASA' | 'APARTAMENTO'
  ) {}

  calcularFactorRiesgo(): number {
    const severidadFactor = this.getSeveridadFactor();
    const factorVivienda = this.tipoVivienda === 'CASA' ? 1.3 : 1.0;
    return severidadFactor * factorVivienda * 1.1;
  }

  private getSeveridadFactor(): number {
    // ... mismo switch
    switch (this.severidad) {
      case NivelSeveridad.BAJO: return 1.0;
      case NivelSeveridad.MEDIO: return 1.5;
      case NivelSeveridad.ALTO: return 2.2;
      case NivelSeveridad.CRITICO: return 3.0;
    }
  }

  toString(): string {
    return `🏠 Daño Hogar [${this.direccion}] - ${this.descripcion} (${this.severidad})`;
  }
}

export class DañoSalud implements IDaño {
  readonly tipo = TipoDaño.SALUD;
  constructor(
    public readonly id: string,
    public readonly descripcion: string,
    public readonly severidad: NivelSeveridad,
    public readonly tipoLesion: string,
    public readonly edadPaciente: number
  ) {}

  calcularFactorRiesgo(): number {
    const severidadFactor = this.getSeveridadFactor();
    const factorEdad = this.edadPaciente > 65 ? 1.4 : 1.0;
    return severidadFactor * factorEdad * 1.3;
  }

  private getSeveridadFactor(): number {
    switch (this.severidad) {
      case NivelSeveridad.BAJO: return 1.2;
      case NivelSeveridad.MEDIO: return 1.8;
      case NivelSeveridad.ALTO: return 2.5;
      case NivelSeveridad.CRITICO: return 3.5;
    }
  }

  toString(): string {
    return `🩺 Daño Salud - ${this.tipoLesion} (${this.severidad}) Edad: ${this.edadPaciente}`;
  }
}

export class DañoEmpresarial implements IDaño {
  readonly tipo = TipoDaño.EMPRESARIAL;
  constructor(
    public readonly id: string,
    public readonly descripcion: string,
    public readonly severidad: NivelSeveridad,
    public readonly nitEmpresa: string,
    public readonly perdidaDiaria: Monto
  ) {}

  calcularFactorRiesgo(): number {
    const severidadFactor = this.getSeveridadFactor();
    const factorPerdida = Math.min(this.perdidaDiaria.valor / 1000000, 5);
    return severidadFactor * (1 + factorPerdida);
  }

  private getSeveridadFactor(): number {
    switch (this.severidad) {
      case NivelSeveridad.BAJO: return 1.5;
      case NivelSeveridad.MEDIO: return 2.0;
      case NivelSeveridad.ALTO: return 2.8;
      case NivelSeveridad.CRITICO: return 4.0;
    }
  }

  toString(): string {
    return `🏢 Daño Empresarial [${this.nitEmpresa}] - Pérdida diaria: ${this.perdidaDiaria.toString()}`;
  }
}