import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Contract } from "src/contract/entity/contract.entity";

@Entity("transaction")
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
        id:string;

    @Column('varchar', {length: 50 ,default:"TRANSACT RETAIL"})
        merchant:string;
    
    @Column( 'varchar', {default:'PENDING'} )
        status:string;
    
    @Column('decimal', { precision: 6, scale: 2, default: 0 } )
        amount:number;
    
    @CreateDateColumn({ name:'timestamp' })
        timestamp:Date
    
    @Column('varchar', { length:3, default:"GBP" })
        currency:string;

    @ManyToOne(() => Contract, contract => contract.transactions,  {
        nullable: true })

    @JoinColumn({ name: 'contract_id',})
        contract?: Contract;
}