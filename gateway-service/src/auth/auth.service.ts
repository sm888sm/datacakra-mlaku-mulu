import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, from, map } from 'rxjs';
import { LoginDto } from '../common/dto/auth/login-request.dto';
import { SignUpDto } from '../common/dto/auth/signup-request.dto';
import { SignUpResponseDto } from '../common/dto/auth/signup-response.dto';
import { LoginResponseDto } from '../common/dto/auth/login-response.dto';
import { GetUserResponseDto } from '../common/dto/auth/getuser-response.dto';
import { mapGrpcErrorToHttpException } from '../common/utils/grpc-error.util';

interface AuthServiceGrpc {
  getUserById(data: { id: number }): Observable<any>;
  signUp(data: SignUpDto): Observable<any>;
  login(data: LoginDto): Observable<any>;
  validateToken(data: { token: string }): Observable<{ is_valid: boolean }>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceGrpc: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authServiceGrpc =
      this.client.getService<AuthServiceGrpc>('AuthService');
  }

  signUp(signUpDto: SignUpDto): Observable<SignUpResponseDto> {
    return from(
      this.handleGrpcRequest<SignUpResponseDto>(() =>
        this.authServiceGrpc.signUp(signUpDto),
      ),
    );
  }

  login(loginDto: LoginDto): Observable<LoginResponseDto> {
    try {
      return this.authServiceGrpc.login(loginDto).pipe(
        map((response) => ({
          id: response.id.low,
          token: response.token,
        })),
      );
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  getUser(id: number): Observable<GetUserResponseDto> {
    return from(
      this.handleGrpcRequest<GetUserResponseDto>(() =>
        this.authServiceGrpc.getUserById({ id }),
      ),
    );
  }

  private async handleGrpcRequest<T>(
    grpcCall: () => Observable<any>,
  ): Promise<T> {
    try {
      const response = await grpcCall().toPromise();
      return this.transformResponse<T>(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  private transformResponse<T>(response: any): T {
    if (response.id) {
      return {
        id: response.id.low,
        username: response.username,
        fullname: response.fullname,
        role: response.role,
      } as unknown as T;
    }
    return response as T;
  }
}
