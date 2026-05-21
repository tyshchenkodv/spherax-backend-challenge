import type { IUser } from '../interfaces/user.interface';

export type UserV1Response = Pick<IUser, 'id' | 'email' | 'name'>;

export type UserV2Response = IUser;

export type UserResponse = UserV1Response | UserV2Response;
