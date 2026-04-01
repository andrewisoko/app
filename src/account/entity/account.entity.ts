import { User } from "src/user/entity/user.entity";
import { Entity,PrimaryGeneratedColumn,Column, ManyToOne } from "typeorm";

export enum STATUS {

    ACTIVE = "active",
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended',
    CLOSE  = 'Closed',
    PENDING = 'Pending',
}

@Entity("Account")
export class Account {

    @PrimaryGeneratedColumn('uuid')
        id:string;
    
    @Column()
        accountNumber:number;

    @Column()
        balance:number;

    @Column()
        currency:string;

    @Column({
        type:'enum',
        enum:STATUS,
        default:STATUS,
    })
        status:STATUS;
    
       @Column()
    createdAt:Date;

    @Column()
    updatedAt:Date;
    
    @ManyToOne( ()=> User,user => user.accounts )
        user:User   
}