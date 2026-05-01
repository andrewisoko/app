import { User } from "src/user/entity/user.entity";
import { Contract } from "src/contract/entity/contract.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";

@Entity("inbox")
export class Inbox {

        @PrimaryGeneratedColumn('uuid')
        id: string;

         @CreateDateColumn({ name: 'created_at' })
                createdAt: Date;
        
        @UpdateDateColumn({ name: 'updated_at' })
        updatedAt: Date;

        @Column({ nullable: true, type: 'simple-json' })
        mostRecent: Partial<Contract>[];

        @Column({ nullable: true, type: 'simple-json' })
        history: Partial<Contract>[];

        @OneToOne(() => User, user => user.inbox )
        user: User;  /*check user database */

        @OneToOne(() => Contract, contract => contract.inbox)
        @JoinColumn({ name: 'contract_id' })
        contract: Contract;

}
