import type { UserStatus } from '../enums/user-status.enum';
import type { ICreateUserInput, IUser } from './user.interface';

export abstract class AbstractUsersRepository {
  abstract create(input: ICreateUserInput): IUser;
  abstract findAll(): IUser[];
  abstract findById(id: string): IUser | undefined;
  abstract updateStatus(id: string, status: UserStatus): IUser | undefined;
}
