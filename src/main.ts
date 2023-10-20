import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { setupSwagger } from './config/swagger.config';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
