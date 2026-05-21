export interface IValidatedUser {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export abstract class AbstractIamClient {
  abstract validateNotificationRecipient(userId: string): Promise<IValidatedUser>;
}
