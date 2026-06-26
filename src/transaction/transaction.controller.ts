// transaction.controller.ts  (Kafka consumer lives here, not in the service)
import { Body, Controller,Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('outcome-device-app')
    async handleNotification(
        @Body() data: {
        
        key: string;
        message: string;
        customer: string;
        amount: number;
        status: string;
        currency: string;
        merchant: string;
        timestamp: string;
    }) {
         console.log('RAW PAYLOAD:', data);
        if (!data.key || !data.key.startsWith('TRANSACT_')) {
            return; 
        }

        await this.transactionService.createTransactionFromNotification({
           
            
            amount:    data.amount,
            status:    data.status,
            currency:  data.currency,
            merchant:  data.merchant,
            timestamp: data.timestamp,
        });
    }
}