import { Controller, UseFilters } from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTravelDto } from '../common/dto/requests/create-travel.dto';
import { UpdateTravelDto } from '../common/dto/requests/update-travel.dto';
import { ListTravelRecordsDto } from '../common/dto/requests/list-travel.dto';
import { SubmitRevisionDto } from '../common/dto/requests/submit-revision.dto';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';
import { Metadata } from '@grpc/grpc-js';
import Long from 'long';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

@Controller()
@UseFilters(new GrpcExceptionFilter())
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  private toTimestamp(date: Date) {
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: (date.getTime() % 1000) * 1000000,
    };
  }

  private toDate(timestamp: { seconds: number; nanos: number }) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanos / 1000000);
  }

  private extractMetadata(metadata: Metadata) {
    const userId = parseInt(metadata.get('user-id')[0]?.toString(), 10);
    const userRole = metadata.get('role')[0]?.toString();
    return { userId, userRole };
  }

  @GrpcMethod('TravelService', 'CreateTravel')
  async grpcCreateTravel(
    data: {
      userId: Long;
      startDate: Timestamp;
      endDate: Timestamp;
      destination: string;
    },
    metadata: Metadata,
  ) {
    try {
      const touristID = data.userId.toNumber()
      console.log('tour', touristID, data)
      const { userRole } = this.extractMetadata(metadata);
      const createTravelDto: CreateTravelDto = {
        userId: data.userId.toNumber(),
        startDate: this.toDate(data.startDate),
        endDate: this.toDate(data.endDate),
        destination: data.destination,
      };

      const result = await this.travelService.createTravel(
        createTravelDto,
        touristID,
        userRole,
      );

      return {
        ...result,
        startDate: this.toTimestamp(result.startDate),
        endDate: this.toTimestamp(result.endDate),
        createdDate: this.toTimestamp(result.createdDate),
        updatedDate: this.toTimestamp(result.updatedDate),
        userId: result.user.id,
      };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'GetTravel')
  async grpcFindOneTravel(data: { id: Long }, metadata: Metadata) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const travelId = data.id.toNumber();

      const result = await this.travelService.findOneTravel(
        travelId,
        userId,
        userRole,
      );

      return {
        id: result.id,
        userId: result.user.id,
        startDate: this.toTimestamp(result.startDate),
        endDate: this.toTimestamp(result.endDate),
        destination: result.destination,
        proposedStartDate: result.proposedStartDate
          ? this.toTimestamp(result.proposedStartDate)
          : null,
        proposedEndDate: result.proposedEndDate
          ? this.toTimestamp(result.proposedEndDate)
          : null,
        proposedDestination: result.proposedDestination,
        editRequestDate: result.editRequestDate
          ? this.toTimestamp(result.editRequestDate)
          : null,
        createdDate: this.toTimestamp(result.createdDate),
        updatedDate: this.toTimestamp(result.updatedDate),
      };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'ListTravels')
  async grpcFindAllTravels(
    data: { page?: number; limit?: number; sort?: string; sortOrder?: string },
    metadata: Metadata,
  ) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const validSortOrders = ['ASC', 'DESC'];
      const sortOrder = data.sortOrder
        ? validSortOrders.includes(data.sortOrder.toUpperCase())
          ? (data.sortOrder.toUpperCase() as 'ASC' | 'DESC')
          : 'DESC' // Default to DESC if invalid sortOrder is provided
        : 'DESC'; // Default to DESC if sortOrder is not provided

      // Set default values for page, limit, and sort
      const page = Number(data.page) || 1; // Default to 1 if not provided or invalid
      const limit = Number(data.limit) || 10; // Default to 10 if not provided or invalid
      const sort = data.sort ?? 'createdDate'; // Default to 'createdDate' if not provided

      const result = await this.travelService.findAllTravels(
        userId,
        userRole,
        page,
        limit,
        sort,
        sortOrder,
      );

      const travels = result.travels.map((travel) => ({
        id: travel.id,
        userId: travel.user.id,
        startDate: this.toTimestamp(travel.startDate),
        endDate: this.toTimestamp(travel.endDate),
        destination: travel.destination,
        proposedStartDate: travel.proposedStartDate
          ? this.toTimestamp(travel.proposedStartDate)
          : null,
        proposedEndDate: travel.proposedEndDate
          ? this.toTimestamp(travel.proposedEndDate)
          : null,
        proposedDestination: travel.proposedDestination,
        editRequestDate: travel.editRequestDate
          ? this.toTimestamp(travel.editRequestDate)
          : null,
        createdDate: this.toTimestamp(travel.createdDate),
        updatedDate: this.toTimestamp(travel.updatedDate),
      }));

      console.log('Total items:', result.totals);
      console.log('Items per page (limit):', limit);
      console.log("items", travels)

      return {
        items: travels,
        totals: result.totals,
        totalPages: Math.ceil(result.totals / limit),
        currentPage: page,
        itemsPerPage: limit,
      };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'UpdateTravel')
  async grpcUpdateTravel(data: any, metadata: Metadata) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const travelId = data.id.toNumber();

      const updateTravelDto: UpdateTravelDto = {
        startDate: this.toDate(data.startDate),
        endDate: this.toDate(data.endDate),
        destination: data.destination,
        proposedStartDate: data.proposedStartDate
          ? this.toDate(data.proposedStartDate)
          : null,
        proposedEndDate: data.proposedEndDate
          ? this.toDate(data.proposedEndDate)
          : null,
        proposedDestination: data.proposedDestination,
        editRequestDate: data.editRequestDate
          ? this.toDate(data.editRequestDate)
          : null,
      };

      const result = await this.travelService.updateTravel(
        travelId,
        updateTravelDto,
        userId,
        userRole,
      );

      return {
        id: result.id,
        userId: result.user.id,
        startDate: this.toTimestamp(result.startDate),
        endDate: this.toTimestamp(result.endDate),
        destination: result.destination,
        proposedStartDate: result.proposedStartDate
          ? this.toTimestamp(result.proposedStartDate)
          : null,
        proposedEndDate: result.proposedEndDate
          ? this.toTimestamp(result.proposedEndDate)
          : null,
        proposedDestination: result.proposedDestination,
        editRequestDate: result.editRequestDate
          ? this.toTimestamp(result.editRequestDate)
          : null,
        createdDate: this.toTimestamp(result.createdDate),
        updatedDate: this.toTimestamp(result.updatedDate),
      };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'SubmitRevision')
  async grpcSubmitRevision(
    data: {
      id: Long;
      proposedStartDate: Timestamp;
      proposedEndDate: Timestamp;
      proposedDestination: string;
    },
    metadata: Metadata,
  ) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const result = await this.travelService.submitRevision(
        data.id.toNumber(),
        this.toDate(data.proposedStartDate),
        this.toDate(data.proposedEndDate),
        data.proposedDestination,
        userId,
        userRole,
      );

      
      return {
        id: result.id,
        startDate: this.toTimestamp(result.startDate),
        endDate: this.toTimestamp(result.endDate),
        destination: result.destination,
        proposedStartDate: result.proposedStartDate
          ? this.toTimestamp(result.proposedStartDate)
          : null,
        proposedEndDate: result.proposedEndDate
          ? this.toTimestamp(result.proposedEndDate)
          : null,
        proposedDestination: result.proposedDestination,
        editRequestDate: result.editRequestDate
          ? this.toTimestamp(result.editRequestDate)
          : null,
        createdDate: this.toTimestamp(result.createdDate),
        updatedDate: this.toTimestamp(result.updatedDate),
      };
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'ApproveRevision')
  async grpcApproveRevision(data: { id: Long }, metadata: Metadata) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const result = await this.travelService.approveRevision(
        data.id.toNumber(),
        userId,
        userRole,
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'RejectRevision')
  async grpcRejectRevision(data: { id: Long }, metadata: Metadata) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      const result = await this.travelService.rejectRevision(
        data.id.toNumber(),
        userId,
        userRole,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @GrpcMethod('TravelService', 'DeleteTravel')
  async grpcRemoveTravel(data: { id: Long }, metadata: Metadata) {
    try {
      const { userId, userRole } = this.extractMetadata(metadata);
      await this.travelService.deleteTravel(
        data.id.toNumber(),
        userId,
        userRole,
      );
      return { message: 'Travel record successfully deleted' };
    } catch (error) {
      throw error;
    }
  }
}
