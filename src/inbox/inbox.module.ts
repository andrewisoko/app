import { Module } from '@nestjs/common';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract } from 'src/contract/entity/contract.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Inbox,
      User,
      Contract,
    ]),
  ],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
