import { Controller, Get, Query, Post, Res, Put, UseGuards, Req, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { SearchEmailDto } from './dto/search-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('user')
export class UserController {
  private readonly frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000';
  constructor(
    private readonly userService: UserService,) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Request() req) {
    return this.userService.findUserById(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('affiliates')
  async getAllAffiliates(@GetUser() user: User) {
    return this.userService.getAllAffiliates(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('clients')
  async getAllClients(
    @GetUser() user: User
  ) {
    const result = await this.userService.getAllClients(user);
    return result;
  }

  // update user/vendor
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateUser(updateUserDto, user);
  }

  // update password
  @Put('update-password')
  async updatePassword(@Body() updateUserPasswordDto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(updateUserPasswordDto);
  }

  // logout
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    response.clearCookie('token');
    return { messages: "Logout successfully" };
  }


}

