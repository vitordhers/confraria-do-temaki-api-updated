import { IUnit } from '../../shared/interfaces/unit.interface';

export class DbUnit implements IUnit {
  constructor(
    public id: string,
    public name: string,
    public location: string,
    public address: string,
    public telephone: string,
    public workingHours: string[],
    public lat: number,
    public lng: number,
    public whatsapp?: string,
  ) {}
}
