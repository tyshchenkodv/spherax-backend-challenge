import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { registerAs, type ConfigFactoryKeyHost, type ConfigObject } from '@nestjs/config';

type ClassConstructor<T extends object> = new () => T;

export function registerAsValidated<TConfig extends ConfigObject, TDto extends object>(
  namespace: string,
  dtoClass: ClassConstructor<TDto>,
  factory: () => TConfig,
): (() => TConfig) & ConfigFactoryKeyHost<TConfig> {
  return registerAs(namespace, () => {
    const config = factory();
    const dto = plainToInstance(dtoClass, config, {
      enableImplicitConversion: true,
    });
    const validationErrors = validateSync(dto, {
      forbidUnknownValues: true,
      whitelist: true,
    });

    if (validationErrors.length > 0) {
      const messages = validationErrors
        .flatMap((error) => Object.values(error.constraints ?? {}))
        .join('; ');

      throw new Error(`Invalid ${namespace} configuration: ${messages}`);
    }

    return config;
  });
}
