import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    InternalServerErrorException

} from '@nestjs/common';
import { ILike, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AffiliateInFo } from 'src/modules/user/entities/affilieate-info.entity';
import { ClientInfo } from 'src/modules/user/entities/client-info.entity';
import { RegisterDto } from './dto/register-user.dto';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { UserService } from 'src/modules/user/user.service';
import { User } from '../user/entities/user.entity';
import { throwIfError } from 'src/utils/error-handler.util';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UserService,
        private jwtService: JwtService,
        private readonly dataSource: DataSource
    ) { }

    async validateUser(email: string, pass: string, role: UserRoleEnum): Promise<any> {

        throwIfError(![UserRoleEnum.ADMIN, UserRoleEnum.AFFILIATE, UserRoleEnum.CLIENT].includes(role), 'Role is incorrect.');

        const user = await this.userRepository.findOne({
            where: { email: email, role: role }
        });

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, created_at, updated_at, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto) {

        const { email, password, role } = loginUserDto;

        const user = await this.validateUser(email, password, role);

        if (!user) {
            throwIfError(!user, 'Invalid credentials.');
        } else {
            const userInfo = await this.userService.findUserById(user.id);
            const payload = { email: user.email, role: user.role };
            return {
                user: userInfo,
                access_token: this.jwtService.sign(payload)
            };
        }
    }

    async logout(user: User) {
        return { message: 'Logged out successfully' };
    }

    async register(loginUser: User, registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
        if (registerDto.role === UserRoleEnum.AFFILIATE) {
            throwIfError(loginUser.role !== UserRoleEnum.ADMIN, 'Only admins can register affiliates.');
        } else if (registerDto.role === UserRoleEnum.CLIENT) {
            throwIfError(loginUser.role !== UserRoleEnum.AFFILIATE, 'Only affiliates can register clients.');
        } else {
            throwIfError(true, 'You are not allowed to register this user type.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                name,
                email,
                password,
                role,
                attachment_id,
                ...rest
            } = registerDto;

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User();
            user.name = name;
            user.email = email;
            user.password = hashedPassword;
            user.role = role;

            const savedUser = await queryRunner.manager.save(user);

            // Handle User Profile for Regular Users
            if (role === UserRoleEnum.CLIENT) {
                throwIfError(!rest.payout_date, 'Date of Birth is required.');
                const clientInfo = new ClientInfo();
                clientInfo.phone = rest?.phone;
                clientInfo.payout_date = rest?.payout_date;
                clientInfo.user = savedUser;
                clientInfo.telegram_url = rest?.telegram_url;
                clientInfo.city = rest?.city;
                clientInfo.payout_amount = rest?.payout_amount || 0;
                clientInfo.payment_source = rest?.payment_source;

                clientInfo.affiliate_id = loginUser;

                if (attachment_id) {
                    const attachment = await queryRunner.manager.findOne(Attachment, { where: { id: attachment_id } });
                    if (attachment) {
                        clientInfo.attachment = attachment;
                    }
                }

                await queryRunner.manager.save(clientInfo);
            }

            // Handle Vendor Info for Vendors
            if (role === UserRoleEnum.AFFILIATE) {
                const affiliateInFo = new AffiliateInFo();
                affiliateInFo.user = savedUser;
                await queryRunner.manager.save(affiliateInFo);
            }

            await queryRunner.commitTransaction();

            return this.userService.findUserById(savedUser.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (error.detail && error.detail.includes('email')) {
                throw new ConflictException('Email is already in use.');
            } else if (error.detail && error.detail.includes('phone')) {
                throw new ConflictException('Phone number is already in use.');
            }
            else if (error.code === '23505') {
                throw new BadRequestException('Duplicate entry detected. Please ensure that the provided information is unique.');
            } else {
                throw new InternalServerErrorException(`Failed to register user: ${error.message}`);
            }
        } finally {
            await queryRunner.release();
        }
    }

    async findOneByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ where: { email } });
    }


}
