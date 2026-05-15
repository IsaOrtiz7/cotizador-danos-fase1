/**
 * ============================================================
 * COTIZADOR DE DAÑOS - FASE 1 (Roadmap IA Center - Sofka)
 * Proyecto consola TypeScript que cubre 100% la Fase 1
 * ============================================================
 * 
 * Este archivo único demuestra TODOS los conceptos de la Fase 1:
 * - TypeScript profundo (interfaces, generics, utility types, discriminated unions, decorators, enums)
 * - Patrones de diseño (Singleton, Factory, Strategy, Repository, Observer, DI)
 * - Arquitectura limpia (capas + SRP + DDD básico)
 * - Asincronía Node.js (event loop, promises, async/await, Result pattern)
 * 
 * Cómo correr (en tu máquina):
 * 1. npm install
 * 2. npm run dev
 * 
 * Todo está comentado para que entiendas POR QUÉ se usa cada cosa.
 */

// ============================================================
// 1. ENUMS + CONST ENUMS (catálogos tipados del dominio)
// ============================================================
enum TipoDaño {
  VEHICULO = 'VEHICULO',
  HOGAR = 'HOGAR',
  SALUD = 'SALUD'
}

const enum EstadoCotizacion {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  EN_REVISION = 'EN_REVISION'
}

const enum NivelSeveridad {
  BAJA = 1,
  MEDIA = 2,
  ALTA = 3,
  CRITICA = 4
}

// ============================================================
// 2. DISCRIMINATED UNIONS (modelar estados y excepciones sin errores)
// ============================================================
type Daño = 
  | { kind: 'vehiculo'; placa: string; modelo: string; año: number; tipoAccidente: string }
  | { kind: 'hogar'; direccion: string; tipoInmueble: 'casa' | 'apartamento'; metrosCuadrados: number }
  | { kind: 'salud'; paciente: string; tipoLesion: string; hospital: string };

// ============================================================
// 3. INTERFACES vs TYPE (cuándo usar cada uno)
// ============================================================
// Interface = para objetos que se extienden / implementan (OOP)
interface Cotizacion {
  id: string;
  fecha: Date;
  daño: Daño;
  estado: EstadoCotizacion;
  montoEstimado: number;
  observaciones?: string;
}

// Type = para uniones, intersecciones, utility (más flexible)
type CotizacionResumen = Pick<Cotizacion, 'id' | 'estado' | 'montoEstimado'>;
type CotizacionUpdate = Partial<Omit<Cotizacion, 'id' | 'fecha'>>;

// ============================================================
// 4. GENERICS + UTILITY TYPES (código reutilizable con seguridad de tipos)
// ============================================================
interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  findAll(): Promise<T[]>;
}

type ReadonlyCotizacion = Readonly<Cotizacion>;
type CotizacionSinId = Omit<Cotizacion, 'id'>;

// ============================================================
// 5. RESULT PATTERN (FP style - modelar éxito/fallo sin excepciones)
// ============================================================
type Result<T, E = string> = 
  | { success: true; value: T }
  | { success: false; error: E };

function ok<T>(value: T): Result<T> {
  return { success: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// ============================================================
// 6. DECORATORS (base para entender NestJS)
// ============================================================
function LogExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    const result = await originalMethod.apply(this, args);
    const duration = Date.now() - start;
    console.log(`\x1b[36m[DECORATOR] ${propertyKey} ejecutado en ${duration}ms\x1b[0m`);
    return result;
  };
  return descriptor;
}

function ValidateDaño(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (daño: Daño) {
    if (!daño || !daño.kind) {
      throw new Error('Daño inválido: debe tener "kind" discriminatorio');
    }
    return original.apply(this, [daño]);
  };
  return descriptor;
}

// ============================================================
// 7. SINGLETON (configuración global)
// ============================================================
class ConfigService {
  private static instance: ConfigService;
  private config = {
    tasaIVA: 0.19,
    margenUtilidad: 0.15,
    apiPreciosUrl: 'https://api.precios.danos.com',
    timeoutMs: 1500
  };

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get<T extends keyof typeof this.config>(key: T) {
    return this.config[key];
  }
}

// ============================================================
// 8. STRATEGY PATTERN (intercambiar algoritmos de cálculo)
// ============================================================
interface EstrategiaCalculo {
  calcular(daño: Daño, config: ConfigService): Promise<number>;
}

class EstrategiaVehiculo implements EstrategiaCalculo {
  async calcular(daño: Extract<Daño, { kind: 'vehiculo' }>, config: ConfigService): Promise<number> {
    const base = 2500000; // precio base reparación
    const factorAño = (2026 - daño.año) * 50000;
    const iva = base * config.get('tasaIVA');
    return Math.round(base + factorAño + iva);
  }
}

class EstrategiaHogar implements EstrategiaCalculo {
  async calcular(daño: Extract<Daño, { kind: 'hogar' }>, config: ConfigService): Promise<number> {
    const basePorM2 = 180000;
    const subtotal = daño.metrosCuadrados * basePorM2;
    return Math.round(subtotal * (1 + config.get('margenUtilidad')));
  }
}

class EstrategiaSalud implements EstrategiaCalculo {
  async calcular(daño: Extract<Daño, { kind: 'salud' }>, config: ConfigService): Promise<number> {
    const base = daño.tipoLesion.includes('fractura') ? 8500000 : 3200000;
    return Math.round(base * 1.12); // incluye honorarios
  }
}

class CalculadoraDaños {
  private estrategias = new Map<string, EstrategiaCalculo>([
    ['vehiculo', new EstrategiaVehiculo()],
    ['hogar', new EstrategiaHogar()],
    ['salud', new EstrategiaSalud()]
  ]);

  @LogExecutionTime
  async calcular(daño: Daño): Promise<Result<number, string>> {
    const estrategia = this.estrategias.get(daño.kind);
    if (!estrategia) return err(`No hay estrategia para tipo: ${daño.kind}`);
    
    try {
      const monto = await estrategia.calcular(daño as any, ConfigService.getInstance());
      return ok(monto);
    } catch (e: any) {
      return err(e.message);
    }
  }
}

// ============================================================
// 9. FACTORY + VALIDATION (centralizar creación de objetos)
// ============================================================
class DañoFactory {
  static crear(tipo: TipoDaño, datos: any): Result<Daño, string> {
    switch (tipo) {
      case TipoDaño.VEHICULO:
        if (!datos.placa || !datos.modelo) return err('Placa y modelo son obligatorios');
        return ok({ 
          kind: 'vehiculo', 
          placa: datos.placa, 
          modelo: datos.modelo, 
          año: datos.año || 2020, 
          tipoAccidente: datos.tipoAccidente || 'colisión' 
        });
      
      case TipoDaño.HOGAR:
        if (!datos.direccion) return err('Dirección obligatoria');
        return ok({ 
          kind: 'hogar', 
          direccion: datos.direccion, 
          tipoInmueble: datos.tipoInmueble || 'casa', 
          metrosCuadrados: datos.metrosCuadrados || 80 
        });
      
      case TipoDaño.SALUD:
        if (!datos.paciente) return err('Nombre del paciente obligatorio');
        return ok({ 
          kind: 'salud', 
          paciente: datos.paciente, 
          tipoLesion: datos.tipoLesion || 'contusión', 
          hospital: datos.hospital || 'Clínica Central' 
        });
      
      default:
        return err('Tipo de daño no soportado');
    }
  }
}

// ============================================================
// 10. REPOSITORY (aislar persistencia)
// ============================================================
class CotizacionRepository implements Repository<Cotizacion> {
  private cotizaciones: Map<string, Cotizacion> = new Map();

  async findById(id: string): Promise<Cotizacion | null> {
    return this.cotizaciones.get(id) || null;
  }

  async save(cotizacion: Cotizacion): Promise<Cotizacion> {
    this.cotizaciones.set(cotizacion.id, { ...cotizacion });
    return cotizacion;
  }

  async findAll(): Promise<Cotizacion[]> {
    return Array.from(this.cotizaciones.values());
  }

  async updateEstado(id: string, nuevoEstado: EstadoCotizacion): Promise<Result<Cotizacion, string>> {
    const existente = this.cotizaciones.get(id);
    if (!existente) return err('Cotización no encontrada');
    
    const actualizada: Cotizacion = { ...existente, estado: nuevoEstado };
    this.cotizaciones.set(id, actualizada);
    return ok(actualizada);
  }
}

// ============================================================
// 11. OBSERVER (notificar cambios de estado)
// ============================================================
type Observer = (cotizacion: Cotizacion) => void;

class NotificadorEstado {
  private observers: Observer[] = [];

  subscribe(observer: Observer) {
    this.observers.push(observer);
  }

  notify(cotizacion: Cotizacion) {
    console.log(`\x1b[33m[OBSERVER] Notificando cambio de estado a ${cotizacion.estado}...\x1b[0m`);
    this.observers.forEach(obs => obs(cotizacion));
  }
}

// ============================================================
// 12. DEPENDENCY INJECTION (manual - base para NestJS)
// ============================================================
class CotizacionService {
  constructor(
    private repo: CotizacionRepository,
    private calculadora: CalculadoraDaños,
    private notificador: NotificadorEstado
  ) {}

  // explicación 1 y 5

  @LogExecutionTime
  async crearCotizacion(daño: Daño): Promise<Result<Cotizacion, string>> {
    const calculo = await this.calculadora.calcular(daño);
    if (!calculo.success) return err(calculo.error);

    const cotizacion: Cotizacion = {
      id: `COT-${Date.now()}`,
      fecha: new Date(),
      daño,
      estado: EstadoCotizacion.PENDIENTE,
      montoEstimado: calculo.value,
      observaciones: 'Cotización generada automáticamente'
    };

    await this.repo.save(cotizacion);
    this.notificador.notify(cotizacion);
    return ok(cotizacion);
  }

  async cambiarEstado(id: string, nuevoEstado: EstadoCotizacion): Promise<Result<Cotizacion, string>> {
    const resultado = await this.repo.updateEstado(id, nuevoEstado);
    if (resultado.success) {
      this.notificador.notify(resultado.value);
    }
    return resultado;
  }

  async listar(): Promise<Cotizacion[]> {
    return this.repo.findAll();
  }
}

// ============================================================
// 13. ASINCRONÍA NODE.JS + PROMISES + RESULT PATTERN
// ============================================================
async function simularLlamadaAPI(endpoint: string, delayMs: number): Promise<Result<number, string>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.15) {
        resolve(ok(Math.floor(Math.random() * 500000) + 100000));
      } else {
        resolve(err(`Timeout o error en ${endpoint}`));
      }
    }, delayMs);
  });
}

async function obtenerPreciosParalelo(daño: Daño): Promise<Result<number[], string>> {
  const endpoints = ['precios/repuestos', 'precios/mano-obra', 'precios/impuestos'];
  
  // Promise.allSettled vs Promise.all
  const promesas = endpoints.map((ep, i) => 
    simularLlamadaAPI(ep, 300 + i * 200)
  );

  const resultados = await Promise.allSettled(promesas);
  
  const exitosos: number[] = [];
  const errores: string[] = [];

  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.success) {
      exitosos.push(r.value.value);
    } else if (r.status === 'fulfilled' && !r.value.success) {
      errores.push(r.value.error);
    } else {
      errores.push(`Fallo en ${endpoints[i]}`);
    }
  });

  if (errores.length > 0) {
    console.log(`\x1b[31m[ASYNC] Errores parciales: ${errores.join(', ')}\x1b[0m`);
  }
  
  return exitosos.length > 0 ? ok(exitosos) : err('Todas las llamadas fallaron');
}

// ============================================================
// 14. EVENT LOOP + TRY/CATCH ESTRUCTURADO
// ============================================================
async function demoEventLoop() {
  console.log('\x1b[35m[EVENT LOOP] Demo rápido:\x1b[0m');
  console.log('1. Synchronous code');
  
  setTimeout(() => console.log('4. setTimeout (macrotask)'), 0);
  
  Promise.resolve().then(() => console.log('3. Promise (microtask)'));
  
  console.log('2. More synchronous');
  // Node procesa: sync → microtasks → macrotasks
}

// ============================================================
// 15. MENÚ CONSOLA (Presentation layer)
// ============================================================
import * as readline from 'readline/promises';

class MenuConsola {
  private rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  private service: CotizacionService;
  private cotizacionesActuales: Cotizacion[] = [];

  constructor(service: CotizacionService) {
    this.service = service;
    // Observer demo
    const notificador = new NotificadorEstado();
    notificador.subscribe((cot) => {
      console.log(`\x1b[32m[NOTIFICACIÓN] Cotización ${cot.id} cambió a ${cot.estado}\x1b[0m`);
    });
  }

  async iniciar() {
    console.clear();
    console.log('\x1b[1;36m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[1;36m║   COTIZADOR DE DAÑOS - FASE 1 (Roadmap IA Center Sofka)   ║\x1b[0m');
    console.log('\x1b[1;36m╚════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('\x1b[33mProyecto que implementa TODO lo de la Fase 1: TS profundo + Patrones + Async + Arquitectura limpia\x1b[0m\n');

    while (true) {
      console.log('\n\x1b[1mOpciones:\x1b[0m');
      console.log('  1. Crear nueva cotización de daño');
      console.log('  2. Listar cotizaciones');
      console.log('  3. Cambiar estado de cotización');
      console.log('  4. Simular llamadas asíncronas (Promise.allSettled)');
      console.log('  5. Demo Event Loop + Decorators');
      console.log('  6. Salir');
      
      const opcion = await this.rl.question('\nElige opción (1-6): ');

      try {
        switch (opcion.trim()) {
          case '1': await this.crearCotizacion(); break;
          case '2': await this.listar(); break;
          case '3': await this.cambiarEstado(); break;
          case '4': await this.demoAsync(); break;
          case '5': await this.demoDecoradoresYEventLoop(); break;
          case '6': 
            console.log('\x1b[32m¡Listo parce! Proyecto Fase 1 completado. Revisa los comentarios del código.\x1b[0m');
            this.rl.close();
            return;
          default: console.log('\x1b[31mOpción inválida\x1b[0m');
        }
      } catch (e: any) {
        console.log(`\x1b[31m[ERROR] ${e.message}\x1b[0m`);
      }
    }
  }

  

  private async crearCotizacion() {
    console.log('\n\x1b[1m--- Crear Cotización ---\x1b[0m');
    const tipoStr = await this.rl.question('Tipo de daño (VEHICULO / HOGAR / SALUD): ');
    const tipo = tipoStr.toUpperCase() as TipoDaño;

    // explicación 2

    let datos: any = {};
    if (tipo === TipoDaño.VEHICULO) {
      datos.placa = await this.rl.question('Placa: ');
      datos.modelo = await this.rl.question('Modelo: ');
      datos.año = parseInt(await this.rl.question('Año: ') || '2022');
    } else if (tipo === TipoDaño.HOGAR) {
      datos.direccion = await this.rl.question('Dirección: ');
      datos.metrosCuadrados = parseInt(await this.rl.question('Metros cuadrados: ') || '90');
    } else if (tipo === TipoDaño.SALUD) {
      datos.paciente = await this.rl.question('Nombre paciente: ');
      datos.tipoLesion = await this.rl.question('Tipo lesión (ej: fractura): ');
    }

    // explicación 3

    const dañoResult = DañoFactory.crear(tipo, datos);
    if (!dañoResult.success) {
      console.log(`\x1b[31mError: ${dañoResult.error}\x1b[0m`);
      return;
    }

    // explicación 4

    const resultado = await this.service.crearCotizacion(dañoResult.value);
    if (resultado.success) {
      this.cotizacionesActuales.push(resultado.value);
      console.log(`\x1b[32m✓ Cotización creada: ${resultado.value.id} | Monto: $${resultado.value.montoEstimado.toLocaleString()}\x1b[0m`);
    } else {
      console.log(`\x1b[31m${resultado.error}\x1b[0m`);
    }
  }

  // explicación Opción 2: Listar cotizaciones

  private async listar() {
    const lista = await this.service.listar();
    if (lista.length === 0) {
      console.log('\x1b[33mNo hay cotizaciones aún.\x1b[0m');
      return;
    }
    console.log('\n\x1b[1mCotizaciones:\x1b[0m');
    lista.forEach((c, i) => {
      console.log(`${i+1}. ${c.id} | ${c.daño.kind.toUpperCase()} | $${c.montoEstimado.toLocaleString()} | ${c.estado}`);
    });
  }

  // explicación Opción 3: Cambiar estado de cotización

  private async cambiarEstado() {
    const id = await this.rl.question('ID de la cotización: ');
    const estadoStr = await this.rl.question('Nuevo estado (PENDIENTE / APROBADA / RECHAZADA / EN_REVISION): ');
    const estado = estadoStr.toUpperCase() as EstadoCotizacion;

    const res = await this.service.cambiarEstado(id, estado);
    if (res.success) {
      console.log(`\x1b[32mEstado actualizado correctamente.\x1b[0m`);
    } else {
      console.log(`\x1b[31m${res.error}\x1b[0m`);
    }
  }

  private async demoAsync() {
    console.log('\n\x1b[1m--- Demo Asincronía (Promise.allSettled) ---\x1b[0m');
    const dañoDemo: Daño = { kind: 'vehiculo', placa: 'ABC123', modelo: 'Mazda', año: 2023, tipoAccidente: 'colisión' };
    const precios = await obtenerPreciosParalelo(dañoDemo);
    if (precios.success) {
      console.log(`\x1b[32mPrecios obtenidos en paralelo: ${precios.value.map(p => '$' + p.toLocaleString()).join(', ')}\x1b[0m`);
    } else {
      console.log(`\x1b[31m${precios.error}\x1b[0m`);
    }
  }

  private async demoDecoradoresYEventLoop() {
    console.log('\n\x1b[1m--- Demo Decorators + Event Loop ---\x1b[0m');
    await demoEventLoop();
    
    // Forzar ejecución de un método con decorator
    const calc = new CalculadoraDaños();
    const dañoDemo: Daño = { kind: 'hogar', direccion: 'Calle 45 #12-34', tipoInmueble: 'casa', metrosCuadrados: 120 };
    await calc.calcular(dañoDemo);
  }
}

// ============================================================
// MAIN - Entry point
// ============================================================
async function main() {
  // Inyección de dependencias (manual)
  const repo = new CotizacionRepository();
  const calculadora = new CalculadoraDaños();
  const notificador = new NotificadorEstado();
  
  const service = new CotizacionService(repo, calculadora, notificador);
  
  const menu = new MenuConsola(service);
  await menu.iniciar();
}

main().catch(console.error);