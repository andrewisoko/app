import { User } from "src/user/entity/user.entity";
import { Contract } from "src/contract/entity/contract.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, Column } from "typeorm";

@Entity("inbox")
export class Inbox {

        @PrimaryGeneratedColumn('uuid')
        id: string;

        @CreateDateColumn({ name: 'timestamp' })
        createdAt: Date;

        @Column({ nullable: true, type: 'text' })
        mostRecent: string;

        @Column({ nullable: true, type: 'simple-array' })
        history: string[];

        @OneToOne(() => User, user => user.inbox )
        user: User;

        @OneToOne(() => Contract, contract => contract.inbox)
        @JoinColumn({ name: 'contract_id' })
        contract: Contract;

}
