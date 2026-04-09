import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Contract } from './entity/contract.entity';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/entity/account.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Transaction,
      Contract,
      User,
      Account
    ])
  ],
  controllers: [ContractController],
  providers: [
    ContractService,
    UserService,
  ]
})
export class ContractModule {}
