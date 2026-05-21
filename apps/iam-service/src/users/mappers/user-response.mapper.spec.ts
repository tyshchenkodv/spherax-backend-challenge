import { SEED_USER_ACTIVE_ID } from '@lib/common';

import { UserFixture } from '../__tests__/__fixtures__/user.fixtures';
import { mapUserToResponse } from './user-response.mapper';
import { UserStatus } from '@app/iam-service/users/enums/user-status.enum';

describe('mapUserToResponse', () => {
  const user = UserFixture.create({
    id: SEED_USER_ACTIVE_ID,
    email: 'john@example.com',
    name: 'John Doe',
    status: UserStatus.Active,
    createdAt: '2026-05-21T10:00:00.000Z',
    updatedAt: '2026-05-21T10:30:00.000Z',
  });

  it('maps version 1 user responses to basic identity fields', () => {
    // Arrange
    const expected = { id: SEED_USER_ACTIVE_ID, email: 'john@example.com', name: 'John Doe' };

    // Act
    const result = mapUserToResponse(user, 1);

    // Assert
    expect(result).toEqual(expected);
  });

  it('maps version 2 user responses to extended identity fields', () => {
    // Act
    const result = mapUserToResponse(user, 2);

    // Assert
    expect(result).toEqual(user);
  });
});
