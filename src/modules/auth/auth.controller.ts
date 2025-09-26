import { Controller, Get, Put, Query, Post, UseGuards, Res, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'

@Controller('auth')
export class AuthController {


    constructor(
        private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('register')
    async register(@GetUser() user: User, @Body() registerDto: RegisterDto) {
        return this.authService.register(user, registerDto);
    }

    @Put()
    async logout(@GetUser() user: User) {
        return this.authService.logout(user);
    }

}
