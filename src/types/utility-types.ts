/**
 * Utility Types personalizados - Demostración de Partial, Pick, Omit, Record, Readonly
 * Usados en el dominio del cotizador
 */

export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

export type PartialCotizacion = Partial<{
  descripcion: string;
  montoEstimado: number;
  severidad: string;
}>;

export type CotizacionResumen = Pick<{
  id: string;
  estado: string;
  montoTotal: number;
  fecha: Date;
}, 'id' | 'estado' | 'montoTotal'>;

export type CotizacionSinId = Omit<{
  id: string;
  descripcion: string;
  monto: number;
}, 'id'>;

export type CatalogoDaños = Record<string, { nombre: string; factor: number }>;