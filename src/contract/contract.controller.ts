import { Controller,Post,Get,Param,Body } from '@nestjs/common';
import { ContractService,contractProps } from './contract.service';
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
                @Body() contractData: Partial<contractProps>,
              
            ): Promise<Contract> {
                return this.contractService.createContract(
                    contractData,

                );
            }
        
        @Post('send-contract')  
            async sendContract(
                @Body() contractId: string
            ): Promise<string> {
                return await this.contractService.sendContract( contractId )
        }

        @Post('qrcode-new-user')  
            async newAUserFromQRcode(
                @Body() dataDto: {
                    contractId:string,
                    decision: boolean,
                    amount?:number,
                    bank?:string,
                }
            ): Promise<string> {
                return await this.contractService.newAUserFromQRcode(
                    dataDto.contractId,
                    dataDto.decision,
                    dataDto.amount,
                    dataDto.bank
                )
        }
        
}
