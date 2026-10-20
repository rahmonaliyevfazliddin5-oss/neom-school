import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';
import { PasswordPolicyService } from './password-policy.service';
import { SessionService } from './session.service';
import { BruteForceService } from './brute-force.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    CryptoService,
    PasswordPolicyService,
    SessionService,
    BruteForceService,
  ],
  exports: [
    JwtModule,
    CryptoService,
    PasswordPolicyService,
    SessionService,
    BruteForceService,
  ],
})
export class SecurityModule {}
