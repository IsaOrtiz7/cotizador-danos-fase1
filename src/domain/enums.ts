/**
 * Enums y const enums - Fase 1 Roadmap
 * Demuestra catálogos tipados (usados en NestJS después)
 */

export const enum TipoDaño {
  VEHICULO = 'VEHICULO',
  HOGAR = 'HOGAR',
  SALUD = 'SALUD',
  EMPRESARIAL = 'EMPRESARIAL'
}

export const enum EstadoCotizacion {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  PAGADA = 'PAGADA'
}

export const enum NivelSeveridad {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO'
}

export const enum TipoEstrategia {
  ESTANDAR = 'ESTANDAR',
  PREMIUM = 'PREMIUM',
  RAPIDA = 'RAPIDA'
}