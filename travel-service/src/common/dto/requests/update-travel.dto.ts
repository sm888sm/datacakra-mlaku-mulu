export class UpdateTravelDto {
    readonly startDate?: Date;
    readonly endDate?: Date;
    readonly destination?: string;
    readonly proposedStartDate?: Date;
    readonly proposedEndDate?: Date;
    readonly proposedDestination?: string;
    readonly editRequestDate?: Date;
  }