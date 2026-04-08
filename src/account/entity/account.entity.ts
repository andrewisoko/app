import { User } from "src/user/entity/user.entity";
import { Entity,PrimaryGeneratedColumn,Column, ManyToOne,CreateDateColumn } from "typeorm";

export enum ACCOUNT_STATUS {

    ACTIVE = "active",
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended',
    CLOSE  = 'Closed',
    PENDING = 'Pending',
}

export enum ACCOUNT_TYPE {

    DUMMY = "dummy",
    USER = "user"
}

@Entity("Account")
export class Account {

    @PrimaryGeneratedColumn('uuid')
        id:string;
    
    @Column( { type:'integer',  default: 12345678 } )
        accountNumber:number;

    @Column( { 
        type:'enum', 
        enum: ACCOUNT_TYPE,
        default: ACCOUNT_TYPE.DUMMY,
        } )
        account_type:ACCOUNT_TYPE

    @Column( 'decimal', { default:0 } )
        balance:number;

    @Column('varchar', { length:3 , default:'GBP' } )
        currency:string;

    @Column({
        type:'enum',
        enum:ACCOUNT_STATUS,
        default:ACCOUNT_STATUS.PENDING,
    })
        status:ACCOUNT_STATUS;
    
    

    @CreateDateColumn( { name:'timestamp' } )
        createdAt:Date;
    
    @ManyToOne( ()=> User,user => user.accounts )
        user:User   
}