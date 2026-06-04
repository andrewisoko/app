import { Controller,Post,Get,Param,Body } from '@nestjs/common';
import { ContractService, contractProps } from './contract.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { InboxService } from 'src/inbox/inbox.service';
import { Contract } from './entity/contract.entity';


@Controller('contract')
    export class ContractController {

    constructor( private readonly contractService:ContractService,
                private readonly inboxService: InboxService

    ){}

    
        @Get(':id')
            getContract(@Param('id') id: string): Promise<Contract> {
                return this.contractService.getContract(id);
            }
        
        @Post('create-contract')
            createContract(
                @Body() contractData: {
                    contract: Partial<contractProps>,
                    senderAccountId: string,
                    receiverAccountIds: string[]
                }
            ): Promise<Contract> {
                return this.contractService.createContract(
                    contractData.contract,
                    contractData.senderAccountId,
                    contractData.receiverAccountIds
                );
            }
        
        @Post('send-contract')  
            sendContract(
                @Body() dataDto: contractProps & Partial<RegisterDto>
            ): Promise<string> {
                return this.contractService.sendContract(dataDto,dataDto)
            }
        
        @Post('receiver-inbox-contract')
            ContractReceivedOnInbox(
                @Body() dataDto: { contractId: string, receiverId: string, accepted: boolean }
            ){
                return this.inboxService.ContractReceivedOnInbox(dataDto.contractId, dataDto.receiverId, dataDto.accepted)
            }
}
