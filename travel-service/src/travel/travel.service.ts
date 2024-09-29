import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Travel } from '../common/entities/travel.entity';
import { CreateTravelDto } from '../common/dto/requests/create-travel.dto';
import { UpdateTravelDto } from '../common/dto/requests/update-travel.dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class TravelService {
  constructor(
    @InjectRepository(Travel)
    private readonly travelRepository: Repository<Travel>,
  ) {}

  async createTravel(
    createTravelDto: CreateTravelDto,
    userId: number,
    userRole: string,
  ): Promise<Travel> {
    try {
      if (userRole !== 'admin') {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Only admins can create travel records',
        });
      }

      const travel = this.travelRepository.create({
        ...createTravelDto,
        user: { id: Number(createTravelDto.userId) },
      });

      await this.travelRepository.save(travel);
      return travel;
    } catch (error) {
      console.error('Internal server error:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async findOneTravel(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<Travel> {
    try {
      const travel = await this.travelRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!travel) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Travel log/item not found',
        });
      }

      if (userRole === 'admin' || travel.user.id === Number(userId)) {
        return travel;
      } else {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Unauthorized',
        });
      }
    } catch (error) {
      console.error('Internal server error:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async findAllTravels(
    userId: number,
    userRole: string,
    page: number,
    limit: number,
    sort: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ travels: Travel[]; totals: number }> {
    try {
      const query = this.travelRepository
        .createQueryBuilder('travel')
        .leftJoinAndSelect('travel.user', 'user');
  
      if (userRole !== 'admin') {
        query.where('travel.userId = :userId', { userId: Number(userId) });
      }
  
      if (sort === 'createdDate') {
        query.orderBy('travel.createdDate', sortOrder);
      } else if (sort === 'editedDate') {
        query.orderBy('travel.editRequestDate', sortOrder);
      } else {
        query.orderBy('travel.createdDate', sortOrder);
      }
  
      query.skip((page - 1) * limit).take(limit);
  
      const [travels, totals] = await query.getManyAndCount();
      return { travels, totals };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message,
      });
    }
  }

  async updateTravel(
    id: number,
    updateTravelDto: UpdateTravelDto,
    userId: number,
    userRole: string,
  ): Promise<Travel> {
    try {
      if (userRole !== 'admin') {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Only admins can update travel records',
        });
      }

      const travel = await this.travelRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!travel) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Travel log/item not found',
        });
      }

      travel.startDate = new Date(updateTravelDto.startDate);
      travel.endDate = new Date(updateTravelDto.endDate);
      travel.destination = updateTravelDto.destination;
      travel.proposedStartDate = updateTravelDto.proposedStartDate
        ? new Date(updateTravelDto.proposedStartDate)
        : null;
      travel.proposedEndDate = updateTravelDto.proposedEndDate
        ? new Date(updateTravelDto.proposedEndDate)
        : null;
      travel.proposedDestination = updateTravelDto.proposedDestination;
      travel.editRequestDate = updateTravelDto.editRequestDate
        ? new Date(updateTravelDto.editRequestDate)
        : null;
      travel.updatedDate = new Date();

      return await this.travelRepository.save(travel);
    } catch (error) {
      console.error('Internal server error:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async submitRevision(
    id: number,
    proposedStartDate: Date,
    proposedEndDate: Date,
    proposedDestination: string,
    userId: number,
    userRole: string,
  ): Promise<Travel> {
    const travel = await this.travelRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!travel) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Travel log/item not found',
      });
    }

    if (travel.user.id !== userId) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message:
          'You do not have permission to submit a revision for this travel log',
      });
    }

    travel.proposedStartDate = proposedStartDate;
    travel.proposedEndDate = proposedEndDate;
    travel.proposedDestination = proposedDestination;
    travel.editRequestDate = new Date();

    return await this.travelRepository.save(travel);
  }

  async approveRevision(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<{ message: string }> {
    try {
      if (userRole !== 'admin') {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Only admins can approve revisions',
        });
      }

      const travel = await this.travelRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!travel) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Travel log/item not found',
        });
      }

      if (
        !travel.proposedStartDate &&
        !travel.proposedEndDate &&
        !travel.proposedDestination
      ) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'No proposed revisions to approve',
        });
      }

      travel.startDate = travel.proposedStartDate || travel.startDate;
      travel.endDate = travel.proposedEndDate || travel.endDate;
      travel.destination = travel.proposedDestination || travel.destination;
      travel.proposedStartDate = null;
      travel.proposedEndDate = null;
      travel.proposedDestination = null;
      travel.editRequestDate = null;
      travel.updatedDate = new Date();

      await this.travelRepository.save(travel);

      return { message: 'Travel record changes successfully approved' };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      console.log('error', error);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async rejectRevision(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<{ message: string }> {
    if (userRole !== 'admin') {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Only users with admin role can reject revisions',
      });
    }

    const travel = await this.travelRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!travel) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Travel log/item not found',
      });
    }

    if (
      !travel.proposedStartDate &&
      !travel.proposedEndDate &&
      !travel.proposedDestination
    ) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'No proposed revisions to reject',
      });
    }

    travel.proposedStartDate = null;
    travel.proposedEndDate = null;
    travel.proposedDestination = null;
    travel.editRequestDate = null;
    
    
    await this.travelRepository.save(travel);

    return { message: 'Travel record changes successfully rejected' };
  }
  catch(error) {
    console.error('Internal server error:', error);
    if (error instanceof RpcException) {
      throw error;
    }
    throw new RpcException({
      code: status.INTERNAL,
      message: 'Internal server error',
    });
  }

  async deleteTravel(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    try {
      if (userRole !== 'admin') {
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: 'Only admins can remove travel records',
        });
      }

      const travel = await this.travelRepository.findOne({
        where: { id },
      });

      if (!travel) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Travel log/item not found',
        });
      }

      await this.travelRepository.remove(travel);
    } catch (error) {
      console.error('Internal server error:', error);
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
