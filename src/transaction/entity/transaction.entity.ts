import { Entity,PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


@Entity("transaction")
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column()
        available_balance:number;
    
    @Column()
        status:string;
    
    @Column()
        amount:number;
    
    @Column()
        date:string;
}