import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CARDTYPE, VirtualCard } from './entity/virtual.card.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountDocument } from 'src/account/document/account.doc';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';

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
        @InjectModel('Account') private readonly accountModel:Model<AccountDocument>,
        private readonly jwtService:JwtService,
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
        if ( ! account ) throw new NotFoundException('{virtual card} account not found')
        const expiryDate = account.expiry

        let POStoken = ''
       
        
        const card = await this.vcRepository.save(this.vcRepository.create({

            card_type: CARDTYPE.MAIN,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_number:accounNumber,
            expiry: expiryDate,
            billing_address: '26, LONDON STREET, LEEDS, L20 3FX',
            POS_token: POStoken,
            
        }));

        POStoken = this.jwtService.sign({ 

            pan: card.pan,
            expiry: card.expiry,
            customer:card.full_name,
            account: account.id
        });

        card.POS_token = POStoken
        await this.vcRepository.save(card)

        console.log('card details',card)

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

        const account = await this.accountModel.findById(senderAccountId).exec()
        if ( ! account ) throw new NotFoundException('{virtual card} account not found')

        const pan = account.pan;
        let POStoken = ''

        
        const tempCard = await this.vcRepository.save(this.vcRepository.create({
            card_type: CARDTYPE.TEMP,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_number:accountNumber,
            expiry_time: expiryTime,
            expiry:expiryDate,
            billing_address: '26, LONGWAY ROAD, MANCHESTER, M13 19XD',
            account_users: accountUsers,
            POS_token: POStoken,
        }));

        POStoken = this.jwtService.sign({          
          pan: tempCard.pan,
          expiry: tempCard.expiry,
          customer:tempCard.full_name,
          account: account.id
        });

        tempCard.POS_token = POStoken
        await this.vcRepository.save(tempCard)

        console.log('card details',tempCard)
        return tempCard;
    }

    async getVirtualCard(id: string): Promise<VirtualCard> {

        const card = await this.vcRepository.findOne({ where: { id } });
        if (!card) throw new NotFoundException(`Virtual card with id ${id} not found`);
        return card;
    }

    async getVirtualCards(accountNumber: number): Promise<VirtualCard[]> {

        const cards = await this.vcRepository.find({ 
            where: { account_number: accountNumber } 
        });
        
        if (!cards || cards.length === 0) {
            throw new NotFoundException(`No virtual cards found for account ${accountNumber}`);
        }
        
        return cards;
    }

    async cardQRCode(cardId: string): Promise<string> {

    const card = await this.vcRepository.findOne({
        where: { id: cardId }
    });

    if (!card) {
        throw new NotFoundException('Card not found');
    }

    const payload = `paycard://${card.POS_token}`;

    return QRCode.toDataURL(payload);
}
    
}
