import { Module } from '@nestjs/common';

import { IamClientModule } from '../iam-client/iam-client.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsGrpcController } from './controllers/notifications.grpc-controller';
import { UserNotificationsController } from './controllers/user-notifications.controller';
import { AbstractNotificationsRepository } from './interfaces/notifications-repository.interface';
import { AbstractNotificationsService } from './interfaces/notifications-service.interface';
import { InMemoryNotificationsRepository } from './repositories/in-memory-notifications.repository';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [IamClientModule],
  controllers: [NotificationsController, NotificationsGrpcController, UserNotificationsController],
  providers: [
    { provide: AbstractNotificationsService, useClass: NotificationsService },
    { provide: AbstractNotificationsRepository, useClass: InMemoryNotificationsRepository },
  ],
})
export class NotificationsModule {}
