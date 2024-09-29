import {
  Controller,
  UseFilters,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login-user.dto';
import { SignUpDto } from '../common/dto/signup.dto';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';
import { GetUserByIdDto } from '../common/dto/get-user-by-id.dto';
import { GetUserRoleByIdDto } from '../common/dto/get-user-role-by-id.dto';

@Controller()
@UseFilters(new GrpcExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SignUp')
  async grpcSignUp(data: SignUpDto) {
    try {
      const result = await this.authService.signUp(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('AuthService', 'Login')
  async grpcLogin(data: LoginDto) {
    try {
      const result = await this.authService.login(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('AuthService', 'GetUserById')
  async grpcGetUserById(data: GetUserByIdDto) {
    try {
      const result = await this.authService.getUserById(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('AuthService', 'GetUserRoleById')
  async grpcGetUserRoleById(data: GetUserRoleByIdDto) {
    try {
      const role = await this.authService.getUserRoleById(data);
      return { role };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async grpcValidateToken(data: { token: string }) {
    try {
      const isValid = await this.authService.validateToken(data.token);
      return { isValid };
    } catch (error) {
      throw error;
    }
  }
}
