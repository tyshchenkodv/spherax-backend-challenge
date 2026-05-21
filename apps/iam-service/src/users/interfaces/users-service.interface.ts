import type { UserStatus } from '../enums/user-status.enum';
import type { ICreateUserInput, IUser } from './user.interface';

export abstract class AbstractUsersService {
  abstract createUser(input: ICreateUserInput): IUser;
  abstract findUsers(): IUser[];
  abstract findUserById(id: string): IUser;
  abstract updateUserStatus(id: string, status: UserStatus): IUser;
  abstract validateNotificationRecipient(userId: string): IUser;
}
