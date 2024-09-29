// FILE: src/common/dto/travel/rest/update-travel-request.dto.ts
import { IsInt, IsPositive, IsDateString, IsString, IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEarlierThanStartDate } from '../../../validators/validators';

export class UpdateTravelDto {
  @IsOptional()
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  id?: number;

  @IsString({ message: 'Start date must be a string' })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be in ISO 8601 format' })
  startDate: string;

  @IsString({ message: 'End date must be a string' })
  @IsNotEmpty({ message: 'End date is required' })
  @IsDateString({}, { message: 'End date must be in ISO 8601 format' })
  @Validate(IsNotEarlierThanStartDate, { message: 'End date must not be earlier than start date' })
  endDate: string;

  @IsString({ message: 'Destination must be a string' })
  @IsNotEmpty({ message: 'Destination is required' })
  @Transform(({ value }) => value.toUpperCase())
  destination: string;
}