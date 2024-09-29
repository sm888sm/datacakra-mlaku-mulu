export class TravelRecordResponseDto {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  destination: string;
  proposedStartDate?: Date;
  proposedEndDate?: Date;
  proposedDestination?: string;
  editRequestDate?: Date;
  createdDate: Date;
  updatedDate: Date;
}

export class PaginatedTravelRecordsDto {
  records: TravelRecordResponseDto[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
