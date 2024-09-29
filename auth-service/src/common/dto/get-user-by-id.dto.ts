import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUserByIdDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  id: number;
}