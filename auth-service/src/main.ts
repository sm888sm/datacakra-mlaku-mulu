import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';
import { ReflectionService } from '@grpc/reflection';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: 'src/grpc/auth.proto',
      url: '0.0.0.0:50051',
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(
        error => `${error.property} has wrong value ${error.value}, ${Object.values(error.constraints).join(', ')}`
      );
      return new BadRequestException(messages);
    },
  }));
  app.useGlobalFilters(new GrpcExceptionFilter());

  await app.listen();
}

bootstrap();