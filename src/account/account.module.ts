import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  AccountSchema } from './document/account.doc';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
        TypeOrmModule.forFeature([User,VirtualCard])
    ],
    controllers: [AccountController],
    providers: [AccountService,VirtualCardService,JwtService],
    exports: [AccountService],
})
export class AccountModule {}
