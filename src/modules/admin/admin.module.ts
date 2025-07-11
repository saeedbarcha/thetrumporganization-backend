import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Country } from '../country/entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CountryService } from '../country/country.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { AffiliateInFo } from '../user/entities/affilieate-info.entity';
import { ClientInfo } from '../user/entities/client-info.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, AffiliateInFo, ClientInfo, Country]), AuthModule],
  providers: [AuthService, JwtService, CountryService],
  controllers: [AdminController],
  exports: [AuthService, JwtService, CountryService, TypeOrmModule]


})
export class AdminModule { }

