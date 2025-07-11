import { Module,forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AffiliateInFo } from './entities/affilieate-info.entity';
import { ClientInfo } from './entities/client-info.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { Country } from '../country/entities/country.entity';
import { UserSeederService } from 'src/seeds/user.seeder.service';
import { LocalStrategy } from '../auth/jwt-strategy/local.strategy';
import { JwtStrategy } from '../auth/jwt-strategy/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, AffiliateInFo, ClientInfo, Attachment, Country,]),
    forwardRef(() => AuthModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Keyy', 
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [ UserController],
  providers: [ UserService, UserSeederService, LocalStrategy, JwtStrategy],
  exports: [ UserService, UserSeederService, JwtStrategy],
})
export class UserModule { }
