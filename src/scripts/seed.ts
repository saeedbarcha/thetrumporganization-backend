import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserSeederService } from 'src/seeds/user.seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seederUser = app.get(UserSeederService);

;
  await seederUser.seed();

  console.log('Seeding completed');
  await app.close();
}

bootstrap();
