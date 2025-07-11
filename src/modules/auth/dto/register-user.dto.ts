// src/auth/dto/signup.dto.ts
import { IsString, IsUrl, IsInt, Matches, IsEmail, MinLength, IsArray, MaxLength, IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { PaymentTypeEnum, UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { ValidateIf } from 'class-validator';

export class RegisterDto {

    // @IsNotEmpty({ message: 'User name is required.' })
      @IsOptional()
    @IsString({ message: 'User name must be a string.' })
    name: string;

    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    email: string;

    @IsNotEmpty({ message: 'Password is required.' })
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

    @IsNotEmpty({ message: 'Role is required.' })
    @IsEnum(UserRoleEnum, { message: 'Role must be one of the allowed values.' })
    role: UserRoleEnum;

    @IsOptional()
    @IsString({ message: 'Phone number must be a string.' })
    @Matches(/^[^a-zA-Z]*$/, { message: 'Phone number must not contain any English alphabets.' })
    @MinLength(7, { message: 'Phone number must be at least 7 characters long.' })
    @MaxLength(17, { message: 'Phone number must not exceed 17 characters.' })
    phone: string;

    @IsOptional()
    @IsDateString({}, { message: 'Payout date must be a valid date string.' })
    payout_date?: Date;

    @IsOptional()
    @ValidateIf((o) => o.telegram_url !== '' && o.telegram_url !== null)
    @IsString({ message: 'Telegram URL must be a string.' })
    @Matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, {
        message: 'Telegram URL must be a valid URL.',
    })
    
    @IsOptional()
    @MinLength(5, { message: 'Telegram URL must be at least 5 characters long.' })
    @MaxLength(120, { message: 'Telegram URL must not exceed 100 characters.' })
    telegram_url?: string;

    @IsOptional()
    @IsInt({ message: 'Payout amount must be an integer.' })
    payout_amount?: number;

    @IsOptional()
    @IsInt({ message: 'Country ID must be an integer.' })
    country_id?: number;

     @IsOptional()
    @IsString({ message: 'City must be a string.' })
    city: string;
    
    @IsOptional()
    payment_source: PaymentTypeEnum;

    @IsOptional()
    attachment_id?: number;

}
