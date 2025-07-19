import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { AffiliateInFo } from '../user/entities/affilieate-info.entity';
import { ClientInfo } from '../user/entities/client-info.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, AffiliateInFo, ClientInfo]), AuthModule],
  providers: [AuthService, JwtService],
  controllers: [AdminController],
  exports: [AuthService, JwtService, TypeOrmModule]


})
export class AdminModule { }

