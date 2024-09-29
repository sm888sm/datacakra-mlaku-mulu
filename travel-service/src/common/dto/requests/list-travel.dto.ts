export class ListTravelRecordsDto {
    readonly page: number;
    readonly limit: number;
    readonly sort: string;
    readonly sortOrder: 'ASC' | 'DESC';
  }