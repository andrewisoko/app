import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from 'src/account/document/account.doc';
import { Inbox } from 'src/inbox/entity/inbox.entity';
import { AccountService } from 'src/account/account.service';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { RegisterDto } from './signUp.signIn/registerDto';
import { use } from 'passport';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Inbox) private inboxRepository: Repository<Inbox>,
        @InjectRepository(VirtualCard) private virtualCardRepository: Repository<VirtualCard>,
        @InjectModel('Account') private accountModel: Model<AccountDocument>,
        private readonly accountService:AccountService,
        private readonly virtualCardService:VirtualCardService
    ){}


    async findUserById(id:string){
        return await this.userRepository.findOneBy({id})
    }
    async findUserByUsername(username:string){
        return await this.userRepository.findOne({where:{user_name:username}})
    }
     async findUserByEmail(email:string){
        return await this.userRepository.findOneBy({email})
    }

    async createUser(data:Partial<User>){

        
        const user = this.userRepository.create(data);
        const savedUser = await this.userRepository.save(user);
        
        const fullName = `${savedUser.name} ${savedUser.surname}`;

        const userAccount = await this.accountService.createAccount(
            'GBP',
            200,
            savedUser.user_name,
            fullName
            );
        

        const inbox = this.inboxRepository.create({ user: savedUser });
        savedUser.accounts = [userAccount._id.toString()];

        const savedInbox = await this.inboxRepository.save(inbox);


        savedUser.inbox = savedInbox;
        return await this.userRepository.save(savedUser)
    }


    async deleteUser(id:string){
        return await this.userRepository.delete(id)
    }

    async addRecipient( userName:string, userNameRecipient:string ){
        
        const user = await this.findUserByUsername(userName)
        
        if(!user) throw new NotFoundException('user not found');
        user.recipients.push(userNameRecipient)
        
        await this.userRepository.save(user)
        console.log('user', user)
        
        return `recipient ${userNameRecipient} added`
    }


    async getRecipient(userId: string, recipientUsername: string): Promise<string> {
        
        const user = await this.findUserById(userId);
        if (!user) throw new NotFoundException('User not found');
        
        const recipient = user.recipients?.find(r => r === recipientUsername);
        if (!recipient) {
            throw new NotFoundException(`Recipient ${recipientUsername} not found in user's recipients list`);
        }
        
        return recipient;
    }
    async getRecipients(userId: string): Promise<string[]> {
        
        const user = await this.findUserById(userId);
        if (!user) throw new NotFoundException('User not found');
        
        return user.recipients
    }

    async deleteRecipient(userId: string, recipientUsername: string): Promise<string> {
        
        const user = await this.findUserById(userId);
        if (!user) throw new NotFoundException('User not found');
        
        const recipientIndex = user.recipients.indexOf(recipientUsername);
        if (recipientIndex === -1) {
            throw new NotFoundException(`Recipient ${recipientUsername} not found in user's recipients list`);
        }
        
        user.recipients.splice(recipientIndex, 1);
        await this.userRepository.save(user);
        
        return `Recipient ${recipientUsername} removed successfully`;
    }
}

