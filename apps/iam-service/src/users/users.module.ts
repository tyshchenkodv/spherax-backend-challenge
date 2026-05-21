import { Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';
import { UsersGrpcController } from './controllers/users.grpc-controller';
import { AbstractUsersRepository } from './interfaces/users-repository.interface';
import { AbstractUsersService } from './interfaces/users-service.interface';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController, UsersGrpcController],
  providers: [
    { provide: AbstractUsersService, useClass: UsersService },
    { provide: AbstractUsersRepository, useClass: InMemoryUsersRepository },
  ],
  exports: [AbstractUsersService],
})
export class UsersModule {}
