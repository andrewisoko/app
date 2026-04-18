import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './signUp.signIn/registerDto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/account/document/account.doc';
import { Inbox } from 'src/inbox/entity/inbox.entity';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Inbox) private inboxRepository: Repository<Inbox>,
        @InjectModel('Account') private accountModel: Model<AccountDocument>,
        private readonly accountService:AccountService
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

     async createUser(data:Partial<RegisterDto>){
        const user = this.userRepository.create(data);
        const savedUser = await this.userRepository.save(user);
        const userName = savedUser.user_name;
        const fullName = `${savedUser.name} ${savedUser.surname}`
        const newAccount = await this.accountService.createAccount(
            'GBP',
            200,
            userName,
            fullName
            );

        savedUser.accounts = [newAccount._id.toString()];

        const inbox = this.inboxRepository.create({ user: savedUser });
        const savedInbox = await this.inboxRepository.save(inbox);

        savedUser.inbox = savedInbox;
        return await this.userRepository.save(savedUser)
    }


     async deleteUser(id:string){
        return await this.userRepository.delete(id)
    }
}

