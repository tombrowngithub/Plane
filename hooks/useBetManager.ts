import {SetStateAction, useEffect, useRef, useState} from "react";
import {socket} from "@/services/socket";
import {BetSettlement, BetState} from "@/types/autobet";

import {GameStatsState} from "@/types/stats";

type BetNumber = 1 | 2;

const initialStats: GameStatsState = {
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    totalProfit: 0,
};

const createInitialBet = (): BetState => ({
    amount: '',
    placed: false,
    cashedOut: false,
    profit: 0,
});

const readBetNumber = (value: unknown): BetNumber | null => {
    const betNumber = Number(value);

    return betNumber === 1 || betNumber === 2 ? betNumber : null;
};

const readStats = (stats: Partial<GameStatsState> | undefined): GameStatsState => ({
    totalBets: Number(stats?.totalBets || 0),
    totalWins: Number(stats?.totalWins || 0),
    totalLosses: Number(stats?.totalLosses || 0),
    totalProfit: Number(stats?.totalProfit || 0),
});

export const useBetManager = () => {

    const [balance, setBalance] = useState(5000);

    const [bet1, setBet1] = useState<BetState>(createInitialBet);

    const [bet2, setBet2] = useState<BetState>(createInitialBet);

    const cashoutInProgressRef = useRef<Record<1 | 2, boolean>>({
        1: false,
        2: false,
    });

    const settlementIdRef = useRef(0);

    const [stats, setStats] = useState<GameStatsState>(initialStats);
    const [lastSettlement, setLastSettlement] = useState<BetSettlement | null>(null);

    const applyBalanceAndStats = (data: { balance?: number; stats?: Partial<GameStatsState> }) => {
        const nextBalance = Number(data.balance);

        if (Number.isFinite(nextBalance)) {
            setBalance(nextBalance);
        }

        if (data.stats) {
            setStats(readStats(data.stats));
        }
    };

    const setBetState = (betNumber: BetNumber, updater: SetStateAction<BetState>) => {
        const setter = betNumber === 1 ? setBet1 : setBet2;

        setter(updater);
    };

    const publishSettlement = (settlement: Omit<BetSettlement, 'id'>) => {
        settlementIdRef.current++;

        setLastSettlement({
            id: settlementIdRef.current,
            ...settlement,
        });
    };

    useEffect(() => {

        const handlePlayerState = (data: any = {}) => {
            applyBalanceAndStats(data);

            const bets = Array.isArray(data.bets) ? data.bets : [];

            bets.forEach((bet: any) => {
                const betNumber = readBetNumber(bet.betNumber);

                if (!betNumber) return;

                setBetState(betNumber, prev => ({
                    ...prev,
                    amount: String(bet.amount),
                    placed: bet.state === 'pending' || bet.state === 'active',
                    cashedOut: false,
                    profit: 0,
                }));
            });
        };

        const handleBetAccepted = (data: any = {}) => {
            const betNumber = readBetNumber(data.betNumber);

            if (!betNumber) return;

            applyBalanceAndStats(data);
            cashoutInProgressRef.current[betNumber] = false;

            setBetState(betNumber, prev => ({
                ...prev,
                amount: String(data.amount),
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        };

        const handleBetRejected = (data: any = {}) => {
            const betNumber = readBetNumber(data.betNumber);

            if (betNumber) {
                cashoutInProgressRef.current[betNumber] = false;
            }

            console.warn('Bet rejected by server:', data.reason);
        };

        const handleCashedOut = (data: any = {}) => {
            const betNumber = readBetNumber(data.betNumber);
            const payout = Number(data.payout);
            const amount = Number(data.amount);
            const multiplier = Number(data.multiplier);
            const profit = Number(data.profit);

            if (!betNumber) return;

            applyBalanceAndStats(data);

            setBetState(betNumber, prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit: Number.isFinite(payout) ? payout : 0,
            }));

            publishSettlement({
                balance: Number(data.balance || 0),
                results: [{
                    betNumber,
                    outcome: 'win',
                    amount,
                    multiplier,
                    payout,
                    profit,
                }],
            });
        };

        const handleBetLost = (data: any = {}) => {
            const losses = Array.isArray(data.losses) ? data.losses : [];

            applyBalanceAndStats(data);

            losses.forEach((loss: any) => {
                const betNumber = readBetNumber(loss.betNumber);

                if (!betNumber) return;

                cashoutInProgressRef.current[betNumber] = false;

                setBetState(betNumber, prev => ({
                    ...prev,
                    placed: false,
                    cashedOut: false,
                    profit: 0,
                }));
            });

            publishSettlement({
                balance: Number(data.balance || 0),
                results: losses
                    .map((loss: any) => {
                        const betNumber = readBetNumber(loss.betNumber);

                        if (!betNumber) return null;

                        return {
                            betNumber,
                            outcome: 'loss' as const,
                            amount: Number(loss.amount),
                        };
                    })
                    .filter((result: BetSettlement['results'][number] | null): result is BetSettlement['results'][number] => result !== null),
            });
        };

        const handleCrash = () => {
            // A completed round clears the temporary "CASHED" button state before the next bet window.
            setBet1(prev => prev.cashedOut ? {...prev, cashedOut: false, profit: 0} : prev);
            setBet2(prev => prev.cashedOut ? {...prev, cashedOut: false, profit: 0} : prev);
        };

        socket.on('playerState', handlePlayerState);
        socket.on('betAccepted', handleBetAccepted);
        socket.on('betRejected', handleBetRejected);
        socket.on('cashedOut', handleCashedOut);
        socket.on('betLost', handleBetLost);
        socket.on('crash', handleCrash);

        return () => {
            socket.off('playerState', handlePlayerState);
            socket.off('betAccepted', handleBetAccepted);
            socket.off('betRejected', handleBetRejected);
            socket.off('cashedOut', handleCashedOut);
            socket.off('betLost', handleBetLost);
            socket.off('crash', handleCrash);
        };

    }, []);

    const placeBet = (betNumber: BetNumber, amountOverride?: number) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        const amount = Number(amountOverride ?? currentBet.amount);

        if (!amount || amount <= 0) return false;

        if (amount > balance) return false;

        cashoutInProgressRef.current[betNumber] = false;

        socket.emit('placeBet', {
            betNumber,
            amount,
        });

        return true;
    };

    const cashOut = (betNumber: BetNumber) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        if (!currentBet.placed || currentBet.cashedOut) return false;

        if (cashoutInProgressRef.current[betNumber]) return false;

        cashoutInProgressRef.current[betNumber] = true;

        socket.emit('cashOut', {betNumber});

        return true;
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
        stats,
        lastSettlement,
    };
};
