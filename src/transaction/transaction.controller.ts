// transaction.controller.ts  (Kafka consumer lives here, not in the service)
import { Body, Controller,Get,Param,Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get('transaction/:id')
    async getTransaction(
        @Param('id') id:string
    ){
    return await this.transactionService.getTransaction(id)
    }

    @Get(':account_id')
    async getTransactions(
        @Param('account_id') id:string
    ){
    return await this.transactionService.getTransactions(id)
    }


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
        trxId:string

    }) {
         console.log('RAW PAYLOAD:', data);
        if (!data.key || !data.key.startsWith('KEY_')) {
            return; 
        }

        await this.transactionService.createTransactionFromNotification({
           
            trxId: data.trxId,
            amount: data.amount,
            status: data.status,
            currency: data.currency,
            merchant: data.merchant,
            timestamp: data.timestamp,
        });
    }
}