import { User } from "src/user/entity/user.entity";
import { Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn} from "typeorm";
;

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
                card_type: CARDTYPE

        @Column({ type:'text', default: 'Full Name' })
                full_name:string;

        @Column()
                pan:string;

        @Column()
                CVC: string;
        
        @Column()
                expiry: string;

        @Column({ nullable:true })
                expiry_time: string;

        @Column({ type:'text', default: '26, LONDON STREET, LEEDS, L20 3FX' })
                billing_address: string;

        @Column({ type: 'simple-array', nullable: true })
                account_users:string[]
        
         @CreateDateColumn({ name: 'created_at' })
                created_at: Date;
        
        @UpdateDateColumn({ name: 'updated_at' })
                updated_at: Date;

}