import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()  
export class Player {
    @PrimaryGeneratedColumn("uuid") // uuid автоматически генерируется
    id!: string;

    @Column() 
    nickname!: string;

    @Column()
    password_hash!: string;

    @Column()
    email!: string;
}