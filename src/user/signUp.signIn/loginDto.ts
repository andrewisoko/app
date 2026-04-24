import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class LoginDto{


    @IsNotEmpty()
    @IsEmail({}, { message: 'email must be a valid email address' })
    email:string  

    @IsString()
    @IsNotEmpty()
    password:string  
    
}