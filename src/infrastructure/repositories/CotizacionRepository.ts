/**
 * Repository Pattern - Aislar persistencia
 * + Generic Repository + Inmutabilidad
 */

import { Cotizacion } from '../../domain/entities/Cotizacion';
import { EstadoCotizacion } from '../../domain/enums';

export interface ICotizacionRepository {
  guardar(cotizacion: Cotizacion): Promise<Cotizacion>;
  obtenerPorId(id: string): Promise<Cotizacion | null>;
  listarTodas(): Promise<Cotizacion[]>;
  listarPorEstado(estado: EstadoCotizacion): Promise<Cotizacion[]>;
  eliminar(id: string): Promise<boolean>;
}

export class InMemoryCotizacionRepository implements ICotizacionRepository {
  private readonly cotizaciones: Map<string, Cotizacion> = new Map();

  async guardar(cotizacion: Cotizacion): Promise<Cotizacion> {
    // Simula latencia de DB
    await new Promise(resolve => setTimeout(resolve, 50));
    this.cotizaciones.set(cotizacion.id, cotizacion);
    return cotizacion;
  }

  async obtenerPorId(id: string): Promise<Cotizacion | null> {
    await new Promise(resolve => setTimeout(resolve, 30));
    return this.cotizaciones.get(id) ?? null;
  }

  async listarTodas(): Promise<Cotizacion[]> {
    await new Promise(resolve => setTimeout(resolve, 40));
    return Array.from(this.cotizaciones.values());
  }

  async listarPorEstado(estado: EstadoCotizacion): Promise<Cotizacion[]> {
    const todas = await this.listarTodas();
    return todas.filter(c => c.estado === estado);
  }

  async eliminar(id: string): Promise<boolean> {
    return this.cotizaciones.delete(id);
  }
}