import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  AccountSchema } from './document/account.doc';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { VirtualCardModule } from 'src/virtual_card/virtual.card.module';
import { Transaction } from 'src/transaction/entity/transaction.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
        TypeOrmModule.forFeature([User,VirtualCard,Transaction]),
        VirtualCardModule,
    ],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService],
})
export class AccountModule {}
