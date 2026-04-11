import { Contract } from "src/contract/entity/contract.entity";
import { User } from "src/user/entity/user.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";

@Entity("Inbox")
export class Inbox {

        @PrimaryGeneratedColumn('uuid')
        id: string;

        @CreateDateColumn({ name: 'timestamp' })
        createdAt: Date;

        @OneToOne(() => Contract, { nullable: true })
        @JoinColumn()
        mostRecent: Contract;

        @OneToMany(() => Contract, (contract) => contract.id )
        history: Contract[];

        @OneToOne(() => User, user => user.inbox )
        user: User;

}
