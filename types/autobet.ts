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

export type BetSettlementResult = {
    betNumber: 1 | 2;
    outcome: 'win' | 'loss';
    amount: number;
    multiplier?: number;
    payout?: number;
    profit?: number;
};

export type BetSettlement = {
    id: number;
    balance: number;
    results: BetSettlementResult[];
};
