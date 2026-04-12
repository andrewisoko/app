import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Contract } from './entity/contract.entity';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/account/document/account.doc';
import { UserService } from 'src/user/user.service';
import { InboxService } from 'src/inbox/inbox.service';
import { Inbox } from 'src/inbox/entity/inbox.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Transaction,
      Contract,
      User,
      Account,
      Inbox
    ])
  ],
  controllers: [ContractController],
  providers: [
    ContractService,
    UserService,
    InboxService
  ]
})
export class ContractModule {}
