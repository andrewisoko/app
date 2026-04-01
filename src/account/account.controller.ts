import { Controller,Post,Body,Request } from '@nestjs/common';
import { AccountService } from './account.service';
import { NotFoundException } from '@nestjs/common';


@Controller('account')
export class AccountController {
     constructor(private accountService:AccountService,
    ){}

        @Post('create')
    createAccount(
        @Body() createAccountDto:{ currency:string; initialDeposit:string, username?:string; },
        @Request() req
    ){
        const {username} = req.user
        // if(req.user.role === Role.ADMIN){

        //     if(!createAccountDto.username) throw new NotFoundException("username not found")
        //     return this.accountService.createAccount(
        //         createAccountDto.currency,
        //         createAccountDto.initialDeposit,
        //         createAccountDto.username,
        //     )

        // };
        return this.accountService.createAccount(
        createAccountDto.currency,
        createAccountDto.initialDeposit,
        username
     )    
    }
}
