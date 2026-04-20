import { IsString, IsEnum, IsInt } from 'class-validator';

export enum MatchDifficulty {
  Easy = 'Easy',
  Normal = 'Normal',
  Hard = 'Hard',
}

export class CreateSessionRequest{
  @IsInt()
  Seed!: number;

  @IsString()
  LobbyId!: string;

  @IsEnum(MatchDifficulty)
  matchDifficulty!: MatchDifficulty;
}