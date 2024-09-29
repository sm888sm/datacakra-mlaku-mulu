import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginDto {
  username: string;
  
  password: string;
}