import { Controller, UseGuards, Query, Put, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { VerifyVendorDto } from '../user/dto/verify-vendor.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
  ) { }


}
