import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Contract } from './entity/contract.entity';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { InboxService } from 'src/inbox/inbox.service';
import { Inbox } from 'src/inbox/entity/inbox.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Contract,
      Transaction,
      User,
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
