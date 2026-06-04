import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { Contract } from 'src/contract/entity/contract.entity';
import { User } from 'src/user/entity/user.entity';
import { ReceivedContractDto } from './document/received.contract.dto';

@Controller('inbox')
export class InboxController {
    constructor(private readonly inboxService: InboxService) {}

    @Post('post-inbox')
    postInbox(
        @Body() dataDto:{ contract:Contract, user:User }
    ){
        this.inboxService.postInbox(
            dataDto.contract,
            dataDto.user
        )
    };

    @Get('contracts')
        getReceivedContracts(@Query('accountId') accountId: string) {
            return this.inboxService.getReceivedContracts(accountId);
        }

    // @Post('contract/:id/accept')
    //     acceptContract(@Param('id') id: string) {
    //         return this.inboxService.acceptContract(id);
    //     }

    // @Post('contract/:id/decline')
    //     declineContract(@Param('id') id: string) {
    //         return this.inboxService.declineContract(id);
    //     }

    @Get(':id')
        getInbox(@Param('id') id: string) {
            return this.inboxService.getInbox(id);
        }

    @Post('receiver-inbox-contract')
        receivedContractOnInbox(
            @Body() dataDto: ReceivedContractDto
        ){
            return this.inboxService.ContractReceivedOnInbox(
                dataDto.contractId,
                dataDto.receiverIds,
                dataDto.accepted,
            )
        }

}
