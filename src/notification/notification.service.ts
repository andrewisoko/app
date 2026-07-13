import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class NotificationService {

    constructor(
        @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async createNotification(userId: string, message: string, from:string): Promise<Notification> {
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['notification']
        });
        
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        // If user already has a notification, update it instead
        if (user.notification) {
            user.notification.message = message;
            user.notification.created_at = new Date();
            user.notification.from = from
            return await this.notificationRepository.save(user.notification);
        }

        // Create new notification
        const notification = this.notificationRepository.create({
            message,
            user,
            from
        });

        return await this.notificationRepository.save(notification);
    }

    async getNotificationsByUserId(userId: string): Promise<Notification | null> {
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['notification']
        });
        
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        return user.notification || null;
    }

    async getNotificationById(notificationId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: ['user']
        });

        if (!notification) {
            throw new NotFoundException(`Notification with id ${notificationId} not found`);
        }

        return notification;
    }

    async deleteNotification(notificationId: string): Promise<{ message: string }> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundException(`Notification with id ${notificationId} not found`);
        }

        await this.notificationRepository.remove(notification);
        return { message: 'Notification deleted successfully' };
    }
}
