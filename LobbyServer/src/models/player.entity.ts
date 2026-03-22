//import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/*
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
    */


import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/DB.config";

export class Player extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public nickname!:string;
}


Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname:{
        type: DataTypes.STRING,
        allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "players",
    timestamps: false,
  }
);