// FILE: src/common/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

interface AuthServiceGrpc {
  getUserRoleById(data: { id: number }): Observable<{ role: string }>;
}

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authServiceGrpc: AuthServiceGrpc;

  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    @Inject('AUTH_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authServiceGrpc = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('Token not found in request headers');
      throw new UnauthorizedException('Token not found');
    }

    try {
      console.log('Token:', token);
      const payload = await this.jwtService.verifyAsync(token);
      console.log('Payload:', payload);
      request.user = payload;
    } catch (err) {
      console.log('JWT Verification Error:', err);
      throw new UnauthorizedException('Invalid token');
    }

    const userId = request.user?.sub;
    if (!userId) {
      return false;
    }

    const userRole = await this.getUserRole(userId);
    request.user.role = userRole;

    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const hasRole = requiredRoles.includes(userRole);
    return hasRole;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      console.log('Authorization header not found');
      return null;
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      console.log('Authorization type is not Bearer');
      return null;
    }
    return token;
  }

  private getUserRole(userId: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.authServiceGrpc.getUserRoleById({ id: userId }).subscribe(
        (response) => {
          resolve(response.role);
        },
        (error) => {
          reject(error);
        },
      );
    });
  }
}