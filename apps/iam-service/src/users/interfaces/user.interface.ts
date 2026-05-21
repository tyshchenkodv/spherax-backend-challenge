import type { UserStatus } from '../enums/user-status.enum';

export interface IUser {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateUserInput {
  email: string;
  name: string;
  status?: UserStatus;
}
