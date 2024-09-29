import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUserRoleByIdDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  id: number;
}