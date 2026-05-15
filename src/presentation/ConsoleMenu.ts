/**
 * Presentation Layer - Menú interactivo de consola
 * Demuestra todo lo de la Fase 1 en acción
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';

import { Cotizacion } from '../domain/entities/Cotizacion';
import { DañoVehiculo, DañoHogar, DañoSalud } from '../domain/entities/Daño';
import { Monto } from '../domain/value-objects/Monto';
import { TipoDaño, EstadoCotizacion, NivelSeveridad, TipoEstrategia } from '../domain/enums';
import { InMemoryCotizacionRepository } from '../infrastructure/repositories/CotizacionRepository';
import { CrearCotizacionUseCase } from '../application/use-cases/CrearCotizacionUseCase';
import { ConfigService } from '../infrastructure/config/ConfigService';
import { EstrategiaFactory } from '../infrastructure/strategies/EstrategiaCalculo';
import { Notificador } from '../infrastructure/observer/Notificador';

export class ConsoleMenu {
  private rl: readline.Interface;
  private repo = new InMemoryCotizacionRepository();
  private config = ConfigService.getInstance();
  private useCase: CrearCotizacionUseCase;
  private notificador = new Notificador();
  private cotizacionActual: Cotizacion | null = null;

  constructor() {
    this.rl = readline.createInterface({ input, output });
    this.useCase = new CrearCotizacionUseCase(this.repo, this.config);

    // Observer demo
    this.notificador.suscribir((estado, id) => {
      console.log(chalk.yellow(`📢 [NOTIFICACIÓN] Cotización ${id} cambió a: ${estado}`));
    });
  }

  async iniciar(): Promise<void> {
    console.clear();
    console.log(chalk.bold.blue('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blue('║   🚀 COTIZADOR DE DAÑOS - FASE 1 (Roadmap IA Center)      ║'));
    console.log(chalk.bold.blue('║   TypeScript + Patrones + Clean Arch + Async Node.js     ║'));
    console.log(chalk.bold.blue('╚════════════════════════════════════════════════════════════╝\n'));

    console.log(chalk.gray('Este proyecto demuestra TODO lo de la Fase 1 del roadmap.'));
    console.log(chalk.gray('Elige una opción para ver cada concepto en acción.\n'));

    await this.mostrarMenu();
  }

  private async mostrarMenu(): Promise<void> {
    console.log(chalk.cyan('\n┌────────────────────────────────────────────────────────────┐'));
    console.log(chalk.cyan('│  MENÚ PRINCIPAL                                            │'));
    console.log(chalk.cyan('├────────────────────────────────────────────────────────────┤'));
    console.log('│  1. Crear nueva cotización (UseCase + Result + Decorators)   │');
    console.log('│  2. Agregar daño a cotización (Factory + Discriminated Union)│');
    console.log('│  3. Calcular precio con Strategy (Estrategia intercambiable) │');
    console.log('│  4. Cambiar estado (Observer + Notificador)                  │');
    console.log('│  5. Listar cotizaciones (Repository + Async)                 │');
    console.log('│  6. Demo de Async/Promises (Promise.all vs allSettled)       │');
    console.log('│  7. Ver Config Singleton + Utility Types                     │');
    console.log('│  8. Salir                                                    │');
    console.log(chalk.cyan('└────────────────────────────────────────────────────────────┘'));

    const opcion = await this.rl.question(chalk.green('\n👉 Elige una opción (1-8): '));

    switch (opcion.trim()) {
      case '1': await this.opcionCrearCotizacion(); break;
      case '2': await this.opcionAgregarDaño(); break;
      case '3': await this.opcionCalcularPrecio(); break;
      case '4': await this.opcionCambiarEstado(); break;
      case '5': await this.opcionListar(); break;
      case '6': await this.opcionDemoAsync(); break;
      case '7': this.opcionVerConfig(); break;
      case '8':
        console.log(chalk.green('\n👋 ¡Gracias! Proyecto Fase 1 completado. Listo para NestJS.\n'));
        this.rl.close();
        return;
      default:
        console.log(chalk.red('Opción inválida'));
    }

    await this.mostrarMenu();
  }

  private async opcionCrearCotizacion(): Promise<void> {
    console.log(chalk.bold('\n📝 CREAR NUEVA COTIZACIÓN'));
    const clienteId = await this.rl.question('ID Cliente (ej: CLI-123): ');
    const descripcion = await this.rl.question('Descripción del siniestro: ');
    const montoStr = await this.rl.question('Monto inicial estimado (COP): ');

    const resultado = await this.useCase.ejecutar(
      clienteId || 'CLI-001',
      descripcion || 'Siniestro de prueba',
      parseInt(montoStr) || 1500000
    );

    if (resultado.success) {
      this.cotizacionActual = resultado.data;
      console.log(chalk.green('\n✅ Cotización creada exitosamente!'));
      console.log(this.cotizacionActual.toString());
    } else {
      console.log(chalk.red(`❌ Error: ${resultado.error.message}`));
    }
  }

  private async opcionAgregarDaño(): Promise<void> {
    if (!this.cotizacionActual) {
      console.log(chalk.yellow('Primero crea una cotización (opción 1)'));
      return;
    }

    console.log(chalk.bold('\n➕ AGREGAR DAÑO (Discriminated Union + Factory)'));
    console.log('1. Vehículo  2. Hogar  3. Salud');
    const tipo = await this.rl.question('Tipo de daño: ');

    let daño: any;
    const id = 'D-' + Date.now();

    if (tipo === '1') {
      daño = new DañoVehiculo(
        id, 'Colisión frontal', NivelSeveridad.ALTO,
        'ABC-123', 'Toyota Corolla', 2022
      );
    } else if (tipo === '2') {
      daño = new DañoHogar(
        id, 'Inundación por tormenta', NivelSeveridad.MEDIO,
        'Calle 45 #12-34, Barranquilla', 'CASA'
      );
    } else {
      daño = new DañoSalud(
        id, 'Fractura de tibia', NivelSeveridad.ALTO,
        'Fractura', 34
      );
    }

    this.cotizacionActual.agregarDaño(daño);
    console.log(chalk.green(`✅ Daño agregado: ${daño.toString()}`));
    console.log(chalk.blue(`Nuevo monto total: ${this.cotizacionActual.montoTotal.toString()}`));
  }

  private async opcionCalcularPrecio(): Promise<void> {
    if (!this.cotizacionActual) {
      console.log(chalk.yellow('Crea una cotización primero'));
      return;
    }

    console.log(chalk.bold('\n💰 CALCULAR PRECIO CON ESTRATEGIA'));
    console.log('1. Estándar  2. Premium  3. Rápida');
    const tipo = await this.rl.question('Estrategia: ');

    const estrategia = EstrategiaFactory.crear(
      tipo === '2' ? TipoEstrategia.PREMIUM : tipo === '3' ? TipoEstrategia.RAPIDA : TipoEstrategia.ESTANDAR
    );

    const precio = estrategia.calcular(
      this.cotizacionActual.daños as any,
      this.cotizacionActual.montoTotal
    );

    console.log(chalk.green(`\n✅ Precio calculado con ${estrategia.nombre}:`));
    console.log(chalk.bold(`${precio.toString()}`));
    console.log(chalk.gray(estrategia.getDescripcion()));
  }

  private async opcionCambiarEstado(): Promise<void> {
    if (!this.cotizacionActual) {
      console.log(chalk.yellow('Crea una cotización primero'));
      return;
    }

    console.log(chalk.bold('\n🔄 CAMBIAR ESTADO (Observer)'));
    console.log('1. EN_REVISION  2. APROBADA  3. RECHAZADA  4. PAGADA');
    const opcion = await this.rl.question('Nuevo estado: ');

    let nuevoEstado: EstadoCotizacion;
    switch (opcion) {
      case '1': nuevoEstado = EstadoCotizacion.EN_REVISION; break;
      case '2': nuevoEstado = EstadoCotizacion.APROBADA; break;
      case '3': nuevoEstado = EstadoCotizacion.RECHAZADA; break;
      case '4': nuevoEstado = EstadoCotizacion.PAGADA; break;
      default: nuevoEstado = EstadoCotizacion.EN_REVISION;
    }

    this.cotizacionActual.cambiarEstado(nuevoEstado);
    this.notificador.notificar(nuevoEstado, this.cotizacionActual.id);
    console.log(chalk.green(`Estado actualizado a: ${nuevoEstado}`));
  }

  private async opcionListar(): Promise<void> {
    console.log(chalk.bold('\n📋 LISTAR COTIZACIONES (Repository Async)'));
    const todas = await this.repo.listarTodas();

    if (todas.length === 0) {
      console.log(chalk.yellow('No hay cotizaciones aún.'));
      return;
    }

    todas.forEach((c, i) => {
      console.log(`${i + 1}. ${c.toString()}`);
    });
  }

  private async opcionDemoAsync(): Promise<void> {
    console.log(chalk.bold('\n⚡ DEMO ASINCRONÍA NODE.JS'));
    console.log(chalk.gray('Promise.all vs Promise.allSettled + Event Loop'));

    const promesas = [
      this.simularTarea('Llamada API precios', 400, true),
      this.simularTarea('Validación crédito', 600, false), // falla
      this.simularTarea('Notificación SMS', 300, true)
    ];

    console.log('\n🔄 Promise.allSettled (no falla si una falla):');
    const resultados = await Promise.allSettled(promesas);
    resultados.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        console.log(chalk.green(`  ✅ Tarea ${i + 1}: ${r.value}`));
      } else {
        console.log(chalk.red(`  ❌ Tarea ${i + 1}: ${r.reason}`));
      }
    });

    console.log(chalk.gray('\n(Event Loop: Node maneja todo con un solo hilo usando callbacks y microtasks)'));
  }

  private simularTarea(nombre: string, ms: number, exito: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        exito ? resolve(`${nombre} OK`) : reject(`${nombre} falló`);
      }, ms);
    });
  }

  private opcionVerConfig(): void {
    console.log(chalk.bold('\n⚙️  CONFIG SINGLETON + UTILITY TYPES'));
    console.log(`IVA actual: ${this.config.get<number>('IVA') * 100}%`);
    console.log(`Moneda base: ${this.config.get<string>('MONEDA_BASE')}`);
    console.log(`Umbral aprobación: ${this.config.get<number>('UMBRAL_APROBACION').toLocaleString()}`);

    // Demo utility types
    console.log(chalk.gray('\nEjemplo de Utility Types aplicados:'));
    console.log(chalk.gray('Partial<Cotizacion> usado en actualizaciones parciales'));
    console.log(chalk.gray('Pick<Cotizacion, "id" | "estado"> usado en listados'));
  }
}