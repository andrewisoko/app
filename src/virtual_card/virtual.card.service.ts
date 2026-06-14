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

    async account(id:string){

        const account = await this.accountModel.findById(id).exec()
        if ( ! account ) throw new NotFoundException('{virtual card} account not found')
        
        return { 
            expDate: account.expiry,
            pan: account.pan,
        }
    }


    async createMainCard(
        fullName:string,
        pan:string,
        accounNumber:number,
        id:any
       
    ){
     
        const CVC = (Math.floor(Math.random() * 900) + 100).toString()
        const account = await this.account(id)
        const expiryDate = account.expDate
       
        const POStoken = this.jwtService.sign({ pan, expiry: expiryDate });

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
        const account = await this.account(senderAccountId);
        const pan = account.pan;

        const POStoken = this.jwtService.sign({ pan, expiry: expiryDate });

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

    const qrPayload: CardDetails = {
        card_type: card.card_type,
        full_name: card.full_name,
        pan: card.pan,
        CVC: card.CVC,
        account_number: card.account_number.toString(),
        expiry: card.expiry,
        billing_address: card.billing_address,
        qr_token: card.POS_token,
    };

    return QRCode.toDataURL(JSON.stringify(qrPayload));
}
    
}
