import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import * as QRCode from 'qrcode';





export interface contractProps{

    sender: string,
    receiver: string[],
    all_usernames: string[]
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

    async getContract(id: string): Promise<Contract> {

        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException(`Contract with id ${id} not found`);
        return contract;
    }

    async createContract(
        contract: Partial<contractProps>,
    ): Promise<Contract> {

        if (!contract.sender) throw new Error('[create contract] Contract sender is required');
        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender }});
        if( !senderUser ) throw new NotFoundException("error at create contract level 404: sender user not found")

        if (!contract.receiver) throw new Error(' [create contract] Contract sender is required');
        const allUsernames = [senderUser.user_name,...contract.receiver];

    

        const contractPayload = this.contractRepository.create({
            sender: senderUser.user_name,
            sender_percentage: contract.sender_percentage,
            sender_amount: contract.sender_amount,
            receiver: contract.receiver,
            all_usernames: allUsernames,
            time_agreement: contract.time_agreement,
            receiver_percentage: contract.receiver_percentage,
            receiver_amount: contract.receiver_amount,
            split_agreement: contract.split_agreement as SPLIT_AGREEMENT,
            contract_status: contract.contractStatus as CONTRACT_STATUS,
            repayment_agreement: contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
            });
            
        
        senderUser.created_contract.push(contractPayload)
        await this.userRepository.save(senderUser)
      
    
            return this.contractRepository.save( contractPayload );
        }



    async sendContract( contract:Partial<contractProps>, registerDto:Partial<RegisterDto> ):Promise<string>{

        

        if (!contract.sender) throw new Error('[send contract] Contract sender is required');
        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender}});
        if( !senderUser ) throw new NotFoundException("error at send contract level 404: sender user not found")

        const senderAccount = await this.accountModel.findOne({ customer: senderUser.id }).exec();
        if( !senderAccount ) throw new NotFoundException("error at send contract level 404: sender account not found")
        let senderAccountId = String(senderAccount._id);


        if( !contract.time_agreement ) throw new NotFoundException('missing time agreement');
        if( new Date(contract.time_agreement[0]) < new Date(Date.now())) throw new Error('invalid start time agreement');
        if( new Date(contract.time_agreement[1]) <= new Date(Date.now())) throw new Error('invalid end time agreement');

        if ( !contract.receiver || contract.receiver.length === 0 ) { // create default account for then confirm it 

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
            contract.receiver = [savedDefaultUser.account];
            
            const contractCreated = await this.createContract(contract);

            contractCreated.contract_type = CONTRACT_TYPE.ONE_TIME;
            await this.contractRepository.save(contractCreated)

            console.log('contract type',contractCreated.contract_type)
            await this.inboxService.postInbox(contractCreated, savedDefaultUser);

            const qrUrl = `http://localhost:3100/contract/receiver-inbox-contract?contractId=${contractCreated.id}&defaultUserId=${savedDefaultUser.id}`;
            const qrCode = await QRCode.toDataURL(qrUrl);

            console.log('QR code generated for default user contract link:', qrUrl);
            console.log('QR code (base64):', qrCode);

            return 'contract sent to default account.'

        } else { // already existing accounts 

            const confirmedUsers: User[] = [];
            const confirmedAccountIds: string[] = [];
            if (!contract.receiver) throw new Error(' [send contract] Contract sender is required');

            try {
                for (const username of contract.receiver) {
                  
                    const receiverUser = await this.userRepository.findOne({ where: { user_name: username } });
                    if (!receiverUser) throw new NotFoundException(`error at send contract level 404: receiver user not found — ${username}`);
                    if (receiverUser.user_name === contract.sender ) throw new UnauthorizedException(`error at send contract level identical sender/user `)
                    const receiverAccount = await this.accountModel.findOne({ customer: receiverUser.id }).exec();
                    if (!receiverAccount) throw new NotFoundException(`error at send contract level 404: receiver account not found — ${username}`);
                    confirmedUsers.push(receiverUser);
                    confirmedAccountIds.push(String(receiverAccount._id));

                }
                const contractCreated = await this.createContract(contract);
                contractCreated.sender = senderAccountId;
            
                for (const receiverUser of confirmedUsers) {
                    
                    contractCreated.receiver =  confirmedAccountIds;
                    await this.contractRepository.save(contractCreated);

                    await this.inboxService.postInbox(contractCreated, receiverUser);
                   
                    if(senderUser.recipients.includes(receiverUser.user_name) 
                      || senderUser.user_name === receiverUser.user_name ||
                     receiverUser.user_name === null
                    ){}else{
                      senderUser.recipients.push(receiverUser.user_name);    
                    }
                    senderUser.created_contract.push(contractCreated);

                    await this.userRepository.save(senderUser);
                }


            } catch (error) {
                console.log('error at existing user / send contract level:',error)
                throw new HttpException('Custom error message', HttpStatus.BAD_REQUEST);
            }

               return 'contract sent to receivers.'
        }

    }

}
