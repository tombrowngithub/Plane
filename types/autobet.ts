export interface AutoBet {
    enabled: boolean;

    baseBet: number;
    currentBet: number;
    maxStake: number;
    autoCashout: number;

    onWinAction: 'back_to_base' | 'double_stake';
    onLoseAction: 'back_to_base' | 'double_stake';

    waitingNextRound: boolean;
}

export interface BetState {
    amount: string;
    placed: boolean;
    cashedOut: boolean;
    profit: number;
}
