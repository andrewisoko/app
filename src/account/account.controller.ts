import { Controller,Post,Body,Request } from '@nestjs/common';
import { AccountService } from './account.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from 'src/user/entity/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';


@Controller('account')
export class AccountController {
     constructor(private accountService:AccountService,
    ){}

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.USER) 
    @Post('create')
    createAccount(
        @Body() createAccountDto:{ currency:string; initialDeposit:number, fullName:string, username?:string; },
        @Request() req
    ){
        const {username} = req.user
        if(req.user.role === Role.ADMIN){

            if(!createAccountDto.username) throw new NotFoundException("username not found")
            return this.accountService.createAccount(
                createAccountDto.currency,
                createAccountDto.initialDeposit,
                createAccountDto.fullName,
                createAccountDto.username,
            )

        };
        return this.accountService.createAccount(
            
        createAccountDto.currency,
        createAccountDto.initialDeposit,
        createAccountDto.fullName,
        username
     )

    }

    // @UseGuards(JwtAuthGuard,RolesGuard)
    // @Roles(Role.ADMIN,Role.USER) 
    @Post('find-account')
    findAccount(
        @Body() dataDto:{ 
            userName: string,
            accountId: number
        }
    ){
        return this.accountService.findAccount(
            dataDto.userName,
            dataDto.accountId
        )
    }

    @Post('top-up')
    topUp(
        @Body() dataDto: { id:string , amount:number }
    ){
        return this.accountService.topUp(
            dataDto.id, dataDto.amount
        )
    }

    
}
