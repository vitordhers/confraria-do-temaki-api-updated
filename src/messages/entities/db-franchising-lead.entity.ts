import { InvestmentRange } from '../../shared/enums/investment-range.enum';

export class DbFranchisingLead {
  id: string;
  name: string;
  email: string;
  celphone: string;
  telephone: string;
  city: string;
  state: string;
  investment: InvestmentRange;
  reference: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
}
