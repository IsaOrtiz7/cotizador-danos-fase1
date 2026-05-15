/**
 * Observer Pattern - Notificar cambios de estado
 */

import { EstadoCotizacion } from '../../domain/enums';

export class Notificador {
  private suscriptores: Array<(estado: EstadoCotizacion, cotizacionId: string) => void> = [];

  suscribir(callback: (estado: EstadoCotizacion, cotizacionId: string) => void): void {
    this.suscriptores.push(callback);
  }

  notificar(estado: EstadoCotizacion, cotizacionId: string): void {
    console.log(`🔔 [OBSERVER] Notificando cambio de estado: ${estado}`);
    this.suscriptores.forEach(cb => cb(estado, cotizacionId));
  }
}