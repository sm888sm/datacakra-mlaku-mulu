import { IsString, IsNotEmpty, IsNumberString, Matches } from 'class-validator';

export class GetUserDto {
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID is required' })
  @IsNumberString({}, { message: 'ID must be a valid number' })
  @Matches(/^[1-9]\d*$/, { message: 'ID must be a positive number' })
  id: string;
}