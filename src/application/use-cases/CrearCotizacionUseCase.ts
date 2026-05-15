/**
 * Use Case - Crear Cotización
 * + Async/Await + Result Pattern (FP style) + Promise.allSettled
 */

import { Cotizacion } from '../../domain/entities/Cotizacion';
import { Monto } from '../../domain/value-objects/Monto';
import { ICotizacionRepository } from '../../infrastructure/repositories/CotizacionRepository';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { LogExecutionTime } from '../../infrastructure/decorators/decorators';

// Result Pattern (éxito/fallo explícito, sin excepciones todo el tiempo)
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export class CrearCotizacionUseCase {
  constructor(
    private readonly repository: ICotizacionRepository,
    private readonly config: ConfigService
  ) {}

  @LogExecutionTime
  async ejecutar(
    clienteId: string,
    descripcion: string,
    montoInicial: number
  ): Promise<Result<Cotizacion>> {
    try {
      // Validación
      if (!clienteId || montoInicial <= 0) {
        return { success: false, error: new Error('Datos inválidos') };
      }

      const monto = Monto.create(montoInicial);
      const cotizacion = new Cotizacion(clienteId, descripcion, monto);

      // Simular llamada a API de precios (Promise.allSettled demo)
      const preciosFalsos = await this.obtenerPreciosReferencia();
      console.log(`📊 Precios de referencia obtenidos: ${preciosFalsos.length} ítems`);

      const guardada = await this.repository.guardar(cotizacion);
      return { success: true, data: guardada };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async obtenerPreciosReferencia(): Promise<number[]> {
    // Simula 3 llamadas en paralelo
    const promesas = [
      this.simularApiCall('repuestos', 800),
      this.simularApiCall('mano_obra', 1200),
      this.simularApiCall('impuestos', 300)
    ];
    const resultados = await Promise.allSettled(promesas);
    return resultados
      .filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  private simularApiCall(tipo: string, delay: number): Promise<number> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% éxito
          resolve(Math.floor(Math.random() * 500000) + 100000);
        } else {
          reject(new Error(`API ${tipo} falló`));
        }
      }, delay);
    });
  }
}