import { Module } from '@nestjs/common';
import { VirtualCardController } from './virtual.card.controller';
import { VirtualCardService } from './virtual.card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { VirtualCard } from './entity/virtual.card.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccountSchema } from 'src/account/document/account.doc';

@Module({
  imports:[
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configService:ConfigService) => {
         return {
          global:true,
          secret: configService.get<string>('JWT_CARD.KEY')
         }
      }

    }),
    TypeOrmModule.forFeature([
      VirtualCard
    ]),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
  ],
  controllers: [VirtualCardController],
  providers: [VirtualCardService],
})
export class VirtualCardModule {}
