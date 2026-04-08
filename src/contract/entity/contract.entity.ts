import { Transaction } from "src/transaction/entity/transaction.entity";
import { Entity,PrimaryGeneratedColumn,OneToMany,CreateDateColumn,Column } from "typeorm";

export enum SPLIT_AGREEMENT{

        PERCENTAGE = 'percentage',
        AMOUNT = 'amount',
   
}

export enum CONTRACT_STATUS{

        ACCEPTED = 'accepted',
        DECLINED = 'declined',
        FAILED = 'failed',
        PENDING = 'pending'
}

@Entity("Contract")
export class Contract {

        @PrimaryGeneratedColumn('uuid')
                id:string;

        @CreateDateColumn( { name:'timestamp'} )
                createdAt:Date;

        @Column( 'varchar',{ length:15, default:'John '} )
                sender:string;

        @Column('varchar',{ length:15, default:'Paul '} )
                 receiver:string;;

        @Column({
                type:'enum',
                enum:SPLIT_AGREEMENT,
                default:SPLIT_AGREEMENT.AMOUNT
        })
                split_agreement: SPLIT_AGREEMENT;
        
        @Column({
                type:'enum',
                enum:CONTRACT_STATUS,
                default:CONTRACT_STATUS.PENDING
        })
                contract_status:CONTRACT_STATUS
        
        @Column( { nullable:true } )
                location_agreement:string;

        @Column( { nullable:true } )
                time_agreement:string;
                
        @Column( { nullable:true } )
                event_agreement:string;

        @Column( { nullable:true } )
                repayment_agreement:string;

        @OneToMany(()=>Transaction, transactions => transactions.contract)
                transactions:Transaction[];
}