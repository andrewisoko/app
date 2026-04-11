import { Module } from '@nestjs/common';
import { VirtualCardController } from './virtual.card.controller';
import { VirtualCardService } from './virtual.card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualCard } from './entity/virtual.card.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

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
    ])
  ],
  controllers: [VirtualCardController],
  providers: [VirtualCardService]
})
export class VirtualCardModule {}
