import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Contract } from 'src/contract/entity/contract.entity';
import { Transaction } from './entity/transaction.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from 'src/account/document/account.doc';
import { ConfigService,ConfigModule } from '@nestjs/config';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
      MongooseModule.forFeature([{ name:'Account', schema: AccountSchema }]),
      TypeOrmModule.forFeature([
        Contract,
        User,
        Transaction,
        VirtualCard

      ]),
       JwtModule.registerAsync({
          imports:[ConfigModule],
          inject:[ConfigService],
        })
    ],
  providers: [
    TransactionService,
    ConfigService
  ],
  controllers: [TransactionController]
})
export class TransactionModule {}
