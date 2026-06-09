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

    // @Get('received-contracts')
    //     getReceivedContracts(@Query('inboxId') inboxId: string) {
    //         return this.inboxService.getReceivedContracts(inboxId);
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
