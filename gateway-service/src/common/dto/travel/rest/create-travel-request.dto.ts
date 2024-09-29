import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEarlierThanStartDate } from '../../../validators/validators';

export class CreateTravelDto {
  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  @Min(1, { message: 'User ID must be a positive number' })
  userId: number;

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