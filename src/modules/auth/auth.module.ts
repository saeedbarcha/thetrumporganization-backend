import { Module } from '@nestjs/common';
import { LocalStrategy } from './jwt-strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt-strategy/jwt.strategy';
import { AuthService } from './auth.service';
import { Attachment } from '../attachment/entities/attachment.entity';
import { UserSeederService } from 'src/seeds/user.seeder.service';
import { User } from '../user/entities/user.entity';
import { AffiliateInFo } from '../user/entities/affilieate-info.entity';
import { ClientInfo } from '../user/entities/client-info.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AffiliateInFo,
      ClientInfo,
      Attachment
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Keyy', 
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserSeederService,
    LocalStrategy,
    JwtStrategy
  ],
  exports: [
    AuthService,
    UserService,
    UserSeederService,
    JwtStrategy
  ],
})
export class AuthModule {}
