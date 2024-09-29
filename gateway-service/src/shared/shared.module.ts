// FILE: src/shared/shared.module.ts
import { Module, Logger } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../grpc/auth.proto'),
          url: process.env.AUTH_SERVICE_URL || 'auth-service:50051',
        },
      },
      {
        name: 'TRAVEL_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'travel',
          protoPath: join(__dirname, '../grpc/travel.proto'),
          url: process.env.TRAVEL_SERVICE_URL || 'travel-service:50052',
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    ClientsModule, 
  ],
  exports: [ClientsModule, JwtModule],
})
export class SharedModule {}