import { User } from "src/user/entity/user.entity";
import { Contract } from "src/contract/entity/contract.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";

@Entity("inbox")
export class Inbox {

        @PrimaryGeneratedColumn('uuid')
                id: string;

         @CreateDateColumn({ name: 'created_at' })
                created_at: Date;
        
        @UpdateDateColumn({ name: 'updated_at' })
                updated_at: Date;
        
        @Column({ nullable: true })
                most_recent_expires_at: Date;

        @Column({ type: 'simple-json', default : [] })
                most_recent: Partial<Contract>[];

        @Column({  type: 'simple-json' , default : [] })
                history: Partial<Contract>[];

        @OneToOne(() => User, user => user.inbox )
                user: User;  /*check user database */

        // @OneToOne(() => Contract, contract => contract.inbox)
        // @JoinColumn({ name: 'contract_id' })
                // contract: Contract;

}
