import { Controller,Post,Body } from '@nestjs/common';
import { ContractService, contractProps } from './contract.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { InboxService } from 'src/inbox/inbox.service';


@Controller('contract')
    export class ContractController {

    constructor( private readonly contractService:ContractService,
                private readonly inboxService: InboxService

    ){}

        
        @Post('send-contract')  
            sendContract(
                @Body() dataDto: contractProps & Partial<RegisterDto>
            ){
                return this.contractService.sendContract(dataDto,dataDto)
            }
        
        @Post('receiver-inbox-contract')
            ContractReceivedOnInbox(
                @Body() dataDto: { contractId: string, receiverId: string, accepted:boolean }
            ){
                return this.inboxService.ContractReceivedOnInbox(dataDto.contractId,dataDto.receiverId,dataDto.accepted)
            }
}
