export class TravelRecordResponseDto {
    readonly id: number;
    readonly userId: number;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly destination: string;
    readonly proposedStartDate?: Date;
    readonly proposedEndDate?: Date;
    readonly proposedDestination?: string;
    readonly editRequestDate?: Date;
    readonly createdDate: Date;
    readonly updatedDate: Date;
  }
  
  export class PaginatedTravelRecordsDto {
    readonly records: TravelRecordResponseDto[];
    readonly totalRecords: number;
    readonly totalPages: number;
    readonly currentPage: number;
    readonly itemsPerPage: number;
  }