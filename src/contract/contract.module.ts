import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Contract } from './entity/contract.entity';
import { User } from 'src/user/entity/user.entity';
import { Inbox } from 'src/inbox/entity/inbox.entity';
import { UserModule } from 'src/user/user.module';
import { InboxModule } from 'src/inbox/inbox.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from 'src/account/document/account.doc';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { CONTRACT_DECISIONS } from './contract.service';
import { ContractDecisionState } from './contract.service';



@Module({
  imports:[
    HttpModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    TypeOrmModule.forFeature([
      Contract,
      Transaction,
      User,
      Inbox
    ]),
    UserModule,
    InboxModule,

  ],
  controllers: [ContractController],
  providers: [
    ContractService,
    ConfigService,
       {
      provide: CONTRACT_DECISIONS,
      useValue: new Map<string, ContractDecisionState>(),
    },
  ]
})
export class ContractModule {}
