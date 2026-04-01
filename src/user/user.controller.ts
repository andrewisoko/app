import { Controller,Get,Param,Delete,Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

@Controller('user')
export class UserController {
    constructor( private usersService:UserService){}

    @Get(':id')
        findUser(@Param() id:string):Promise<User|null>{
            return this.usersService.findUserById(id)
        }
    
       @Delete(':id')
       deleteUser(
        @Param() idUser:string,
        @Request() req
    ){
        // const {id} = req.user
        // if(req.user.role === Role.ADMIN){
        //     return this.usersService.deleteUser(idUser) 
        //     // return "User Successfully deleted"
        // };

        // if(idUser != id) throw new UnauthorizedException("id not belonging to account")
        //     // return "User Successfully deleted"
        return this.usersService.deleteUser(idUser) 
    }
 


}
