import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Contract, SPLIT_AGREEMENT, CONTRACT_STATUS,  TRANSACTION_TYPE_CONTRACT, CONTRACT_TYPE } from './entity/contract.entity';
import { Role, User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { UserType } from 'src/user/entity/user.entity';
import { InboxService } from 'src/inbox/inbox.service';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { AccountDocument } from 'src/account/document/account.doc';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { VirtualCardService } from 'src/virtual_card/virtual.card.service';
import { SignUpSignInService } from 'src/user/signUp.signIn/signup.signin.service';




type Decision = "accepted" | "declined";

export interface ContractDecisionState { //object 1
    participants: number;
    decisions: Map<string, Decision>;
}

export const CONTRACT_DECISIONS = "CONTRACT_DECISIONS";

export interface contractProps{
    id:string
    participants:number,
    contract_type:CONTRACT_TYPE,
    transaction_type:TRANSACTION_TYPE_CONTRACT
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
          @Inject(CONTRACT_DECISIONS)
        private readonly contractDecisions: Map<string, ContractDecisionState>,
        private readonly jwtService: JwtService,
        private readonly httpService:HttpService,
        private readonly configService:ConfigService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => InboxService))
        private readonly inboxService: InboxService,
        private readonly notificationService: NotificationService,
        private readonly virtualCardService: VirtualCardService,
        private readonly signIn: SignUpSignInService
        
    ){}


    //////////////////////////////////////
    //////////////////////////////////////
    /////////SET UP FUNCTIONS/////////////
    //////////////////////////////////////
    //////////////////////////////////////

        
    private parseTimeAgreement(value: any): string[] {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            // PostgreSQL array literal: {"val1","val2"}
            const match = value.match(/^\{(.*)\}$/s);
            if (match) {
                return match[1]
                    .split(',')
                    .map(s => s.replace(/^"|"$/g, '').trim())
                    .filter(Boolean);
            }
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
        };
    
    private createTempExpiry(expiry: string | Date){
        const date = new Date(expiry);
        const year = date.getFullYear().toString().slice(2, 4);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return month + '/' + year;
    };

            async updateSenderCreatedContract(username:string,condtractDecision:Contract){
            const senderUser = await this.userRepository.findOne({where:{user_name: username}})
            if(! senderUser) throw new NotFoundException("UPDATE CONTRACT SENDER USER inbox.service.ts: user not found")
            
                const lastCreatedContract = senderUser.created_contract.at(-1) ?? {}
                const updateCreatedContract = senderUser.created_contract.map(item => 
                item.id === lastCreatedContract.id
                ? condtractDecision
                : item
                )
                senderUser.created_contract = updateCreatedContract

                return await this.userRepository.save(senderUser)
         }

    
    private createContractToken(
        contractKey: string,
        contractId: string,
        role:string
    ) {
        return this.jwtService.sign(
            {
                contractId,
                role,
            },
            {
                secret: contractKey,
            },
        );
    }

    async sendToContractServer(contractId:string){

        const contract = await this.contractRepository.findOne({ where: { id:contractId } });
        if (!contract) throw new NotFoundException(`{ sent to server } Contract with id ${contractId} not found`);
        
        const gatewayUrl = this.configService.get<string>('CONTRACT_GATEWAY_URL');
        if (!gatewayUrl) throw new NotFoundException('gateway url not found');

        const contractKey = this.configService.get<string>('CONTRACT_KEY') ?? '';
           const bearerToken = this.createContractToken(
                contractKey,
                contractId,
                'CONTRACT'
            );
            const response = await firstValueFrom(
                this.httpService.post(
                    gatewayUrl,
                    {
                    contract
                    },
                    { headers: { Authorization: `Bearer ${bearerToken}` } },
                ),
            );
        
            return {
                message: 'Contract accepted and forwarded to gateway',
                contractId: contractId,
                contractStatus: contract.contract_status,
                forwardedTo: gatewayUrl,
                gatewayResponse: response.data,
            };
    }
async receiverFinalAgreement(
    contractId: string,
    receiverId: string,
    participants: number,
    decision: Decision,
) {
    const contract = await this.contractRepository.findOne({ where: { id: contractId } });
    if (!contract) throw new NotFoundException(`{ receiver final agreement } Contract not found`);

    // Initialize the tracking object for this contract if it doesn't exist
    if (!this.contractDecisions.has(contractId)) {
        this.contractDecisions.set(contractId, {
            participants,
            decisions: new Map(),
        });
    }

    const contractsFromReceivers = this.contractDecisions.get(contractId)!;
    // update on object key value
    contractsFromReceivers.decisions.set(receiverId, decision);

    if (decision === "declined") {
        contract.contract_status = CONTRACT_STATUS.DECLINED;
        await this.contractRepository.save(contract);
        console.log("Contract rejected immediately by a receiver.");


        this.contractDecisions.delete(contractId);
        return;
    }

    if (contractsFromReceivers.decisions.size < participants - 1) {
        return;
    }

    console.log("All receivers accepted.");

   contract.receiver = Array.from(contractsFromReceivers.decisions.keys());
   console.log('All receivers id', contract.receiver)
    
    contract.contract_status = CONTRACT_STATUS.ACCEPTED;
    await this.contractRepository.save(contract);

    /// temp card for all partecipants ///

    const senderAccount = await this.accountModel.findById(contract.sender).exec();
    const accNumber = Math.floor(Math.random() * 90000000 ) + 10000000;
    const tempExpiry = this.createTempExpiry(this.parseTimeAgreement(contract.time_agreement)[1]);

    if (senderAccount) {
        const senderUser = await this.userRepository.findOne({ where: { id: String(senderAccount.customer) } });
        const fullName = senderUser ? `${senderUser.name} ${senderUser.surname}` : senderAccount.fullName;
        const accountUsers = [contract.sender, ...contract.receiver];

        const expiryTime = contract.transaction_type === TRANSACTION_TYPE_CONTRACT.WITH_TIME_AGREEMENT 
            ? String(contract.time_agreement[1])
            : new Date().toISOString()
        

        const tempCard = await this.virtualCardService.createTempCard(
            fullName,
            expiryTime, 
            contract.sender, 
            accNumber, 
            accountUsers, 
            tempExpiry
        );

        const idAccountUsers = tempCard.account_users ?? []
        console.log('temp card process account ids', {})

        for( const accountId of idAccountUsers ){

            await this.accountModel.findByIdAndUpdate(
                  accountId,
                {
                    $push: { tempVirtualCard: tempCard.id },
                    $set: { expiry: tempExpiry },
                },
            ).exec();
        }                    
    }
    await this.updateSenderCreatedContract(contract.all_usernames[0],contract)             
    await this.sendToContractServer(contractId);
    
    // Cleanup memory
    this.contractDecisions.delete(contractId);
}


    async getContract(id: string): Promise<Contract> {

        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException(`Contract with id ${id} not found`);
        return contract;
    }


    ////////////////////////////////
    ////////////////////////////////
    /////// MAIN FUNCTIONS//////////
    ////////////////////////////////
    ////////////////////////////////



    async createContract(
        contract: Partial<contractProps>,
    ): Promise<Contract> {

        if (!contract.sender) throw new Error('[create contract] Contract sender is required');
        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender }});
        if( !senderUser ) throw new NotFoundException("error at create contract level 404: sender user not found")

        if (!contract.receiver) throw new Error(' [create contract] Contract sender is required');
        const allUsernames = [senderUser.user_name,...contract.receiver];

    

        const contractPayload = this.contractRepository.create({
            id:contract.id,
            participants:contract.participants,
            contract_type:contract.contract_type,
            transaction_type:contract.transaction_type,
            all_usernames: allUsernames,
            sender: senderUser.user_name,
            sender_percentage: contract.sender_percentage,
            sender_amount: contract.sender_amount,
            receiver: contract.receiver,
            receiver_percentage: contract.receiver_percentage,
            receiver_amount: contract.receiver_amount,
            split_agreement: contract.split_agreement as SPLIT_AGREEMENT,
            time_agreement: contract.time_agreement,
            contract_status: contract.contractStatus as CONTRACT_STATUS,
            repayment_agreement: contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
            });
            
        
        senderUser.created_contract.push(contractPayload)
        await this.userRepository.save(senderUser)
      
    
            return this.contractRepository.save( contractPayload );
        }



    async sendContract( contractId:string):Promise<string>{


        const contract = await this.contractRepository.findOne({where:{id:contractId}})
        if( ! contract )throw new NotFoundException('{send contract} contract not found')

        if (!contract.sender) throw new Error('{send contract} Contract sender is required');
        const senderUser = await this.userRepository.findOne({where:{user_name:contract.sender}});
        if( !senderUser ) throw new NotFoundException("{ send contract } sender user not found")

        if(senderUser.user_type !== UserType.COMPETED) throw new UnauthorizedException("{ send contract} user needs to complete profile")

        const senderAccount = await this.accountModel.findOne({ customer: senderUser.id }).exec();
        if( !senderAccount ) throw new NotFoundException("{send contract} sender account not found")
        let senderAccountId = String(senderAccount._id);
        contract.sender = senderAccountId;



        const confirmedUsers: User[] = [];
        const confirmedAccountIds: string[] = [];
        if (!contract.receiver) throw new Error('{send contract} Contract receiver is required');

        const existingReceivers = contract.receiver.filter(usernames => !usernames.includes( "NEW USER" ))
        const newUsers = contract.receiver.filter(usernames => usernames.includes( "NEW USER" ))

        try {
            for (const username of existingReceivers ) {
                
                const receiverUser = await this.userRepository.findOne({ where: { user_name: username } });
                if (!receiverUser) throw new NotFoundException(`error at send contract level 404: receiver user not found — ${username}`);
                if (receiverUser.user_name === contract.sender ) throw new UnauthorizedException(`error at send contract level identical sender/user `)
                const receiverAccount = await this.accountModel.findOne({ customer: receiverUser.id }).exec();
                if (!receiverAccount) throw new NotFoundException(`error at send contract level 404: receiver account not found — ${username}`);
                confirmedUsers.push(receiverUser);
                confirmedAccountIds.push(String(receiverAccount._id));

            }
                // contract.sender = senderAccountId;
            
                for (const receiverUser of confirmedUsers) {
                    
                    const allReceivers = [...confirmedAccountIds,...newUsers]
                    contract.receiver = allReceivers

                    console.log('{send contract} all receiver array',allReceivers)

                    await this.contractRepository.save(contract);


                    await this.inboxService.postInbox(contract, receiverUser);
                   
                    if(senderUser.recipients.includes(receiverUser.user_name) 
                      || senderUser.user_name === receiverUser.user_name ||
                     receiverUser.user_name === null
                    ){}
                    else{
                      senderUser.recipients.push(receiverUser.user_name);    
                    }
                    await this.userRepository.save(senderUser);
                }


            } catch (error) {
                console.log('error at existing user / send contract level:',error)
                throw new HttpException('Custom error message', HttpStatus.BAD_REQUEST);
            }

               return 'contract sent to receivers.'  

    }


    async newAUserFromQRcode(
        contractId:string,
        decision:boolean,
        amount?:number,
        bank?:string,
    ){

        
        const contract = await this.contractRepository.findOne({ where: { id:contractId } });
        if (!contract) throw new NotFoundException(`{ new user QR code } Contract with id ${contractId} not found`);

         const senderAccount = await this.accountModel.findById(contract.sender).exec();
            if (! senderAccount ) throw new NotFoundException('{ new user qr code } Sender account not found');
            const customerId = senderAccount.customer.toString();
            const senderUser = await this.userRepository.findOne({ where: { id: customerId } });
            if (! senderUser ) throw new NotFoundException('{ new user qr code } Sender user not found');

        if (decision === true ){

            const randomFour = Math.floor(Math.random() * 90000 ) + 10000

            const newUser = await this.userService.createUser({
                        role:Role.USER,
                        user_type:UserType.DEFAULT,
                        name:'NEW',
                        surname:'USER',
                        mobile_number:'07401010101',
                        user_name:`NEW_USER${randomFour}`,
                        email:`newUser${randomFour}@transact.com`,
                        password:'hashedpassword',
                        main_bank:bank
                     }, amount  
                    )
            
            await this.userRepository.save(newUser)

    
            this.receiverFinalAgreement(
                contractId,
                newUser.account,
                contract.participants,
                "accepted"
            )

            
            await this.notificationService.createNotification(
                senderUser.id,
                `contract accepted by NEW USER`,
                'NEW USER'
            );

            return this.signIn.login(newUser)

        }else{

        }

        this.receiverFinalAgreement(
            contractId,
            "NEW USER",
            contract.participants,
            "accepted"
        )

     
        await this.notificationService.createNotification(
            senderUser.id,
            `contract declined by NEW USER`,
            'NEW USER'
        );

         return 'New user declined the contract'
           
    }
}
