import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
