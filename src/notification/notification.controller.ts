import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get('user/:userId')
    getNotificationsByUserId(@Param('userId') userId: string) {
        return this.notificationService.getNotificationsByUserId(userId);
    }

    @Get(':id')
    getNotificationById(@Param('id') id: string) {
        return this.notificationService.getNotificationById(id);
    }

    @Delete(':id')
    deleteNotification(@Param('id') id: string) {
        return this.notificationService.deleteNotification(id);
    }
}
