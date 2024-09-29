import { Catch, RpcExceptionFilter, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

function isRpcException(exception: any): exception is RpcException {
  return exception instanceof RpcException;
}

function isHttpException(exception: any): exception is HttpException {
  return exception instanceof HttpException;
}

@Catch(RpcException, HttpException)
export class GrpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException | HttpException, host: ArgumentsHost): Observable<any> {
    let errorResponse;
    let errorStatus = status.UNKNOWN;

    if (isRpcException(exception)) {
      errorResponse = exception.getError();
    } else if (isHttpException(exception)) {
      errorResponse = exception.getResponse();
      errorStatus = exception.getStatus();
      if (exception instanceof BadRequestException) {
        const response = errorResponse as any;
        errorResponse = response.message || response;
        errorStatus = status.INVALID_ARGUMENT;
      }
    }

    return throwError(() => ({
      code: errorStatus,
      message: Array.isArray(errorResponse) ? errorResponse.join(', ') : errorResponse,
    }));
  }
}