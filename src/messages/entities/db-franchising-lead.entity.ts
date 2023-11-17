import { InvestmentRange } from '../../shared/enums/investment-range.enum';

export class DbFranchisingLead {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public celphone: string,
    public telephone: string,
    public city: string,
    public state: string,
    public investment: InvestmentRange,
    public reference: string,
    public message: string,
    public sentAt: number, // timestamp
    public readAt?: number, // timestamp
  ) {}
}
