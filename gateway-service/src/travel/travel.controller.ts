import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTravelDto } from '../common/dto/travel/rest/create-travel-request.dto';
import { UpdateTravelDto } from '../common/dto/travel/rest/update-travel-request.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { Metadata } from '@grpc/grpc-js';
import { SubmitRevisionDto } from 'src/common/dto/travel/rest/submit-revision.dto';
import { TravelRecordResponseDto } from 'src/common/dto/travel/rest/travel-response.dto';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';

@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTravel(
    @Body() createTravelDto: CreateTravelDto,
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    createTravelDto.userId = createTravelDto.userId;
    return this.travelService.createTravel(createTravelDto, metadata);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'tourist')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTravel(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: Request,
  ): Promise<TravelRecordResponseDto> {
    const metadata = this.createMetadata(request);
    return this.travelService.getTravel(id, metadata);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'tourist')
  @UsePipes(new ValidationPipe({ transform: true }))
  listTravels(
    @Body()
    listTravelsDto: {
      page: number;
      limit: number;
      sort: string;
      sortOrder: string;
    },
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    return this.travelService.listTravels(
      listTravelsDto.page,
      listTravelsDto.limit,
      listTravelsDto.sort,
      listTravelsDto.sortOrder,
      metadata,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateTravel(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateTravelDto: UpdateTravelDto,
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    updateTravelDto.id = id;
    return this.travelService.updateTravel(updateTravelDto, metadata);
  }

  @Post('submit-revision/:id')
  @UseGuards(AuthGuard)
  @Roles('tourist')
  @UsePipes(new ValidationPipe({ transform: true }))
  submitRevision(
    @Param('id', PositiveIntPipe) id: number,
    @Body() submitRevisionDto: SubmitRevisionDto,
    @Req() request: Request,
  ) {
    const touristId = Number(request.user?.sub);
    const metadata = this.createMetadata(request);
    submitRevisionDto.id = id;
    return this.travelService.submitRevision(submitRevisionDto, metadata, touristId);
  }

  @Post('approve-revision/:id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  approveRevision(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    return this.travelService.approveRevision(id, metadata);
  }

  @Post('reject-revision/:id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  rejectRevision(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    return this.travelService.rejectRevision(id, metadata);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  deleteTravel(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: Request,
  ) {
    const metadata = this.createMetadata(request);
    return this.travelService.deleteTravel(id, metadata);
  }

  private createMetadata(request: Request): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', request.user?.sub);
    metadata.add('role', request.user?.role);
    return metadata;
  }
}
