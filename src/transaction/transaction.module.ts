import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/user/entity/user.entity';
import { Contract, ContractSchema } from 'src/contract/document/contract.doc';

@Module({
  imports:[
      TypeOrmModule.forFeature([
        User
      ]),
      MongooseModule.forFeature([{ name: 'Contract', schema: ContractSchema }]),
    ],
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
