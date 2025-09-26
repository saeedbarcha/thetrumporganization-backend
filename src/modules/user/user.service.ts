import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ClientInfo } from './entities/client-info.entity';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AffiliateInFo } from './entities/affilieate-info.entity';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { throwIfError } from 'src/utils/error-handler.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClientInfo)
    private readonly clientInfoRepository: Repository<ClientInfo>,
    @InjectRepository(AffiliateInFo)
    private readonly affiliateInFoRepository: Repository<AffiliateInFo>,
    private jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) { }

  async updateUser(
    updateUserDto: UpdateUserDto,
    user: User,
  ): Promise<Omit<User, 'password'>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id, email, password, old_password, new_password, role } = updateUserDto;

      const updaterUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id, role: user.role }
      });
      throwIfError(!updaterUser, `User not found.`, NotFoundException);

      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: id, role: role }
      });
      throwIfError(!existingUser, `User not found.`, NotFoundException);

      // Role-based update permission
      if (updaterUser.role === UserRoleEnum.ADMIN) {
        throwIfError(existingUser.role !== UserRoleEnum.AFFILIATE, 'Admin can only update affiliate accounts.', UnauthorizedException);
      } else if (updaterUser.role === UserRoleEnum.AFFILIATE) {
        throwIfError(existingUser.role !== UserRoleEnum.CLIENT, 'Affiliate can only update client accounts.', UnauthorizedException);
      } else {
        throwIfError(updaterUser.id !== user.id, 'You are not allowed to update this account.', UnauthorizedException);
      }

      // Update email with validation for uniqueness
      if (email) {
        const emailUser = await this.userRepository.findOne({
          where: { email, id: Not(existingUser.id), role: existingUser.role }, // Check if another user has this email
        });
        throwIfError(
          emailUser,
          'Email is already in use.',
          ConflictException,
        );
        existingUser.email = email;
      }

      // Update other fields
      existingUser.name =
        updateUserDto.name || existingUser.name;
      if (password) {
        existingUser.password =
          await bcrypt.hash(password, 10) || existingUser.password;
      }


      if (existingUser.role === UserRoleEnum.AFFILIATE) {
        const affiliateProfile = await this.affiliateInFoRepository.findOne({
          where: { user: { id: existingUser.id } },
        });
        throwIfError(
          !affiliateProfile,
          'Affiliate information not found.',
          NotFoundException,
        );

        affiliateProfile.phone = updateUserDto.phone || affiliateProfile.phone;
        affiliateProfile.payout_amount =
          updateUserDto.payout_amount || affiliateProfile.payout_amount;
        affiliateProfile.telegram_url =
          updateUserDto.telegram_url || affiliateProfile.telegram_url;
        affiliateProfile.city =
          updateUserDto.city || affiliateProfile.city;
        affiliateProfile.payment_source =
          updateUserDto.payment_source || affiliateProfile.payment_source;
        affiliateProfile.payout_date = updateUserDto.payout_date
          ? new Date(updateUserDto.payout_date)
          : affiliateProfile.payout_date;

        // if (updateUserDto.attachment_id) {
        //   const attachment = await queryRunner.manager.findOne(Attachment, {
        //     where: { id: updateUserDto.attachment_id, is_deleted: false },
        //   });
        //   throwIfError(!attachment, `Attachment not found.`, NotFoundException);
        //   userProfile.attachment = attachment;
        // }
        await queryRunner.manager.save(AffiliateInFo, affiliateProfile);
      }

      if (existingUser.role === UserRoleEnum.CLIENT) {
        const clientProfile = await this.clientInfoRepository.findOne({
          where: { user: { id: existingUser.id } },
        });
        throwIfError(
          !clientProfile,
          'Client information not found.',
          NotFoundException,
        );

        clientProfile.phone = updateUserDto.phone || clientProfile.phone;
        clientProfile.city = updateUserDto?.city || clientProfile?.city;
        clientProfile.telegram_url =
          updateUserDto?.telegram_url || clientProfile?.telegram_url;
        clientProfile.payout_amount =
          updateUserDto?.payout_amount || clientProfile?.payout_amount || 0;
        clientProfile.payment_source =
          updateUserDto?.payment_source || clientProfile?.payment_source;
        clientProfile.payout_date = updateUserDto?.payout_date
          ? new Date(updateUserDto?.payout_date)
          : clientProfile?.payout_date;

        // if (updateUserDto.attachment_id) {
        //   const attachment = await queryRunner.manager.findOne(Attachment, {
        //     where: { id: updateUserDto.attachment_id, is_deleted: false },
        //   });
        //   throwIfError(!attachment, `Attachment not found.`, NotFoundException);
        //   userProfile.attachment = attachment;
        // }
        await queryRunner.manager.save(ClientInfo, clientProfile);
      }

      await queryRunner.manager.save(User, existingUser);
      await queryRunner.commitTransaction();

      return this.findUserById(existingUser.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async findUserById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: id, }
    });
    throwIfError(!user, 'User not found.', NotFoundException);

    // Initialize the data object with basic user fields common to all roles
    const userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    if (user.role === UserRoleEnum.CLIENT) {
      const clientProfile = await this.clientInfoRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['attachment'],
      });
      const affiliateProfile = await this.userRepository.findOne({
        where: { id: user.id }
      });
      userData.name = user.name;
      userData.payout_date = clientProfile?.payout_date || null;
      userData.phone = clientProfile?.phone || null;
      userData.telegram_url = clientProfile?.telegram_url || null;
      userData.city = clientProfile?.city || null;
      userData.payout_amount = clientProfile?.payout_amount || 0;
      userData.payment_source = clientProfile?.payment_source || null;
      userData.profile_image = clientProfile?.attachment
        ? {
          id: clientProfile.attachment.id,
          url: clientProfile.attachment.url,
          type: clientProfile.attachment.file_type,
        }
        : null;
      // Add affiliate info if present
      if (affiliateProfile) {
        userData.affiliate = {
          id: affiliateProfile.id,
          name: affiliateProfile.name,
          email: affiliateProfile.email,
          // Add more fields if needed
        };
      }
    }

    // if (user.role === UserRoleEnum.AFFILIATE) {
    //   const affiliateProfile = await this.affiliateInFoRepository.findOne({
    //     where: { user: { id: user.id } },
    //     relations: ['attachment'],
    //   });

    //   userData.name = user.name;
    //   userData.telegram_url = affiliateProfile?.telegram_url || null;
    //   userData.city = affiliateProfile?.city || null;
    //   userData.payout_amount = affiliateProfile?.payout_amount || 0;
    //   userData.payment_source = affiliateProfile?.payment_source || null;
    //   userData.payout_date = affiliateProfile?.payout_date || null;
    //   userData.phone = affiliateProfile?.phone || null;
    //   userData.profile_image = affiliateProfile?.attachment
    //     ? {
    //       id: affiliateProfile.attachment.id,
    //       url: affiliateProfile.attachment.url,
    //       type: affiliateProfile.attachment.file_type,
    //     }
    //     : null;

    // }
    return userData;
  }

  async getAllAffiliates(user: User): Promise<any[]> {
    throwIfError(user.role !== UserRoleEnum.ADMIN, 'Only admin can access affiliates.', UnauthorizedException);

    const affiliates = await this.userRepository.find({
      where: { role: UserRoleEnum.AFFILIATE, is_deleted: false },
    });

    // Use findUserById for structured data
    const result = [];
    for (const affiliate of affiliates) {
      result.push(await this.findUserById(affiliate.id));
    }
    return result;
  }

  async getAllClients(user: User): Promise<any[]> {
    throwIfError(user.role !== UserRoleEnum.AFFILIATE, 'Only affiliate can access clients.', UnauthorizedException);
    
    try {
      // Query the client_info table to find clients associated with this affiliate
      const clientInfos = await this.clientInfoRepository
        .createQueryBuilder('clientInfo')
        .leftJoinAndSelect('clientInfo.user', 'user')
        .where('clientInfo.affiliate_id = :affiliateId', { affiliateId: user.id })
        .andWhere('user.role = :role', { role: UserRoleEnum.CLIENT })
        .andWhere('user.is_deleted = :isDeleted', { isDeleted: false })
        .getMany();
      
      
      if (clientInfos.length === 0) {
        console.log("No clients found for this affiliate");
        return [];
      }
      
      // Extract the client user IDs
      const clientIds = clientInfos.map(info => info.user.id);

      // Get detailed client data
      const result = [];
      for (const clientId of clientIds) {
        const clientData = await this.findUserById(clientId);
        
        // Set the affiliate property to the current affiliate
        clientData.affiliate = {
          id: user.id,
          name: user.name || user.email, // Use email as fallback if name is null
          email: user.email
        };
        
        result.push(clientData);
      }
      return result;
    } catch (error) {
      return [];
    }
  }

  async updatePassword(
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<{ message: string }> {
    const isUser = await this.userRepository.findOne({
      where: {
        email: updateUserPasswordDto.email,
        role: updateUserPasswordDto.role,
      },
    });
    throwIfError(!isUser, 'User not found.', NotFoundException);

    const hashedPassword = await bcrypt.hash(
      updateUserPasswordDto.password,
      10,
    );
    isUser.password = hashedPassword;
    await this.userRepository.save(isUser);

    return { message: 'Password updated successfully' };
  }

  // async searchIsEmail(searchEmailDto: SearchEmailDto): Promise<string[]> {
  //   const user = await this.userRepository.findOne({
  //     where: { email: searchEmailDto.email, role: searchEmailDto.role },
  //   });

  //   if (user) return [user.email];

  //   const similarEmails = await this.userRepository
  //     .createQueryBuilder('user')
  //     .select('user.email')
  //     .where('user.email LIKE :email', { email: `%${searchEmailDto.email.split('@')[0]}%` })
  //     .andWhere('user.role = :role', { role: searchEmailDto.role })
  //     .limit(3)
  //     .getMany();

  //   return similarEmails.map(user => user.email);
  // }

  // async searchIsEmail(searchEmailDto: SearchEmailDto): Promise<any> {
  //   const user = await this.userRepository.findOne({
  //     where: { email: searchEmailDto.email, role: searchEmailDto.role },
  //   });

  //   // throwIfError(!user, 'Email does not exist', NotFoundException);
  //   if (!user) return [];
  //   return [user.email];
  // }




  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}