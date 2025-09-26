import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './modules/common/error-filters/http-exception.filter';
import * as bodyParser from 'body-parser';
// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   
  app.use(bodyParser.json());
  // Global validation pipe configuration
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS with configurations
  app.enableCors({
    origin: '*',
    credentials: false,
  });
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Set global prefix for routes
  app.setGlobalPrefix('api/v1');
  
  // Get port from environment variables or default to 8000
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

bootstrap();
