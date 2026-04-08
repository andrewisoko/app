import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Contract } from 'src/contract/entity/contract.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([
        Contract,
        User
      ])
    ],
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
