# Cotizador de Daños - Fase 1 (Roadmap IA Center - Sofka Technologies)

Proyecto de consola en TypeScript que **cubre el 100% de la Fase 1** del roadmap técnico.

## ¿Qué cubre exactamente?

### TypeScript Profundo
- Interfaces vs Type Aliases
- Generics (Repository<T, ID>)
- Utility Types (Partial, Omit, Pick, Readonly)
- Discriminated Unions (Daño con kind)
- Decorators (@LogExecutionTime, @ValidateDaño)
- Enums + const enums

### Patrones de Diseño
- **Singleton**: ConfigService
- **Factory**: DañoFactory (con validación)
- **Strategy**: Estrategias de cálculo por tipo de daño
- **Repository**: CotizacionRepository (persistencia en memoria)
- **Observer**: NotificadorEstado
- **Dependency Injection**: Manual vía constructor

### Arquitectura
- Capas: Presentation → Application → Domain → Infrastructure
- SRP aplicado en cada clase
- DDD básico (Entidades, Value Objects implícitos, Domain Services)

### Asincronía Node.js
- Event Loop (demo con microtasks/macrotasks)
- Promises + async/await
- Promise.allSettled (manejo de errores parciales)
- Result Pattern (éxito/fallo explícito, estilo FP)
- Try/catch estructurado

## Cómo correrlo (en tu máquina)

```bash
# 1. Copia la carpeta completa a tu PC
# 2. Entra a la carpeta
cd cotizador-danos-fase1

# 3. Instala dependencias (necesitas internet aquí)
npm install

# 4. Corre en modo desarrollo (hot reload)
npm run dev
```

Opciones del menú:
1. Crear cotización (usa Factory + Strategy + Repository)
2. Listar
3. Cambiar estado (dispara Observer)
4. Demo asincronía paralela
5. Demo Event Loop + Decorators
6. Salir

## Estructura (aunque está en un solo archivo por simplicidad)

El código está organizado en secciones claramente marcadas con comentarios:
- 1. Enums
- 2. Discriminated Unions
- ...
- 15. Menú

En un proyecto real lo separaríamos en carpetas (domain/, application/, etc.), pero para que sea **rápido de copiar y probar** lo dejé en un solo archivo.

## Siguientes pasos (cuando termines Fase 1)

- Separar en múltiples archivos siguiendo la arquitectura hexagonal
- Agregar tests (Jest)
- Conectar a base de datos real (TypeORM / Prisma)
- Pasar a NestJS (Fase 2 del roadmap)

¡Listo parce! Este proyecto te deja 100% preparado para la siguiente fase.
