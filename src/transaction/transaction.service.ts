// transaction.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entity/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createTransactionFromNotification(data: {

    amount: number;
    status: string;
    currency: string;
    merchant: string;
    timestamp: string;
  }): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
     
      merchant: data.merchant,
      status: data.status,
      currency: data.currency,
      amount: data.amount,
      timestamp: data.timestamp
    });

    return this.transactionRepository.save(transaction);
  }
}