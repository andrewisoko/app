import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CARDTYPE, VirtualCard } from './entity/virtual.card.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountDocument } from 'src/account/document/account.doc';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';

export interface CardDetails{

    card_type: string,
    full_name: string,
    pan: string,
    CVC: string
    account_number: string,
    expiry: string,
    billing_address: string,
    qr_token:string,

}


@Injectable()
export class VirtualCardService {
    constructor( 
        @InjectRepository(VirtualCard) private readonly vcRepository:Repository<VirtualCard>,
        @InjectRepository(User)private readonly userRepository: Repository<User>,
        @InjectModel('Account') private readonly accountModel:Model<AccountDocument>,
        private readonly jwtService:JwtService,
        private readonly configService: ConfigService,
){}

    // async account(id:string){

    //     const account = await this.accountModel.findById(id).exec()
    //     if ( ! account ) throw new NotFoundException('{virtual card} account not found')
        
    //     return { 
    //         expDate: account.expiry,
    //         pan: account.pan,
    //     }
    // }


    async createMainCard(
        fullName:string,
        pan:string,
        accounNumber:number,
        id:any
       
    ){
     
        const CVC = (Math.floor(Math.random() * 900) + 100).toString()
        const account = await this.accountModel.findById(id).exec()
         const kafkaKey = 'TRANSACT' + '_' + crypto.randomUUID();

        if ( ! account ) throw new NotFoundException('{virtual card} account not found')
        const expiryDate = account.expiry

        let POStoken = ''
       
        
        const card = await this.vcRepository.save(this.vcRepository.create({

            card_type: CARDTYPE.MAIN,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_id:[id],
            account_number:accounNumber,
            expiry: expiryDate,
            billing_address: '26, LONDON STREET, LEEDS, L20 3FX',
            status:'active',
            POS_token: POStoken,
            
        }));
      
        POStoken = this.jwtService.sign({ 

            key: kafkaKey,
            pan: card.pan,
            expiry: card.expiry,
            customer:card.full_name,
            account: account.id
        },{
            secret: this.configService.get<string>('JWT_CARD_KEY'),
        }
    );

        card.POS_token = POStoken
        await this.vcRepository.save(card)

        return card;
    }

    async createTempCard(

        fullName: string,
        expiryTime: string,
        senderAccountId: string,
        accountNumber:number,
        accountUsers: string[],
        expiryDate:string
    ){
       
        const CVC = (Math.floor(Math.random() * 900) + 100).toString();

        const kafkaKey = 'TRANSACT' + '_' + crypto.randomUUID();

        const senderAccount = await this.accountModel.findById(senderAccountId).exec()
        if ( ! senderAccount ) throw new NotFoundException('{virtual card} account not found')

        const receiverAccount = await this.accountModel.findById(accountUsers[1]).exec()
        if ( ! receiverAccount ) throw new NotFoundException('{virtual card} account not found')


        const pan = senderAccount.pan;
        let POStoken = ''

        
        const tempCard = await this.vcRepository.save(this.vcRepository.create({
            card_type: CARDTYPE.TEMP,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_number:accountNumber,
            account_id: accountUsers,
            expiry_time: expiryTime,
            expiry:expiryDate,
            billing_address: '26, LONGWAY ROAD, MANCHESTER, M13 19XD',
            account_users: accountUsers,
            status:'active',
            POS_token: POStoken,
        }));

          POStoken = this.jwtService.sign({ 
          key: kafkaKey,        
          pan: tempCard.pan,
          expiry: tempCard.expiry,
          customer:tempCard.full_name,
          account: senderAccount.id
        },{
            secret: this.configService.get<string>('JWT_CARD_KEY'),
        }
    );

        tempCard.POS_token = POStoken
        await this.vcRepository.save(tempCard)

    
        await Promise.all([
            senderAccount.save(),
            receiverAccount.save(),
        ]);

        return tempCard;
    }

    async getVirtualCard(id: string): Promise<VirtualCard> {

        const card = await this.vcRepository.findOne({ where: { id } });
        if (!card) throw new NotFoundException(`Virtual card with id ${id} not found`);
        return card;
    }


    async getBulkCards(accountId: string): Promise<VirtualCard[]> {
        if (!accountId) {
            return [];
        }

        const account = await await this.accountModel.findById(accountId).exec()

        if (!account) {
            return [];
        }

        const cards: VirtualCard[] = [];

        const mainCard = await this.vcRepository.findOne({where:{id:account.mainVirtualCard}}) 
        if(!mainCard) throw new NotFoundException("Main card not found")

        if (account.mainVirtualCard) {
            cards.push(mainCard);
        }

        for( const tempCard of account.tempVirtualCard ){

            const card = await this.vcRepository.findOne({where:{id:tempCard}}) 
            if(! card) throw new NotFoundException(`Temp card ${card} not found`)
            cards.push(card);
        }
        return cards;
    }

    async cardQRCode(token: string): Promise<string> {

        const payload = `paycard://${token}`;

    return QRCode.toDataURL(payload);
}
    
}
