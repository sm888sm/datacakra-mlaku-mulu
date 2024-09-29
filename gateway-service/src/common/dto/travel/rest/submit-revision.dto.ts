// FILE: src/common/dto/travel/rest/submit-revision.dto.ts
import { IsInt, IsPositive, IsDateString, IsString, IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEarlierThanStartDate } from '../../../validators/validators';

export class SubmitRevisionDto {
  @IsOptional()
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  id?: number;

  @IsString({ message: 'Proposed start date must be a string' })
  @IsNotEmpty({ message: 'Proposed start date is required' })
  @IsDateString({}, { message: 'Proposed start date must be in ISO 8601 format' })
  proposedStartDate: string;

  @IsString({ message: 'Proposed end date must be a string' })
  @IsNotEmpty({ message: 'Proposed end date is required' })
  @IsDateString({}, { message: 'Proposed end date must be in ISO 8601 format' })
  @Validate(IsNotEarlierThanStartDate, { message: 'Proposed end date must not be earlier than proposed start date' })
  proposedEndDate: string;

  @IsString({ message: 'Proposed destination must be a string' })
  @IsNotEmpty({ message: 'Proposed destination is required' })
  @Transform(({ value }) => value.toUpperCase())
  proposedDestination: string;
}