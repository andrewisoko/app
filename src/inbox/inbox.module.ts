import { Module } from '@nestjs/common';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import {  ContractSchema } from 'src/contract/document/contract.doc';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inbox,
      User,
    ]),
    // MongooseModule.forFeature([{ name: 'Contract', schema: ContractSchema }]),
  ],
  controllers: [InboxController],
  providers: [InboxService]
})
export class InboxModule {}
