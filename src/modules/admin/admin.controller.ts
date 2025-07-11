import { Controller, UseGuards, Query, Put, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { CreateCountryDto } from '../country/dto/create-country.dto';
import { CountryService } from '../country/country.service';
import { UpdateCountryDto } from '../country/dto/update-country.dto';
import { GetCountryDto } from '../country/dto/get-country.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { VerifyVendorDto } from '../user/dto/verify-vendor.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(
    private readonly countryService: CountryService,
    private readonly userService: UserService,
  ) { }


  // //  vendor api's
  // @Get('vendor/all-vendors')
  // async findAllVendors(
  //   @GetUser() user: User,
  //   @Query('page') page?: number,
  //   @Query('limit') limit?: number,
  //   @Query('is_verified') is_verified?: boolean,
  //   @Query('name') name?: string
  // ): Promise<any> {
  //   return this.userService.findAllVendors(user, {
  //     page: page ? Number(page) : 1,
  //     limit: limit ? Number(limit) : 10,
  //     is_verified,
  //     name,
  //   });
  // }

  // @Put("vendor/verify")
  // verifyVendor(@Body() verifyVendorDto: VerifyVendorDto, @GetUser() user: User): Promise<Omit<User, 'password'>> {
  //   return this.userService.verifyVendor(verifyVendorDto, user);
  // }

  // @Get('vendor/count')
  // vendorCount(@GetUser() user: User) {
  //   return this.userService.getVendorsCounts(user);
  // }
  // user api's
  // @Get('all-users')
  // async findAllUsers(
  //   @GetUser() user: User,
  //   @Query('page') page?: number,
  //   @Query('limit') limit?: number,
  //   @Query('name') name?: string
  // ) {
  //   return this.userService.findAllUsers(user, {
  //     page: page ? Number(page) : 1,
  //     limit: limit ? Number(limit) : 10,
  //     name,
  //   });
  // }

  // @Get('user/count')
  // userCount(@GetUser() user: User) {
  //   return this.userService.getUsersCounts(user);
  // }

  //  country api's
  @Post("country")
  createCountry(@Body() createCountryDto: CreateCountryDto, @GetUser() user: User) {
    return this.countryService.create(createCountryDto, user);
  }

  @Get('country/all-countries')
  async findAllCountries(
    @GetUser() user: User,
    @Query('is_active') isActive?: boolean,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.countryService.findCountries(
      user,
      isActive !== undefined ? isActive : true,
      name,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );
  }

  @Get('country/country-counts')
  getCountriesCounts(@GetUser() user: User) {
    return this.countryService.getCountriesCounts(user);
  }

  @Get('country/:id')
  findOneCountry(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }

  @Put('country/:id')
  updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto, @GetUser() user: User) {
    return this.countryService.updateCountry(+id, updateCountryDto, user);
  }

  @Delete('country/:id')
  removeCountry(@Param('id') id: string, @GetUser() user: User) {
    return this.countryService.remove(+id, user);
  }


}
