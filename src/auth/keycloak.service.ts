// keycloak.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KeycloakParamsDto } from './dto/keycloak-params.dto';
import client from 'openid-client';
import { KeycloakConfig } from './keycloak.config';
import { TokensDto } from './dto/tokens.dto';
import { KeycloakPayload } from './dto/keycloak-payload.dto';
import { User } from '@app/users/entities/user.entity';
import { UsersService } from '@app/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoggedInDto } from './dto/logged-in.dto';

@Injectable()
export class KeycloakService {
  private config: client.Configuration;

  constructor(
    private keycloakConfig: KeycloakConfig,
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  /**
   * Helper to safely resolve a configuration value coming from Configify or fallback to process.env.
   * Trims the value and throws with a clear message if still not present.
   */
  private requireEnv(name: string, current?: string): string {
    const fromEnv = process.env[name];
    const value = (current ?? fromEnv ?? '').trim();
    if (!value) {
      // Provide quick snapshot of whether process.env had the key for troubleshooting.
      const hasInProcessEnv =
        Object.prototype.hasOwnProperty.call(process.env, name) === true;
      throw new Error(
        `Keycloak configuration error: ${name} is not defined. (${name} in process.env: ${hasInProcessEnv ? 'present-but-empty' : 'absent'}) Set it in your environment (.env).`,
      );
    }
    return value;
  }

  private async getConfig() {
    // if discovery already then return config
    if (this.config) {
      return this.config;
    }

    // read config
    const issuer = this.requireEnv('OAUTH2_ISSUER', this.keycloakConfig.issuer);
    const clientId = this.requireEnv(
      'OAUTH2_CLIENT_ID',
      this.keycloakConfig.clientId,
    );
    const clientSecret = this.requireEnv(
      'OAUTH2_CLIENT_SECRET',
      this.keycloakConfig.clientSecret,
    );

    // defensive validations for clearer diagnostics
    if (!/^https?:\/\//i.test(issuer)) {
      throw new Error(
        `Keycloak configuration error: OAUTH2_ISSUER must be an absolute URL (starting with http/https). Current value: "${issuer}"`,
      );
    }

    const server = new URL(issuer);

    // discovery
    this.config = await client.discovery(server, clientId, clientSecret);

    // this config
    return this.config;
  }

  async getRedirectLoginUrl(): Promise<KeycloakParamsDto> {
    // state & codeVerifier are rand

    const state = client.randomState();
    const codeVerifier = client.randomPKCECodeVerifier();

    // url build from config & params
    const redirectUri = this.requireEnv(
      'OAUTH2_CALLBACK_URL',
      this.keycloakConfig.callbackUrl,
    );
    const scope = this.requireEnv('OAUTH2_SCOPE', this.keycloakConfig.scope);
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const parameters: Record<string, string> = {
      redirect_uri: redirectUri,
      scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    };

    const config = await this.getConfig();
    const redirectTo: URL = client.buildAuthorizationUrl(config, parameters);

    return { state, codeVerifier, url: decodeURIComponent(redirectTo.href) };
  }

  async login(
    keycloakParamDto: KeycloakParamsDto,
  ): Promise<{ idToken: string; tokensDto: TokensDto }> {
    console.log('keycloakParamDto', keycloakParamDto);

    // get idToken & keycloakPayload
    const { idToken, keycloakPayload } =
      await this.authorizationByCode(keycloakParamDto);

    // upsert user by keycloak id
    const user: User = await this.usersService.upsertByKeycloakId(
      keycloakPayload.preferred_username,
      keycloakPayload.sub,
    );

    // prepare loggedInDto
    const loggedInDto: LoggedInDto = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // generateTokens
    const tokensDto = this.authService.generateTokens(loggedInDto);

    return { idToken, tokensDto };
  }

  // private async authorizationByCode(
  //   keycloakParamDto: KeycloakParamsDto,
  // ): Promise<{ idToken: string; keycloakPayload: KeycloakPayload }> {
  //   // verify code that send from front-end by pkceCodeVerifier & state
  //   const tokens: client.TokenEndpointResponse =
  //     await client.authorizationCodeGrant(
  //       await this.getConfig(),
  //       new URL(
  //         `${this.requireEnv('OAUTH2_CALLBACK_URL', this.keycloakConfig.callbackUrl)}?state=${keycloakParamDto.state}&code=${keycloakParamDto.codeVerifier}&url=${keycloakParamDto.url}`,
  //       ),
  //       {
  //         pkceCodeVerifier: keycloakParamDto.codeVerifier,
  //         expectedState: keycloakParamDto.state,
  //       },
  //     );

  //   // check id_toke
  //   if (!tokens.id_token) {
  //     throw new UnauthorizedException(`tokens.id_token should not blank`);
  //   }

  //   // return idToken & keycloakPayload
  //   const idToken = tokens.id_token;
  //   const decoded: unknown = this.jwtService.decode(idToken);
  //   if (!decoded || typeof decoded !== 'object') {
  //     throw new UnauthorizedException('Invalid id token payload');
  //   }
  //   const keycloakPayload: KeycloakPayload = decoded as KeycloakPayload;

  //   return { idToken, keycloakPayload: keycloakPayload };
  // }

  private async authorizationByCode(
    keycloakParamDto: KeycloakParamsDto,
  ): Promise<{ idToken: string; keycloakPayload: KeycloakPayload }> {
    // keycloakParamDto.url currently contains ONLY the query string fragment returned to the SPA (e.g. "state=...&session_state=...&code=...")
    // We must NOT pass it to new URL() directly (it would throw). Instead, reconstruct the original callback URL.
    const callbackUrl = this.requireEnv(
      'OAUTH2_CALLBACK_URL',
      this.keycloakConfig.callbackUrl,
    );

    // Normalize & parse search params
    const rawQuery = keycloakParamDto.url.startsWith('?')
      ? keycloakParamDto.url.slice(1)
      : keycloakParamDto.url;
    const searchParams = new URLSearchParams(rawQuery);

    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');

    if (!code) {
      throw new UnauthorizedException(
        'Missing "code" parameter in Keycloak callback query string',
      );
    }
    if (!returnedState) {
      throw new UnauthorizedException(
        'Missing "state" parameter in Keycloak callback query string',
      );
    }
    if (returnedState !== keycloakParamDto.state) {
      throw new UnauthorizedException('State mismatch (potential CSRF)');
    }

    // Reconstruct the full callback URL exactly as Keycloak originally invoked it
    const fullCallbackUrl = new URL(
      `${callbackUrl}?${searchParams.toString()}`,
    );

    // Exchange authorization code for tokens (PKCE)
    const tokens: client.TokenEndpointResponse =
      await client.authorizationCodeGrant(
        await this.getConfig(),
        fullCallbackUrl,
        {
          pkceCodeVerifier: keycloakParamDto.codeVerifier,
          expectedState: keycloakParamDto.state,
        },
      );

    // check id_toke
    if (!tokens.id_token) {
      throw new UnauthorizedException(`tokens.id_token should not blank`);
    }

    // return idToken & keycloakPayload
    const idToken = tokens.id_token;
    const decoded: unknown = this.jwtService.decode(idToken);
    if (!decoded || typeof decoded !== 'object') {
      throw new UnauthorizedException('Invalid id token payload');
    }
    const keycloakPayload: KeycloakPayload = decoded as KeycloakPayload;

    return { idToken, keycloakPayload: keycloakPayload };
  }
}
