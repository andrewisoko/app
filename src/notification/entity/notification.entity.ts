import { User } from "src/user/entity/user.entity";
import { Entity, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, Column } from "typeorm";

@Entity("notifications")
export class Notification {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ type: 'text' })
    from:string;

    @Column({ type: 'text' })
    message: string;

    @Column({default:false})
    read: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @OneToOne(() => User, user => user.notification)
    user: User;
}
