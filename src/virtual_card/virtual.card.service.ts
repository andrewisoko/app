import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CARDTYPE, VirtualCard } from './entity/virtual.card.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountDocument } from 'src/account/document/account.doc';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';





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
       
      
      
        return this.vcRepository.create({

            card_type: CARDTYPE.MAIN,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_number:accounNumber,
            expiry: expiryDate,
            billing_address: '26, LONDON STREET, LEEDS, L20 3FX'

        })
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

        const tempCard = this.vcRepository.create({
            card_type: CARDTYPE.TEMP,
            full_name: fullName,
            pan: pan,
            CVC: CVC,
            account_number:accountNumber,
            expiry_time: expiryTime,
            expiry:expiryDate,
            billing_address: '26, LONGWAY ROAD, MANCHESTER, M13 19XD',
            account_users: accountUsers,
        });

        return this.vcRepository.save(tempCard);
    }

    cardQRCode(pan:string,expiry:string){

        const token = this.jwtService.sign({
            pan:pan,expiry:expiry
        })
    }
    
}
