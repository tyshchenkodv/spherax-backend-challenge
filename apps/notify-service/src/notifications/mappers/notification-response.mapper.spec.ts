import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationFixture } from '../__tests__/__fixtures__/notification.fixtures';
import { mapNotificationToResponse } from './notification-response.mapper';

describe('mapNotificationToResponse', () => {
  const notification = NotificationFixture.create({
    id: 'notif-1',
    userId: 'user-1',
    channel: NotificationChannel.Email,
    subject: 'Hello World',
    body: 'Test body',
    status: NotificationStatus.Created,
    createdAt: '2026-05-21T10:00:00.000Z',
    sentAt: null,
  });

  it('maps version 1 to basic fields only', () => {
    // Arrange
    const expected = {
      id: 'notif-1',
      userId: 'user-1',
      channel: NotificationChannel.Email,
      subject: 'Hello World',
      body: 'Test body',
    };

    // Act
    const result = mapNotificationToResponse(notification, 1);

    // Assert
    expect(result).toEqual(expected);
  });

  it('maps version 2 to full notification including status and timestamps', () => {
    // Act
    const result = mapNotificationToResponse(notification, 2);

    // Assert
    expect(result).toEqual(notification);
  });
});
