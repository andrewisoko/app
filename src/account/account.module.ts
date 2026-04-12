import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  AccountSchema } from './document/account.doc';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
        TypeOrmModule.forFeature([User])
    ],
    controllers: [AccountController],
    providers: [AccountService,UserService],
})
export class AccountModule {}
