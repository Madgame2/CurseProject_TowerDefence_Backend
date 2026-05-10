

export interface IAttackable{
    current_hp: number;
    max_hp: number
    takeDamage(amount: number): void;

    subscribeDeath(callback: () => void): void;
    unsubscribeDeath(callback: () => void): void;
}