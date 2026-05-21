import { faker } from '@faker-js/faker';

import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import type {
  ICreateNotificationInput,
  INotification,
} from '../../interfaces/notification.interface';

const CHANNELS = [NotificationChannel.Email, NotificationChannel.Sms, NotificationChannel.Push];

export class NotificationFixture {
  static create(overrides?: Partial<INotification>): INotification {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      channel: faker.helpers.arrayElement(CHANNELS),
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      status: NotificationStatus.Created,
      createdAt: faker.date.past().toISOString(),
      sentAt: null,
      ...overrides,
    };
  }

  static createSent(overrides?: Partial<INotification>): INotification {
    return NotificationFixture.create({
      status: NotificationStatus.Sent,
      sentAt: faker.date.recent().toISOString(),
      ...overrides,
    });
  }

  static createMany(count: number, overrides?: Partial<INotification>): INotification[] {
    return Array.from({ length: count }, () => NotificationFixture.create(overrides));
  }
}

export class CreateNotificationInputFixture {
  static create(overrides?: Partial<ICreateNotificationInput>): ICreateNotificationInput {
    return {
      userId: faker.string.uuid(),
      channel: faker.helpers.arrayElement(CHANNELS),
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      ...overrides,
    };
  }
}
