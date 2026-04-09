import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract } from 'src/contract/entity/contract.entity';

@Injectable()
export class InboxService {

    constructor(
        @InjectRepository( Inbox ) private readonly inboxRepository: Repository<Inbox>,
        @InjectRepository( User ) private readonly userRepository: Repository<User>,
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
    ) {}


    async postInbox(contract:Contract,user:User){

        return await this.inboxRepository.save({
            history:[contract],
            mostRecent:contract,
            user:user,
        })
        
    }
}
