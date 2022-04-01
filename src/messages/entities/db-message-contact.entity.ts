export class DbMessageContact {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
}
