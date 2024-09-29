import { IsInt, IsPositive, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListTravelRecordsDto {
  @IsInt({ message: 'Page must be an integer' })
  @IsPositive({ message: 'Page must be a positive number' })
  page: number;

  @IsInt({ message: 'Limit must be an integer' })
  @IsPositive({ message: 'Limit must be a positive number' })
  limit: number;

  @IsString({ message: 'Sort must be a string' })
  @IsIn(['createdDate', 'editrequestdate'], { message: 'Sort must be either "createdDate" or "editrequestdate"' })
  sort: string;

  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: 'Sort order must be either "ASC" or "DESC"' })
  @Transform(({ value }) => value.toUpperCase())
  sortOrder: 'ASC' | 'DESC';
}