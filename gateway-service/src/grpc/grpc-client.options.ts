import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const authGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(__dirname, 'auth.proto'),
    url: process.env.AUTH_SERVICE_URL,
  },
};

export const travelGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'travel',
    protoPath: join(__dirname, 'travel.proto'),
    url: process.env.TRAVEL_SERVICE_URL,
  },
};