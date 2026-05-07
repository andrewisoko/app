import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Inbox } from '../inbox/entity/inbox.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { SignUpSignInService } from './signUp.signIn/signup.signin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from 'src/account/document/account.doc';
import { AccountModule } from 'src/account/account.module';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { VirtualCardModule } from 'src/virtual_card/virtual.card.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Inbox,VirtualCard]),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    AccountModule,
    VirtualCardModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_USER_KEY'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, SignUpSignInService],
  exports: [JwtStrategy, SignUpSignInService, UserService],
})
export class UserModule {}
