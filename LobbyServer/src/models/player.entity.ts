
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/DB.config";

export class Player extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public nickname!:string;
  public headerImageSource!: string;
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
    },
    headerImageSource:{
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue: "default"
    }
  },
  {
    sequelize,
    tableName: "players",
    timestamps: false,
  }
);