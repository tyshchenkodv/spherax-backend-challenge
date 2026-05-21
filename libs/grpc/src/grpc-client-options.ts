import { join } from 'node:path';

import { type ClientOptions, Transport } from '@nestjs/microservices';

export interface GrpcClientOptionsInput {
  packageName: string;
  protoPath: string;
  url: string;
}

export function createGrpcClientOptions(input: GrpcClientOptionsInput): ClientOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: input.packageName,
      protoPath: join(process.cwd(), input.protoPath),
      url: input.url,
    },
  };
}
