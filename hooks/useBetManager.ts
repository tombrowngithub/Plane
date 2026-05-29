import { useRef, useState } from "react";
import { BetState } from "@/types/autobet";

import { GameStatsState } from "@/types/stats";

type BetNumber = 1 | 2;

export const useBetManager = () => {

    const [balance, setBalance] = useState(5000);

    const [bet1, setBet1] = useState<BetState>({
        amount: '',
        placed: false,
        cashedOut: false,
        profit: 0,
    });

    const [bet2, setBet2] = useState<BetState>({
        amount: '',
        placed: false,
        cashedOut: false,
        profit: 0,
    });

    const cashoutInProgressRef = useRef<Record<1 | 2, boolean>>({
        1: false,
        2: false,
    });

    const [stats, setStats] = useState<GameStatsState>({totalBets: 0, totalWins: 0, totalLosses: 0, totalProfit: 0});

    const placeBet = (betNumber: BetNumber) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        const amount = Number(currentBet.amount);

        if (!amount || amount <= 0) return;

        if (amount > balance) return;

        cashoutInProgressRef.current[betNumber] = false;

        registerBet();

        setBalance(prev => {
            const newBalance = prev - amount;
            return newBalance <= 0 ? 5000 : newBalance;
        });

        if (betNumber === 1) {

            setBet1(prev => ({
                ...prev,
                placed: true,
                cashedOut: false,
                profit: 0,
            }));

        } else {

            setBet2(prev => ({
                ...prev,
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        }
    };

    const cashOut = (betNumber: BetNumber, multiplier: number) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        if (!currentBet.placed || currentBet.cashedOut) return null;

        if (cashoutInProgressRef.current[betNumber]) return null;

        cashoutInProgressRef.current[betNumber] = true;

        const amount = Number(currentBet.amount);

        const settledMultiplier = Number(multiplier.toFixed(2));

        const profit = Number((amount * settledMultiplier).toFixed(2));

        setBalance(prev => prev + profit);

        if (betNumber === 1) {

            setBet1(prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit,
            }));

        } else {

            setBet2(prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit,
            }));
        }

        setStats(prev => ({
            ...prev,
            totalWins: prev.totalWins + 1,
            totalProfit: Number((prev.totalProfit + (profit - amount)).toFixed(2))
        }));

        return {
            profit,
            settledMultiplier,
        };
    };

    const registerLoss = () => {

        setStats(prev => ({
            ...prev,
            totalLosses: prev.totalLosses + 1,
        }));
    }

    const registerBet = () => {

        setStats(prev => ({
            ...prev,
            totalBets: prev.totalBets + 1,
        }));
    };

    return {
        balance,
        setBalance,

        bet1,
        setBet1,

        bet2,
        setBet2,

        cashoutInProgressRef,

        placeBet,
        cashOut,
        registerLoss,
        stats,
        registerBet
    };
};
