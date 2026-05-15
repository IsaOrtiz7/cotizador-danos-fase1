/**
 * Decorators - Base para entender NestJS
 * @LogExecutionTime y @ValidateInput
 */

export function LogExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    console.log(`⏱️  [DECORATOR] Ejecutando ${propertyKey}...`);
    const result = await originalMethod.apply(this, args);
    const duration = Date.now() - start;
    console.log(`✅ [DECORATOR] ${propertyKey} completado en ${duration}ms`);
    return result;
  };
  return descriptor;
}

export function ValidateInput(schema: (input: any) => boolean, errorMsg: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if (!schema(args[0])) {
        throw new Error(`[VALIDACIÓN] ${errorMsg}`);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}