import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../common/guards/auth.guard';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController]
})
export class AuthModule {}