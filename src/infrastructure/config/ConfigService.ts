/**
 * Singleton Pattern - Configuración global
 * Una sola instancia en toda la app
 */

export class ConfigService {
  private static instance: ConfigService;
  private readonly config: Map<string, any> = new Map();

  private constructor() {
    // Valores por defecto
    this.config.set('IVA', 0.19);
    this.config.set('MONEDA_BASE', 'COP');
    this.config.set('UMBRAL_APROBACION', 5000000);
    this.config.set('API_TIMEOUT', 3000);
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get<T>(key: string): T {
    return this.config.get(key) as T;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }
}