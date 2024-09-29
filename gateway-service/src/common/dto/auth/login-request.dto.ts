import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @Length(5, 20, { message: 'Username must be between 5 and 20 characters' })
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'Username must be alphanumeric' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  username: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  password: string;
}