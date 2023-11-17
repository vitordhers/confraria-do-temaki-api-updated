export class DbMessageContact {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public message: string,
    public sentAt: number,
    public readAt?: number,
  ) {}
}
