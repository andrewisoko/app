import { Entity,PrimaryGeneratedColumn, Column, OneToOne,JoinColumn,CreateDateColumn,UpdateDateColumn, ManyToOne } from "typeorm";
import { OneToOne as TypeORMOneToOne } from "typeorm";
import { Inbox } from "src/inbox/entity/inbox.entity";
import { Contract } from "src/contract/entity/contract.entity";


export enum Role {
    USER = "user",
    ADMIN = "admin",
}

export enum MainBank {
    LLOYDS = 'lloyds',
    BARCLAYS = 'barclays',
    NATWEST = 'natwest',
    SANTANDER = 'santander',
    NATIONWIDE = 'nationwide'
}

export enum UserType {
    DEFAULT = "default",
    COMPETED = "completed",
}
@Entity("users")
export class User {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column({
        type:"enum",
        enum: Role,
        default:Role.USER,
        })
        role:Role

    @Column({
        type:'enum',
        enum:UserType,
        default:UserType.DEFAULT
    })
        user_type: UserType

    @Column( 'varchar', { length:10 , default: 'Default' })
        name:string;

    @Column( 'varchar', { length:10 , default: 'User' })
        surname:string;

    @Column( 'varchar', { default:123435673 } )
        mobile_number: string

    @Column( 'varchar', { length:50 ,default: 'UserDef2345' } )
        user_name:string;

    @Column('varchar', { length:30 , default: 'userdefault100@email.com' })
        email:string;

    @Column('varchar',{length:50, default:"{}"})
        accounts:string[];

    @Column( 'varchar', { default: 'Passwordxmx0'} )
        password:string; 

    @Column({ type:'simple-json', default: [] })
        recipients:string[];
    
    @Column({ type: 'simple-json',  default: [] })
        created_contract: Partial<Contract>[];

    @OneToOne( ()=> Inbox,inbox => inbox.user )
        @JoinColumn()
        inbox: Inbox;

    @Column({
        type:'enum',
        enum:MainBank,
        default:MainBank.BARCLAYS
    })
        main_bank: MainBank
    @CreateDateColumn({ name: 'created_at' })
        created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
        updated_at: Date;
}