import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  imports: [SharedModule],
  controllers: [TravelController],
  providers: [TravelService, AuthGuard],
})
export class TravelModule {}