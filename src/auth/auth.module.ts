// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@app/users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { KeycloakController } from './keycloak.controller';
import { KeycloakService } from './keycloak.service';
import { KeycloakConfig } from './keycloak.config';
import { ConfigifyModule } from '@itgorillaz/configify';

@Module({
  imports: [
    ConfigifyModule, // ensure configuration providers (KeycloakConfig) are visible in this module
    JwtModule.registerAsync({
      useFactory: () => {
        const jwtOpts: JwtModuleOptions = {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        };
        return jwtOpts;
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController, KeycloakController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    KeycloakService,
    KeycloakConfig,
  ],
})
export class AuthModule {}
