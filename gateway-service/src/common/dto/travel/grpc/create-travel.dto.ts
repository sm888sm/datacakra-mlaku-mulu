export class Timestamp {
    seconds: number;
    nanos: number;
  }
  
  export class GrpcCreateTravelDto {
    userId: number;
    startDate: Timestamp;
    endDate: Timestamp;
    destination: string;
  }