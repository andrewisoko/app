import { Controller,Get,Param,Delete,Request,Post,Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserType } from './entity/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from './entity/user.entity';
import { Roles } from 'src/roles/roles.decorator';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { UseGuards } from '@nestjs/common';
import { RegisterDto } from './signUp.signIn/registerDto';
import * as bcrypt from 'bcrypt';
import { SignUpSignInService } from './signUp.signIn/signup.signin.service';
import { LoginDto } from './signUp.signIn/loginDto';

@Controller('user')
export class UserController {
    constructor( 
        private readonly userService:UserService,
        private readonly signUpSingIn:SignUpSignInService,

    ){}

    /**********************/
        /*SignUp/SignIn*/
    /**********************/

    @Post('register')
         async createUser(
            @Body() registerDto:RegisterDto
            ): Promise<User> {
                
                const hashedpassword = await bcrypt.hash( registerDto.password,10 );
                const randomFour = Math.floor(Math.random() * 90000) + 10000;
                const userName = registerDto.name.slice( 0,3 ) + registerDto.surname + randomFour.toString();

               
                const mobileNumber = registerDto.mobile_number ?? registerDto.mobileNumber;
                return this.userService.createUser({
                    role:Role.USER,
                    user_type:UserType.COMPETED,
                    name:registerDto.name,
                    surname:registerDto.surname,
                    mobile_number:mobileNumber,
                    user_name:userName,
                    email:registerDto.email,
                    password:hashedpassword,
                })
            }

    @Post('login')
        async login(
        @Body() loginDto:LoginDto
        ){
            const user = await this.signUpSingIn.validateUser(loginDto.email,loginDto.password)
            return this.signUpSingIn.login(user)
        }
    
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Post('add-recipients')
        async addRecipients(
            @Body() userNameRecipient:string,
            @Request() req
        ): Promise<string> {
            const { username } = req.user_name
            return await this.userService.addRecipient(
                username,
                userNameRecipient
            )
        }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Get(':id/recipients/:recipientUsername')
        async getRecipient(
            @Param('id') id: string,
            @Param('recipientUsername') recipientUsername: string
        ): Promise<string> {
            return await this.userService.getRecipient(id, recipientUsername);
        }


    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Delete(':id/recipients/:recipientUsername')
        async deleteRecipient(
            @Param('id') id: string,
            @Param('recipientUsername') recipientUsername: string,
            @Request() req
        ): Promise<string> {
            const userId = req.user.id;
            if (req.user.role !== Role.ADMIN && userId !== id) {
                throw new UnauthorizedException('Cannot delete recipients for another user');
            }
            return await this.userService.deleteRecipient(id, recipientUsername);
        }

    /**********************/
             /*Users*/
    /**********************/


    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Get(':id')
        findUser(@Param('id') id:string):Promise<User|null>{
            return this.userService.findUserById(id)
        }
    
        
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Delete(':id')
        deleteUser(
        @Param('id') idUser:string,
        @Request() req
        ){
            const {id} = req.user
            if(req.user.role === Role.ADMIN){
                return this.userService.deleteUser(idUser) 
                // return "User Successfully deleted"
            };

            if(idUser != id) throw new UnauthorizedException("id not belonging to account")
                // return "User Successfully deleted"
            return this.userService.deleteUser(idUser) 
    }
}
