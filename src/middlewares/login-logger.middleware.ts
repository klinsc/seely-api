// login-logger.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoginLoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ip, headers, body } = req;
    const userAgent = headers['user-agent'] || '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const username = body?.username || req?.query['state'] || 'unknown';

    this.logger.log(
      `IP:${ip}, Agent:${userAgent}, Username: ${username}`,
      LoginLoggerMiddleware.name,
    );

    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode === 401 || statusCode === 404 || statusCode === 405) {
        this.logger.warn(
          `IP:${ip}, Agent:${userAgent}, Username: ${username} - ${statusCode}`,
          LoginLoggerMiddleware.name,
        );
      }
    });

    next();
  }
}
