import { IsString, IsUrl, IsArray, Matches, MinLength, IsEmail, MaxLength, IsEnum, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';
import { PaymentTypeEnum, UserRoleEnum } from '../enum/user.role.enum';

export class UpdateUserDto {
    @IsInt({ message: 'ID must be an integer.' })
    id: number;
    @IsOptional()
    @IsString({ message: 'User name must be a string.' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    email: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string.' })
    // @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' }) 
    // @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' }) 
    // @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least one number.' }) 
    // @Matches(/(?=.*[\W_])/, { message: 'Password must include at least one special character (e.g., @, #, +, %, etc).' })
    // @MinLength(8, { message: 'Password must be at least 8 characters long.' }) 
    // @MaxLength(20, { message: 'Password cannot exceed 20 characters.' }) 
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/,
        { message: 'Password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, +, %, etc.).' }
    )
    password: string;

    @IsOptional()
    @IsString({ message: 'Current password must be a string.' })
    old_password: string;

    @IsOptional()
    @IsString({ message: 'New password must be a string.' })
    new_password: string;

    @IsOptional()
    @IsString({ message: 'Phone number must be a string.' })
    @Matches(/^[^a-zA-Z]*$/, { message: 'Phone number must not contain any English alphabets.' })
    @MinLength(7, { message: 'Phone number must be at least 7 characters long.' })
    @MaxLength(17, { message: 'Phone number must not exceed 17 characters.' })
    phone: string;

    @IsNotEmpty({ message: 'Role is required.' })
    @IsEnum(UserRoleEnum, { message: 'Role must be one of the allowed values.' })
    role: UserRoleEnum;

    @IsOptional()
    @IsDateString({}, { message: 'Date of birth must be a valid date string.' })
    payout_date?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Website URL must be a valid URL.' })
    telegram_url?: string;

    @IsOptional()
    @IsInt({ message: 'Country ID must be an integer.' })
    country_id?: number;
   
    @IsOptional()
    @IsInt({ message: 'Payout balance must be an integer.' })
    payout_amount?: number;


    // @IsNotEmpty({ message: 'City is required.' })
    @IsOptional()

    @IsString({ message: 'City must be a string.' })
    city: string;

    @IsOptional()
    payment_source: PaymentTypeEnum;
    // @IsOptional()
    // @IsInt({ message: 'Attachment ID must be an integer.' })
    // attachment_id?: number;

}
