import { Controller,Get,Param,Delete,Request,Post,Body, Patch } from '@nestjs/common';
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
import type { UpdateDefault } from './user.service';

@Controller('user')
export class UserController {
    constructor( 
        private readonly userService:UserService,
        private readonly signUpSignInService:SignUpSignInService,

    ){}

    /**********************/
        /*SignUp/SignIn*/
    /**********************/

    @Post('register')
         async createUser(
            @Body() registerDto:RegisterDto,
                    initialBalance:number,
            ): Promise<User> {
                
                const hashedpassword = await bcrypt.hash( registerDto.password,10 );
                const randomFour = Math.floor(Math.random() * 90000) + 10000;
                const userName = '@' + registerDto.name.slice( 0,3 ) + registerDto.surname + randomFour.toString();

                const mobileNumber = registerDto.mobile_number ?? registerDto.mobileNumber;

                return this.userService.createUser({
                    role:Role.USER,
                    user_type:UserType.COMPETED,
                    name:registerDto.name,
                    surname:registerDto.surname,
                    mobile_number:mobileNumber,
                    user_name:userName,
                    email:registerDto.email,
                    password:hashedpassword
                }, initialBalance   
                )
            }

    @Post('login')
        async login(@Body() dto: LoginDto) {
        const user = await this.signUpSignInService.validateUser(dto.email, dto.password);
        return this.signUpSignInService.login(user);
        }
    
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Post('add-recipient')
        async addRecipients(
            @Body('userNameRecipient') userNameRecipient:string,
            @Request() req
        ): Promise<string> {
            const { username } = req.user.username
            return await this.userService.addRecipient(
                username,
                userNameRecipient
            )
        }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Get(':id/recipient/:recipientUsername')
        async getRecipient(
            @Param('id') id: string,
            @Param('recipientUsername') recipientUsername: string
        ): Promise<string> {
            return await this.userService.getRecipient(id, recipientUsername);
        }
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Get('/recipients/:id') 
        async getRecipients(
            @Param('id') id: string,
        ): Promise<string[]> {
            return await this.userService.getRecipients(id);
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
    @Get(':username')
        findUserByUsername(@Param('username') username:string):Promise<User|null>{
            return this.userService.findUserByUsername(username)
        }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER)
    @Patch('/update-default/:id')
        async updateDefaultUser(
            @Param() id:string,
            @Body() details:UpdateDefault
        ){

            const hashedpassword = await bcrypt.hash( details.password,10 );
            const randomFour = Math.floor(Math.random() * 90000) + 10000;
            const userName = '@' + details.name.slice( 0,3 ) + details.surname + randomFour.toString();

             return await this.updateDefaultUser(
                id,
                {
                user_type : UserType.COMPETED,
                name : details.name,
                surname : details.surname,
                mobile_number : details.mobile_number,
                user_name : userName,
                email : details.email,
                password : hashedpassword,

             })
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
