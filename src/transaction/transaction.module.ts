import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Contract } from 'src/contract/entity/contract.entity';
import { Transaction } from './entity/transaction.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([
        Contract,
        User,
        Transaction,
      ]),
    ],
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
