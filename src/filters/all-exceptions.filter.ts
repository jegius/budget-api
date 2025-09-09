import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json(exception.getResponse());
        } else {
            this.logger.error(
                `Uncaught exception on ${request.method} ${request.url}`,
                (exception as Error).stack,
            );
            response.status(500).json({
                statusCode: 500,
                message: 'Internal server error',
                timestamp: new Date().toISOString(),
                path: request.url,
            });
        }
    }
}