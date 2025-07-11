import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CountrySeederService } from 'src/seeds/country.seeder.service';
import { UserSeederService } from 'src/seeds/user.seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seederCountry = app.get(CountrySeederService);
  const seederUser = app.get(UserSeederService);



  await seederCountry.seed();
  await seederUser.seed();




  console.log('Seeding completed');
  await app.close();
}

bootstrap();
