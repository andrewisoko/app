import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Transaction } from 'src/transaction/entity/transaction.entity';
import { Inbox } from 'src/inbox/entity/inbox.entity';



export enum SPLIT_AGREEMENT {
    PERCENTAGE = 'percentage',
    AMOUNT = 'amount',
}

export enum CONTRACT_STATUS {
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    FAILED = 'failed',
    PENDING = 'pending',
}

export enum CONTRACT_TYPE {
    WITH_NEW_USER = "with-new-user",
    EXISTING_USERS = "existing-user"
}

export enum TRANSACTION_TYPE_CONTRACT {
    ONE_TIME = "one-time",
    WITH_TIME_AGREEMENT = "with-time-agreement"
}


@Entity('contract')
export class Contract {

    @PrimaryColumn()
        id: string;

    @Column()
        participants:number;

    @Column({ type: 'enum', enum: CONTRACT_TYPE, default:CONTRACT_TYPE.EXISTING_USERS })
        contract_type:CONTRACT_TYPE;
    
    @Column({ type:'enum',enum: TRANSACTION_TYPE_CONTRACT, default:TRANSACTION_TYPE_CONTRACT.ONE_TIME})
        transaction_type:TRANSACTION_TYPE_CONTRACT

    @Column({ type: 'varchar' })
        sender: string;
    
    @Column({ type: 'simple-array' })
    receiver: string[];
    
    @Column({ type: 'simple-array' })
        all_usernames: string[];

        
    @Column({ type: 'enum', enum: CONTRACT_STATUS, default: CONTRACT_STATUS.PENDING })
        contract_status: CONTRACT_STATUS;
        
        
    @Column({ type: 'numeric', nullable:true })
        sender_percentage: number;
        
    @Column({ type: 'numeric', nullable:true })
    sender_amount: number;
    
    @Column({ type: 'simple-array', default: [] })
         receiver_percentage: number[];
    
    @Column({ type: 'simple-array', default: [] })
        receiver_amount: number[];


    @Column({ type: 'enum', enum: SPLIT_AGREEMENT, default: SPLIT_AGREEMENT.AMOUNT })
        split_agreement: SPLIT_AGREEMENT;
    
    @Column('varchar', { nullable:true })
        time_agreement: Date[]

    @Column({ type: 'varchar', nullable: true })
        repayment_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        event_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        location_agreement: string;

    @OneToMany(() => Transaction, transaction => transaction.contract)
        transactions: Transaction[];


    @CreateDateColumn({ name: 'created_at' })
        created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updated_at: Date;
}
