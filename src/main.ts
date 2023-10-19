import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);


  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
