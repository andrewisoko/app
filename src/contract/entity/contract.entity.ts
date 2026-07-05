import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
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

export enum RECEIVER_TYPE {
    ONE_TIME = "new-user",
    EXISTING_USER = "existing-user"
}

@Entity('contract')
export class Contract {

    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        participants:number;

    @Column({ type: 'enum', enum: RECEIVER_TYPE, default:RECEIVER_TYPE.EXISTING_USER })
        receiver_type:RECEIVER_TYPE;

    @Column({ type: 'varchar' })
        sender: string;

    @Column({ type: 'simple-array' })
        receiver: string | null [];

    @Column({ type: 'simple-array' })
        all_usernames: string[];

    @Column({ type: 'enum', enum: SPLIT_AGREEMENT, default: SPLIT_AGREEMENT.AMOUNT })
        split_agreement: SPLIT_AGREEMENT;

    @Column({ type: 'enum', enum: CONTRACT_STATUS, default: CONTRACT_STATUS.PENDING })
        contract_status: CONTRACT_STATUS;
        
    @Column('varchar', { default: ["2026-04-18T12:00:00Z", "2026-04-18T15:00:00Z" ] })
        time_agreement: Date[]

    @Column({ type: 'numeric', nullable:true })
        sender_percentage: number;

    @Column({ type: 'simple-array', default: [] })
        receiver_percentage: number[];

    @Column({ type: 'numeric', nullable:true })
        sender_amount: number;

    @Column({ type: 'simple-array', default: [] })
        receiver_amount: number[];

    @Column({ type: 'varchar', nullable: true })
        repayment_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        event_agreement: string;

    @Column({ type: 'varchar', nullable: true })
        location_agreement: string;

    @OneToMany(() => Transaction, transaction => transaction.contract)
        transactions: Transaction[];

    // @OneToOne(() => Inbox, inbox => inbox.contract)
    //     inbox: Inbox;

    @CreateDateColumn({ name: 'created_at' })
        created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updated_at: Date;
}
