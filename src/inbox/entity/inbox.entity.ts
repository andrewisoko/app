import { User } from "src/user/entity/user.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, Column } from "typeorm";

@Entity("Inbox")
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

}
