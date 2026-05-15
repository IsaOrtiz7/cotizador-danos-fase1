/**
 * Entidad Cotización - DDD + OOP + Discriminated Union
 * Demuestra Herencia, Polimorfismo, Encapsulamiento
 */

import { EstadoCotizacion } from '../enums';
import { Monto } from '../value-objects/Monto';
import { Daño } from './Daño';
import { v4 as uuidv4 } from 'uuid'; // we'll simulate without lib

export class Cotizacion {
  public readonly id: string;
  public readonly fechaCreacion: Date;
  private _estado: EstadoCotizacion = EstadoCotizacion.PENDIENTE;
  private _daños: Daño[] = [];
  private _montoTotal: Monto;
  private _observadores: Array<(estado: EstadoCotizacion) => void> = [];

  constructor(
    public readonly clienteId: string,
    public readonly descripcion: string,
    montoInicial: Monto
  ) {
    this.id = 'COT-' + Date.now().toString(36).toUpperCase();
    this.fechaCreacion = new Date();
    this._montoTotal = montoInicial;
  }

  // Encapsulamiento + Getters
  get estado(): EstadoCotizacion { return this._estado; }
  get daños(): readonly Daño[] { return [...this._daños]; } // inmutabilidad
  get montoTotal(): Monto { return this._montoTotal; }

  // Agregar daño (Factory + Polimorfismo)
  agregarDaño(daño: Daño): void {
    this._daños.push(daño);
    this.recalcularMonto();
    this.notificarObservadores();
  }

  private recalcularMonto(): void {
    const total = this._daños.reduce((sum, daño) => {
      return sum + (daño.calcularFactorRiesgo() * 500000); // base
    }, this._montoTotal.valor);
    this._montoTotal = Monto.create(Math.round(total));
  }

  // Cambiar estado (dispara Observer)
  cambiarEstado(nuevoEstado: EstadoCotizacion): void {
    if (nuevoEstado === this._estado) return;
    this._estado = nuevoEstado;
    this.notificarObservadores();
  }

  // Observer Pattern
  agregarObservador(callback: (estado: EstadoCotizacion) => void): void {
    this._observadores.push(callback);
  }

  private notificarObservadores(): void {
    this._observadores.forEach(cb => cb(this._estado));
  }

  toString(): string {
    return `📋 Cotización ${this.id} | Cliente: ${this.clienteId} | Estado: ${this._estado} | Monto: ${this._montoTotal.toString()} | Daños: ${this._daños.length}`;
  }
}