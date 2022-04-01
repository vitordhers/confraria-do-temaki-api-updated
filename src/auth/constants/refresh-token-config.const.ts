import { ConfigService } from '@nestjs/config';

const strategy = {
  provide: 'REFRESH_TOKEN_STRATEGY_CONFIG',
  useFactory: (configService: ConfigService) => {
    return {
      secret: configService.get<string>('REFRESH_TOKEN_SECRET_PUBLIC'),
    };
  },
  inject: [ConfigService],
};

export default strategy;
