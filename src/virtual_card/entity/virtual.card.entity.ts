import { Entity,PrimaryGeneratedColumn,Column } from "typeorm";

export enum CARDTYPE {

        MAIN = 'main',
        TEMP = 'temporary'
}

@Entity("virtual_card")
export class VirtualCard {

        @PrimaryGeneratedColumn('uuid')
                id:string;

        @Column({
                type: 'enum',
                enum: CARDTYPE,
                default: CARDTYPE.MAIN
        })
                cardType: CARDTYPE

        @Column()
                fullName:string;

        @Column()
                pan:string;

        @Column()
                CVC: string;
        
        @Column()
                expiry: string;

        @Column({ nullable:true })
                expiryTime: string;

        @Column()
                billingAddress: string;
      


}