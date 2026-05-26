import {AutoBet} from "@/types/autobet";

export const getNextBetAmount = (
    autobet: AutoBet,
    isWin: boolean
) => {

    let nextBet = autobet.baseBet;

    if (isWin) {

        if (autobet.onWinAction === 'double_stake') {
            nextBet = autobet.currentBet * 2;
        }

    } else {

        if (autobet.onLoseAction === 'double_stake') {
            nextBet = autobet.currentBet * 2;
        }
    }

    return nextBet;
};

export const shouldStopAutobet = (
    nextBet: number,
    balance: number,
    maxStake: number
) => {

    if (nextBet > maxStake) {
        return true;
    }

    if (nextBet > balance) {
        return true;
    }

    return false;
};
