import {
  Injectable,
  Inject,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateTravelDto } from '../common/dto/travel/rest/create-travel-request.dto';
import {
  GrpcCreateTravelDto,
  Timestamp,
} from '../common/dto/travel/grpc/create-travel.dto';
import { UpdateTravelDto } from '../common/dto/travel/rest/update-travel-request.dto';
import { SubmitRevisionDto } from '../common/dto/travel/rest/submit-revision.dto';
import { TravelRecordResponseDto } from '../common/dto/travel/rest/travel-response.dto';
import { Metadata } from '@grpc/grpc-js';
import { mapGrpcErrorToHttpException } from '../common/utils/grpc-error.util';
import { transformGrpcResponse } from '../common/utils/grpc-response.util';

interface TravelServiceGrpc {
  createTravel(data: GrpcCreateTravelDto, metadata: Metadata): Observable<any>;
  getTravel(data: { id: number }, metadata: Metadata): Observable<any>;
  updateTravel(data: any, metadata: Metadata): Observable<any>;
  listTravels(
    data: { page: number; limit: number; sort: string; sortOrder: string },
    metadata: Metadata,
  ): Observable<any>;
  submitRevision(data: any, metadata: Metadata): Observable<any>;
  approveRevision(data: { id: number }, metadata: Metadata): Observable<any>;
  rejectRevision(data: { id: number }, metadata: Metadata): Observable<any>;
  deleteTravel(data: { id: number }, metadata: Metadata): Observable<any>;
}

interface AuthServiceGrpc {
  getUserById(data: { id: number }): Observable<{
    id: number;
    username: string;
    fullname: string;
    role: string;
  }>;
}

@Injectable()
export class TravelService implements OnModuleInit {
  private travelServiceGrpc: TravelServiceGrpc;
  private authServiceGrpc: AuthServiceGrpc;

  constructor(
    @Inject('TRAVEL_PACKAGE') private readonly travelClient: ClientGrpc,
    @Inject('AUTH_PACKAGE') private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.travelServiceGrpc =
      this.travelClient.getService<TravelServiceGrpc>('TravelService');
    this.authServiceGrpc =
      this.authClient.getService<AuthServiceGrpc>('AuthService');
  }

  async createTravel(
    createTravelDto: CreateTravelDto,
    metadata: Metadata,
  ): Promise<TravelRecordResponseDto> {
    const userResponse = await this.authServiceGrpc
      .getUserById({ id: createTravelDto.userId })
      .toPromise();

    if (!userResponse || userResponse.role !== 'tourist') {
      throw new HttpException(
        'User does not exist or is not a tourist',
        HttpStatus.FORBIDDEN,
      );
    }

    const grpcCreateTravelDto: GrpcCreateTravelDto = {
      userId: createTravelDto.userId,
      startDate: this.convertToTimestamp(createTravelDto.startDate),
      endDate: this.convertToTimestamp(createTravelDto.endDate),
      destination: createTravelDto.destination,
    };

    console.log('dto', grpcCreateTravelDto);

    try {
      const response = await this.travelServiceGrpc
        .createTravel(grpcCreateTravelDto, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  private convertToTimestamp(dateInput: string | Date): Timestamp {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: (date.getTime() % 1000) * 1000000,
    };
  }

  async getTravel(
    id: number,
    metadata: Metadata,
  ): Promise<TravelRecordResponseDto> {
    try {
      const response = await this.travelServiceGrpc
        .getTravel({ id }, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async listTravels(
    page: number,
    limit: number,
    sort: string,
    sortOrder: string,
    metadata: Metadata,
  ) {
    try {
      const response = await this.travelServiceGrpc
        .listTravels({ page, limit, sort, sortOrder }, metadata)
        .toPromise();

      return {
        items:
          response.items?.length > 0
            ? response.items.map(transformGrpcResponse)
            : [],
        totals: response.totals.low,
        totalPages: response.totalPages.low,
        currentPage: response.currentPage.low,
        itemsPerPage: response.itemsPerPage.low,
      };
    } catch (error) {
      console.log('error', error);
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async updateTravel(data: any, metadata: Metadata) {
    // Data type any will be changed accordingly
    const transformedData = {
      id: data.id,
      startDate: this.convertToTimestamp(data.startDate),
      endDate: this.convertToTimestamp(data.endDate),
      destination: data.destination,
    };

    try {
      const response = await this.travelServiceGrpc
        .updateTravel(transformedData, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async submitRevision(
    submitRevisionDto: SubmitRevisionDto,
    metadata: Metadata,
    touristId: number,
  ) {
    const userResponse = await this.authServiceGrpc
      .getUserById({ id: touristId })
      .toPromise();

    if (!userResponse || userResponse.role !== 'tourist') {
      throw new HttpException(
        'User does not exist or is not a tourist',
        HttpStatus.FORBIDDEN,
      );
    }
    const transformedData = {
      id: submitRevisionDto.id,
      proposedStartDate: this.convertToTimestamp(
        submitRevisionDto.proposedStartDate,
      ),
      proposedEndDate: this.convertToTimestamp(
        submitRevisionDto.proposedEndDate,
      ),
      proposedDestination: submitRevisionDto.proposedDestination,
    };

    try {
      const response = await this.travelServiceGrpc
        .submitRevision(transformedData, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async approveRevision(id: number, metadata: Metadata) {
    try {
      const response = await this.travelServiceGrpc
        .approveRevision({ id }, metadata)
        .toPromise();
      console.log('response', response);
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async rejectRevision(id: number, metadata: Metadata) {
    try {
      const response = await this.travelServiceGrpc
        .rejectRevision({ id }, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }

  async deleteTravel(id: number, metadata: Metadata) {
    try {
      const response = await this.travelServiceGrpc
        .deleteTravel({ id }, metadata)
        .toPromise();
      return transformGrpcResponse(response);
    } catch (error) {
      throw mapGrpcErrorToHttpException(error);
    }
  }
}
