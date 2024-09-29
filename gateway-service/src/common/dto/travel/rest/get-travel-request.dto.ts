import { IsInt, IsPositive } from 'class-validator';

export class GetTravelRequestDto {
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  id: number;
}