import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class SignUpDto {
  username: string;

  password: string;

  fullname: string;

  role: string;
}