import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Inbox } from './entity/inbox.entity';
import { User } from 'src/user/entity/user.entity';
import { Contract} from 'src/contract/entity/contract.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountDocument } from 'src/account/document/account.doc';
import { VirtualCard } from 'src/virtual_card/entity/virtual.card.entity';
import { ContractService } from 'src/contract/contract.service';
import { NotificationService } from 'src/notification/notification.service';


@Injectable()
export class InboxService {

    constructor(
        @InjectRepository( Inbox ) private readonly inboxRepository: Repository<Inbox>,
        @InjectRepository( User ) private readonly userRepository: Repository<User>,
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
        @InjectRepository( VirtualCard ) private readonly vcRepository: Repository<VirtualCard>,
        @InjectModel('Account') private readonly accountModel: Model<AccountDocument>,
        private readonly jwtService: JwtService,
        private readonly contractService: ContractService,
        private readonly notificationService: NotificationService
    ) {}

    
//////////////////////////////////
//////////////////////////////////
///////MAIN FUNCTIONS/////////////
//////////////////////////////////
//////////////////////////////////
    

    async getInbox(id: string): Promise<Inbox> {

        const inbox = await this.inboxRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!inbox) throw new NotFoundException(`Inbox with id ${id} not found`);
        return inbox;
    }


    async postInbox(contract:Partial<Contract>,user:User){

        try{
    
            const existingInbox = await this.inboxRepository.findOne({
                where: { user: { id: user.id } },
            });
    
            if (existingInbox) {
                const existingHistory = Array.isArray(existingInbox.history) ? existingInbox.history : [];

                if (
                    existingInbox.most_recent_expires_at &&
                    existingInbox.most_recent_expires_at < new Date()
                    ) {
                    existingInbox.most_recent = [];
                    }
    
                existingInbox.history = [...existingHistory, contract];
                existingInbox.most_recent = [contract];
                // existingInbox.contract = contract;
                existingInbox.most_recent_expires_at = new Date(
                    Date.now() + 60 * 60 * 1000 
                    );
                existingInbox.user = user;

    
                return await this.inboxRepository.save(existingInbox);
            }
    
            const inboxPayload = this.inboxRepository.create({
                history:[contract],
                most_recent:[contract],
                // contract:contract,
                user:user,
            });
    
            return await this.inboxRepository.save(inboxPayload)
        }catch(error){
            console.log('{postInbox service}', error)
        }
        
        
    };



    async ContractInbox( contractId: string, receiverAccountId: string, decision:boolean ){

        try {
            
            if (!contractId || !receiverAccountId) {
                throw new BadRequestException('contractId and receiverId are required');
            }

           const receiverAccountUser = await this.accountModel.findById(receiverAccountId).exec() 
            if (!receiverAccountUser) throw new NotFoundException('Receiver account not found');
              
            const receiverUser = await this.userRepository.findOne({
                where: { id: String(receiverAccountUser.customer) },
                relations: ['inbox'],
            });
            if (!receiverUser) throw new NotFoundException('Receiver user not found');

        
            const contract = await this.contractRepository.findOne({ where: { id: contractId } });
            if (!contract) throw new NotFoundException('{ contract from inbox } Contract not found');

            const senderAccount = await this.accountModel.findById(contract.sender).exec();
            if (! senderAccount ) throw new NotFoundException('{ contract from inbox } Sender account not found');
            const customerId = senderAccount.customer.toString();
            const senderUser = await this.userRepository.findOne({ where: { id: customerId } });
            if (! senderUser ) throw new NotFoundException('{ contract from inbox } Sender user not found');

            const inboxReceiver = receiverUser.inbox
                ? await this.inboxRepository.findOne({ where: { id: receiverUser.inbox.id } })
                : null;

            if (inboxReceiver) {

                const existingHistory = Array.isArray(inboxReceiver.history)
                ? inboxReceiver.history
                : [];

                const updatedHistory = existingHistory.map(item =>
                item.id === contract.id
                    ? contract
                    : item
                );

                inboxReceiver.history = updatedHistory;
                inboxReceiver.most_recent = [contract];
         

                if (decision === true ){

                   
                    this.contractService.receiverFinalAgreement(
                        contract.id,
                        receiverAccountId,
                        contract.participants,
                        "accepted"
                    )

         
                    await this.notificationService.createNotification(
                        senderUser.id,
                        `contract accepted by ${receiverUser.user_name}`,
                        receiverUser.user_name
                    );
                  

                    } 
                    else {
                    
                        this.contractService.receiverFinalAgreement(
                            contract.id,
                            receiverAccountId,
                            contract.participants,
                            "declined"
                        )

         
                await this.notificationService.createNotification(
                    senderUser.id,
                    `contract declined by ${receiverUser.user_name}`,
                    receiverUser.user_name

                    );
                }
            }
        

        } catch (error) {
            console.log('Error at contract received on inbox level', error);
        }
    }
}


