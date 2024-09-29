import { HttpException, HttpStatus } from '@nestjs/common';
import { status as grpcStatus } from '@grpc/grpc-js';

export function mapGrpcErrorToHttpException(error: any): HttpException {
  if (error && typeof error.code === 'number') {
    const status = error.code;
    const message = error.details || 'Unknown error';

    switch (status) {
      case grpcStatus.INVALID_ARGUMENT:
        return new HttpException(message, HttpStatus.BAD_REQUEST);
      case grpcStatus.ALREADY_EXISTS:
        return new HttpException(message, HttpStatus.CONFLICT);
      case grpcStatus.NOT_FOUND:
        return new HttpException(message, HttpStatus.NOT_FOUND);
      case grpcStatus.UNAUTHENTICATED:
        return new HttpException(message, HttpStatus.UNAUTHORIZED);
      case grpcStatus.PERMISSION_DENIED:
        return new HttpException(message, HttpStatus.FORBIDDEN);
      case grpcStatus.FAILED_PRECONDITION:
        return new HttpException(message, HttpStatus.PRECONDITION_FAILED);
      default:
        return new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  return new HttpException(
    'Internal server error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
