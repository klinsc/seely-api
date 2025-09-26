// keycloak.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { KeycloakService } from './keycloak.service';

@Controller('keycloak')
export class KeycloakController {
  constructor(private keycloakService: KeycloakService) {}

  @Get('redirect-to-login')
  async redirectToLogin(@Res({ passthrough: true }) res: Response) {
    // return state, codeVerifier, url
    const { state, codeVerifier, url } =
      await this.keycloakService.getRedirectLoginUrl();

    res.cookie('state', state); // what's req ?
    res.cookie('codeVerifier', codeVerifier); // who're you ?
    // res.redirect(url)  // where's keycloak ?
    return { url };
  }

  @Get('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const state = req.cookies?.state as string | undefined;
    const codeVerifier = req.cookies?.codeVerifier as string | undefined;
    const url = (req.originalUrl ?? '').split('?')[1] || '';

    if (!state) {
      console.error('state is undefined');
      return { accessToken: '' };
    }

    if (!codeVerifier) {
      console.error('codeVerifier is undefined');
      return { accessToken: '' };
    }

    const { idToken, tokensDto } = await this.keycloakService.login({
      state,
      codeVerifier,
      url,
    });

    res.cookie('idToken', idToken);
    res.cookie('refreshToken', tokensDto.refreshToken);

    res.clearCookie('state');
    res.clearCookie('codeVerifier');

    return { accessToken: tokensDto.accessToken };
  }
}
