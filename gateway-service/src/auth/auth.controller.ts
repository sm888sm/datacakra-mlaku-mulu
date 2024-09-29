import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  UnauthorizedException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/auth/login-request.dto';
import { SignUpDto } from '../common/dto/auth/signup-request.dto';
import { GetUserDto } from '../common/dto/auth/getuser-request.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('user/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUser(@Param() params: GetUserDto, @Req() request: Request) {
    const userIdFromToken = this.extractUserIdFromToken(request);

    if (userIdFromToken !== parseInt(params.id, 10)) {
      throw new UnauthorizedException('You can only access your own user information');
    }

    return this.authService.getUser(userIdFromToken);
  }

  private extractUserIdFromToken(request: Request): number {
    return parseInt(request.user?.sub, 10);
  }
}