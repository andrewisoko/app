import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Contract, SPLIT_AGREEMENT, CONTRACT_STATUS, CONTRACT_TYPE } from './entity/contract.entity';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Role, User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from 'src/user/signUp.signIn/registerDto';
import { UserType } from 'src/user/entity/user.entity';
import { InboxService } from 'src/inbox/inbox.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { AccountDocument } from 'src/account/document/account.doc';
import { Model } from 'mongoose';
import { time } from 'console';
import * as QRCode from 'qrcode';




export interface contractProps{

    sender: string,
    receiver: string[],
    split_agreement: string,
    contractStatus: string,
    time_agreement:Date[]
    sender_percentage: number;
    sender_amount: number;
    receiver_percentage: number[];
    receiver_amount: number[];
    repayment_agreement:string,
    event_agreement:string,
    location_agreement:string,

} 
@Injectable()
export class ContractService {

    constructor( 
        @InjectRepository( Contract ) private readonly contractRepository: Repository<Contract>,
        @InjectRepository( User ) private readonly userRepository:Repository<User>,
        @InjectModel('Account') private readonly accountModel:Model<AccountDocument>,
        private readonly userService: UserService,
        private readonly inboxService: InboxService,
 ){}

    private async createContract(
        contract: Partial<contractProps>,
        senderAccountId: string,
        receiverUsernames: string[],
    ): Promise<Contract> {

        const contractPayload = this.contractRepository.create({
            sender: senderAccountId,
            sender_percentage: contract.sender_percentage,
            sender_amount: contract.sender_amount,
            receiver: receiverUsernames,
            time_agreement: contract.time_agreement,
            receiver_percentage: contract.receiver_percentage,
            receiver_amount: contract.receiver_amount,
            split_agreement: contract.split_agreement as SPLIT_AGREEMENT,
            contract_status: contract.contractStatus as CONTRACT_STATUS,
            repayment_agreement: contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
            });

            return this.contractRepository.save(contractPayload);
        }



    async sendContract( contract:Partial<contractProps>, registerDto:Partial<RegisterDto> ){

        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender}});
        if( !senderUser ) throw new NotFoundException("error at send contract level 404: sender user not found")

        const senderAccount = await this.accountModel.findOne({ customer: senderUser.id }).exec();
        if( !senderAccount ) throw new NotFoundException("error at send contract level 404: sender account not found")
        const senderAccountId = String(senderAccount._id);

        if( !contract.time_agreement ) throw new NotFoundException('missing time agreement');
        if( new Date(contract.time_agreement[0]) < new Date(Date.now())) throw new Error('invalid start time agreement');
        if( new Date(contract.time_agreement[1]) <= new Date(Date.now())) throw new Error('invalid end time agreement');

        if ( !contract.receiver || contract.receiver.length === 0 ) {

            const randomFour = Math.floor(Math.random() * 90000) + 10000;
            const password = crypto.randomUUID();

            const defaultUser = await this.userService.createUser({
                role: Role.USER,
                name: registerDto.name,
                surname: registerDto.surname,
                user_name: `default_user${randomFour}`,
                mobile_number: registerDto.mobileNumber,
                user_type: UserType.DEFAULT,
                email: registerDto.email,
                password: password,
            });

            const savedDefaultUser = await this.userRepository.save(defaultUser);

            const contractCreated = await this.createContract(contract, senderAccountId, [savedDefaultUser.accounts[0]]);

            contractCreated.contract_type = CONTRACT_TYPE.ONE_TIME;
            await this.contractRepository.save(contractCreated)

            console.log('contract type',contractCreated.contract_type)
            await this.inboxService.postInbox(contractCreated, savedDefaultUser);

            const qrUrl = `http://localhost:3100/contract/receiver-inbox-contract?contractId=${contractCreated.id}&defaultUserId=${savedDefaultUser.id}`;
            const qrCode = await QRCode.toDataURL(qrUrl);

            console.log('QR code generated for default user contract link:', qrUrl);
            console.log('QR code (base64):', qrCode);

            return 'contract sent to default account.'

        } else {

            const confirmedUsers: User[] = [];
            const confirmedAccountIds: string[] = [];

            for (const username of contract.receiver) {
                const receiverUser = await this.userRepository.findOne({ where: { user_name: username } });
                if (!receiverUser) throw new NotFoundException(`error at send contract level 404: receiver user not found — ${username}`);
                const receiverAccount = await this.accountModel.findOne({ customer: receiverUser.id }).exec();
                if (!receiverAccount) throw new NotFoundException(`error at send contract level 404: receiver account not found — ${username}`);
                confirmedUsers.push(receiverUser);
                confirmedAccountIds.push(String(receiverAccount._id));
            }

            const contractCreated = await this.createContract(contract, senderAccountId, confirmedAccountIds);

            for (const receiverUser of confirmedUsers) {
                await this.inboxService.postInbox(contractCreated, receiverUser);
            }

               return 'contract sent to receivers.'
        }

    }



}
