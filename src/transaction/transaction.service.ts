// transaction.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entity/transaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from 'src/account/document/account.doc';
import { NotFoundException } from '@nestjs/common';
import { CARDTYPE, VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { isArray } from 'class-validator';


@Injectable()
export class TransactionService {

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly virtualCardRepository: Repository<VirtualCard>,
    @InjectModel("Account")
    private readonly accountModel:Model<AccountDocument>,
    private readonly jwtService:JwtService
  
  ) {}


  async createTransactionFromNotification(data: {
    key:string
    trxId:string;
    amount: number;
    status: string;
    currency: string;
    merchant: string;
    timestamp: string;




  }): Promise<Transaction> {
 
    const transaction = this.transactionRepository.create({

      id:data.trxId,
      merchant: data.merchant,
      status: data.status,
      currency: data.currency,
      amount: data.amount,
      timestamp: data.timestamp,
    });

    const account = await this.accountModel.findOne({ transactions: data.trxId}).exec()
    if (! account) throw new NotFoundException('{create transaction} account not found')

    if( account.tempVirtualCard.length > 0){

      const vc = await this.virtualCardRepository.find({where:{pan:account.pan}});
       if (!vc ) throw new NotFoundException('{create transaction} virtual card not found')
      const tempCards = vc.filter( tempCards => tempCards.card_type === CARDTYPE.TEMP )

      for( const card of tempCards){

        const tempCard = await this.virtualCardRepository.findOne({where:{id:card.id}});
        if ( !tempCard ) throw new NotFoundException('{create transaction} virtual card not found')

        let tokenPayload = this.jwtService.decode(tempCard.POS_token)
        if ( tokenPayload.key === data.key && transaction.type === "CONTACTLESS")
        card.status = 'expired'
        await this.virtualCardRepository.save(card)
       }
    }
    return this.transactionRepository.save(transaction);

  }

  async getTransaction(id:string){
    const transaction = await this.transactionRepository.findOne({where:{ id: id}})
    if(! transaction) throw new NotFoundException('{transaction} transaction not found')

      return transaction
  }

  async getTransactions (AccountId:string){

    let userTransactions :Transaction[] = []

    const account = await this.accountModel.findById(AccountId).exec();
    if ( ! account ) throw new NotFoundException('{ Transaction } account not found');

    for (const transactionId of account.transactions){
  
      const transaction = await this.transactionRepository.findOne({where:{ id: transactionId.toString()}})
      if(! transaction) throw new NotFoundException('{transaction} transaction not found')

      userTransactions.push(transaction)
         
    }

    return userTransactions
  }
}