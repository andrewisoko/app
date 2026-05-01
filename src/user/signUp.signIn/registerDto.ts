import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from "class-validator";


export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{9,14}$/, {
        message: 'mobile_number must be a valid phone number (10 to 15 digits, optional leading +)',
    })
    mobile_number?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{9,14}$/, {
        message: 'mobileNumber must be a valid phone number (10 to 15 digits, optional leading +)',
    })
    mobileNumber?: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;

}