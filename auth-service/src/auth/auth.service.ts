import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { LoginDto } from '../common/dto/login-user.dto';
import { SignUpDto } from '../common/dto/signup.dto';
import { GetUserByIdDto } from '../common/dto/get-user-by-id.dto';
import { GetUserRoleByIdDto } from '../common/dto/get-user-role-by-id.dto';
import { JwtPayload } from '../common/entities/jwt-payload.interface';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Invalid username',
        });
      }
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid password',
        });
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Internal server error:', error); // Log the error for debugging
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<any> {
    try {
      if (!signUpDto.username || !signUpDto.password) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Username and password are required',
        });
      }

      const existingUser = await this.usersRepository.findOne({
        where: { username: signUpDto.username },
      });
      if (existingUser) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Username already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      const user = this.usersRepository.create({
        ...signUpDto,
        password: hashedPassword,
      });
      await this.usersRepository.save(user);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.log('Error:', error);
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { username: loginDto.username },
      });
      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Invalid username',
        });
      }
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid password',
        });
      }
      const payload: JwtPayload = { sub: user.id };
      const token = this.jwtService.sign(payload);
      return {
        id: Number(user.id),
        token: token,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async getUserById(dto: GetUserByIdDto): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: dto.id } });
      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      console.error("Internal server error:", error); // Log the error for debugging
      throw new RpcException({ code: status.INTERNAL, message: 'Internal server error' });
    }
  }

  async getUserRoleById(dto: GetUserRoleByIdDto): Promise<string> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: dto.id } });
      if (!user) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
      }
      return user.role;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      console.error("Internal server error:", error); // Log the error for debugging
      throw new RpcException({ code: status.INTERNAL, message: 'Internal server error' });
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      return !!decoded;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}
