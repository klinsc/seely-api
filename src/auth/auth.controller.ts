// auth.controller.ts
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from './dto/logged-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    res.cookie('refreshToken', refreshToken);
    return { accessToken };
  }

  @UseGuards(AuthGuard('refresh-jwt'))
  @Post('refresh-token')
  refreshToken(@Req() request: { user: LoggedInDto }) {
    return this.authService.refreshToken(request.user);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { logoutUrl: null };
  }
}
