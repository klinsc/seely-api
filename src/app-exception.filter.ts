// app-exception.filter.ts
import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AppExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // QueryFailedError
    if (exception instanceof QueryFailedError) {
      const message: string = exception.message;
      if (message.includes('duplicate key value')) {
        const driverError: unknown = (exception as QueryFailedError)
          .driverError;
        let detail: string | undefined;
        if (
          driverError &&
          typeof driverError === 'object' &&
          'detail' in driverError
        ) {
          const d = (driverError as { detail?: unknown }).detail;
          if (typeof d === 'string') {
            detail = d;
          }
        }
        super.catch(
          new ConflictException(detail ?? 'Duplicate key value'),
          host,
        );
        return;
      }
    }

    // other exceptions
    super.catch(exception, host);
  }
}
