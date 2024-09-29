import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { Travel } from '../common/entities/travel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Travel])],
  providers: [TravelService],
  controllers: [TravelController],
})
export class TravelModule {}