import { IsString, IsNotEmpty, Length, Matches, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @Length(5, 20, { message: 'Username must be between 5 and 20 characters' })
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'Username must be alphanumeric' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  username: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  @Matches(/^\S*$/, { message: 'Password must not contain spaces' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  password: string;

  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @Length(6, 100, { message: 'Full name must be between 6 and 100 characters' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  fullname: string;

  @IsString({ message: 'Role must be a string' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['admin', 'tourist'], { message: 'Role must be either admin or tourist' })
  @Transform(({ value }) => value.trim().replace(/\u00A0/g, ''))
  role: string;
}