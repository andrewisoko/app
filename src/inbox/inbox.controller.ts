import { Body, Controller, Post } from '@nestjs/common';
import { InboxService } from './inbox.service';

@Controller('inbox')
export class InboxController {
    constructor(private readonly inboxService: InboxService) {}

    @Post('accept-contract')
    async acceptContract(
        @Body() payload: { contractId: string; receiverUsername: string },
    ) {
        return this.inboxService.acceptContractFromInbox(
            payload.contractId,
            payload.receiverUsername,
        );
    }
}
