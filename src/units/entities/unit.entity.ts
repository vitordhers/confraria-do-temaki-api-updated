import { IUnit } from '../../shared/interfaces/unit.interface';

export class DbUnit implements IUnit {
  id: string;
  name: string;
  location: string;
  address: string;
  telephone: string;
  workingHours: string[];
  lat: number;
  lng: number;
  whatsapp?: string;
}
