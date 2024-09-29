import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

function isRpcException(exception: any): exception is RpcException {
  return exception instanceof RpcException;
}

@Catch(RpcException)
export class GrpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    let errorResponse: any = {};
    let errorStatus = status.UNKNOWN;

    if (isRpcException(exception)) {
      errorResponse = exception.getError();
      errorStatus = errorResponse.code || status.UNKNOWN;
    }

    const errorDetails = {
      code: errorStatus,
      message: errorResponse.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      path: host.switchToRpc().getContext().get('path'), // Assuming path is set in the context
    };

    return throwError(() => errorDetails);
  }
}