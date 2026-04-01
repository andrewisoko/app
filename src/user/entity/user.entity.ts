import { Entity,PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Account } from "src/account/entity/account.entity";

@Entity("User")
export class User {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column()
        fullName:string;

    @Column()
        userName:string;

    @Column()
        email:string;

    @Column()
        password:string;  
    
    @OneToMany( ()=>Account,accounts => accounts.user )
        accounts:Account[]
}