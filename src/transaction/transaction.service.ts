// transaction.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entity/transaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from 'src/account/document/account.doc';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectModel("Account")
    private readonly accountModel:Model<AccountDocument>,
  ) {}

  async createTransactionFromNotification(data: {

    trx_id:string
    amount: number;
    status: string;
    currency: string;
    merchant: string;
    timestamp: string;

  }): Promise<Transaction> {
    const transaction = this.transactionRepository.create({

      id:data.trx_id,
      merchant: data.merchant,
      status: data.status,
      currency: data.currency,
      amount: data.amount,
      timestamp: data.timestamp
    });

    return this.transactionRepository.save(transaction);
  }

  async getTransaction(id:string){
    const transaction = await this.transactionRepository.findOne({where:{ id: id}})
    if(! transaction) throw new NotFoundException('{transaction} transaction not found')

      return transaction
  }

  async getTransactions (AccountId:string){

    const account = await this.accountModel.findById(AccountId).exec();
    if ( ! account ) throw new NotFoundException('{ Transaction } account not found');

    console.log(account.transactions)
    return account.transactions

  }
}