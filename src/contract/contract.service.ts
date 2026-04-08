import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, SPLIT_AGREEMENT, CONTRACT_STATUS } from './entity/contract.entity';
import { Repository } from 'typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { User } from 'src/user/entity/user.entity';
import { Account, ACCOUNT_STATUS, ACCOUNT_TYPE } from 'src/account/entity/account.entity';

export interface contractProps{

    sender: string,
    receiver: string,
    split_agreement: SPLIT_AGREEMENT,
    transaction:Transaction,
    contractStatus:CONTRACT_STATUS,
    repayment_agreement?:string,
    event_agreement?:string,
    location_agreement?:string,
    time_agreement?:string

} 
@Injectable()
export class ContractService {

    constructor( 
        @InjectRepository( Contract ) private readonly contractRepository:Repository<Contract>,
        @InjectRepository( User ) private readonly userRepository:Repository<User>,
        @InjectRepository( Account ) private readonly accountRepository:Repository<Account>,

 ){}

    createContract(
        contract:contractProps
    ){
        
        if (!contract.repayment_agreement) throw new NotFoundException( 'repayment agreement not established');
        if (!contract.event_agreement) throw new NotFoundException( 'event agreement not established');
        if (!contract.location_agreement) throw new NotFoundException( 'location agreement not established');
        if (!contract.time_agreement) throw new NotFoundException( 'time agreement not established');

        const contractPayload = {
            sender: contract.sender,
            receiver: contract.receiver,
            split_agreement: contract.split_agreement,
            transaction:contract.transaction,
            contractStatus: contract.contractStatus,
            repayment_agreement:contract.repayment_agreement,
            event_agreement: contract.event_agreement,
            location_agreement: contract.location_agreement,
            time_agreement:contract.time_agreement
        };
        return contractPayload
    };

    async sendContract(contractPayload:contractProps){

        const receiver = await this.userRepository.findOne( { where: { userName: contractPayload.receiver }})
        if ( ! receiver ){
            const createDummyAccount = await this.accountRepository.create({
                            accountNumber:10101010,
                            currency: 'GBP',
                            balance: 0,
                            account_type:ACCOUNT_TYPE.DUMMY,
                            // user:user,
                            status:ACCOUNT_STATUS.PENDING,
                            createdAt: new Date()
            });

            /* scan qr code to activate dummy account */
        }
        else{

            /*send contract to receiver */
        };
    };
}
