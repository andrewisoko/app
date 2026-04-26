import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from "class-validator";
import { Role, UserType } from "../entity/user.entity";


export class RegisterDto{


    @IsString()
    @IsNotEmpty()
    name:string;

    @IsString()
    @IsNotEmpty()
    surname:string; 

    @IsString()
    @IsOptional()
    userName:string; 

    @IsString()
    @IsOptional()
    userType:UserType; 
    
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{9,14}$/, {
        message: 'mobileNumber must be a valid phone number (10 to 15 digits, optional leading +)'
    })
    mobileNumber: string;


    @IsNotEmpty()
    @IsEmail({}, { message: 'email must be a valid email address' })
    email:string  

    @IsString()
    @IsNotEmpty()
    password:string
    
    @IsString()
    @IsNotEmpty()
    confirmPassword:string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    role:Role
    
}