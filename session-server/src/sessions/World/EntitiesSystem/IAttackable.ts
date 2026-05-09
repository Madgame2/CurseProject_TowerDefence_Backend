

export interface IAttackable{
    current_hp: number;
    max_hp: number
    takeDamage(amount: number): void;
}