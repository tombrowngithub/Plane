import React, {useEffect, useState} from "react";
import {AutoBet, BetState} from "@/types/autobet";
import {getNextBetAmount, shouldStopAutobet} from "@/utils/autobet";

type BetNumber = 1 | 2;

const createInitialAutobet = (): AutoBet => ({
    enabled: false,

    baseBet: 0,
    currentBet: 0,

    maxStake: 0,
    autoCashout: 0,

    onWinAction: 'back_to_base',
    onLoseAction: 'back_to_base',

    waitingNextRound: false,
});

type Props = {
    gameState: any;

    balance: number;

    bet1: BetState;
    bet2: BetState;

    setBet1: React.Dispatch<React.SetStateAction<BetState>>;
    setBet2: React.Dispatch<React.SetStateAction<BetState>>;

    setBalance: React.Dispatch<React.SetStateAction<number>>;

    cashoutInProgressRef: React.MutableRefObject<Record<1 | 2, boolean>>;

    onCashOut: (betNumber: BetNumber, multiplier?: number) => void;

    registerLoss: () => void;
    registerBet: () => void;
};

export const useAutobet = ({
                               gameState,

                               balance,

                               bet1,
                               bet2,

                               setBet1,
                               setBet2,

                               setBalance,

                               cashoutInProgressRef,

                               onCashOut,
                               registerLoss,
                               registerBet
                           }: Props) => {

    const [autobet1, setAutobet1] = useState<AutoBet>(createInitialAutobet);

    const [autobet2, setAutobet2] = useState<AutoBet>(createInitialAutobet);

    /*
    ========================================
    AUTO CASHOUT DETECTION
    ========================================
    */

    useEffect(() => {

        if (autobet1.enabled && bet1.placed && !bet1.cashedOut && autobet1.autoCashout > 0 && gameState.multiplier >= autobet1.autoCashout) {
            onCashOut(
                1,
                autobet1.autoCashout
            );
        }

        if (autobet2.enabled && bet2.placed && !bet2.cashedOut && autobet2.autoCashout > 0 && gameState.multiplier >= autobet2.autoCashout) {
            onCashOut(
                2,
                autobet2.autoCashout
            );
        }

    }, [gameState.multiplier]);

    /*
    ========================================
    AUTO PLACE NEXT ROUND
    ========================================
    */

    useEffect(() => {

        if (gameState.status !== 'waiting') return;

        let availableBalance = balance;

        /*
        -------------------------
        BET 1
        -------------------------
        */

        if (autobet1.enabled && !bet1.placed) {

            const amount = autobet1.currentBet;

            if (availableBalance >= amount) {

                availableBalance -= amount;

                cashoutInProgressRef.current[1] = false;

                registerBet();

                setBalance(prev => prev - amount);

                setBet1(prev => ({
                    ...prev,
                    amount: String(amount),
                    placed: true,
                    cashedOut: false,
                    profit: 0,
                }));

            } else {

                setAutobet1(prev => ({
                    ...prev,
                    enabled: false,
                }));
            }
        }

        /*
        -------------------------
        BET 2
        -------------------------
        */

        if (autobet2.enabled && !bet2.placed) {

            const amount =
                autobet2.currentBet;

            if (availableBalance >= amount) {

                cashoutInProgressRef.current[2] = false;

                registerBet();

                setBalance(prev => prev - amount);

                setBet2(prev => ({
                    ...prev,
                    amount: String(amount),
                    placed: true,
                    cashedOut: false,
                    profit: 0,
                }));

            } else {

                setAutobet2(prev => ({
                    ...prev,
                    enabled: false,
                }));
            }
        }

    }, [gameState.countdown]);

    /*
    ========================================
    HANDLE CRASHED ROUND
    ========================================
    */

    useEffect(() => {

        if (gameState.status !== 'crashed') return;

        /*
        -------------------------
        BET 1 LOSS
        -------------------------
        */

        if (bet1.placed && !bet1.cashedOut) {

            registerLoss();

            if (autobet1.enabled) {

                const nextBet =
                    getNextBetAmount(autobet1, false);

                const stop =
                    shouldStopAutobet(
                        nextBet,
                        balance,
                        autobet1.maxStake
                    );

                if (stop) {

                    setAutobet1(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setAutobet1(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }
        }

        /*
        -------------------------
        BET 2 LOSS
        -------------------------
        */

        if (bet2.placed && !bet2.cashedOut) {

            registerLoss();

            if (autobet2.enabled) {

                const nextBet =
                    getNextBetAmount(autobet2, false);

                const stop =
                    shouldStopAutobet(
                        nextBet,
                        balance,
                        autobet2.maxStake
                    );

                if (stop) {

                    setAutobet2(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setAutobet2(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }
        }

        /*
        -------------------------
        RESET BET STATES
        -------------------------
        */

        setBet1(prev => ({
            ...prev,
            placed: false,
            cashedOut: false,
        }));

        setBet2(prev => ({
            ...prev,
            placed: false,
            cashedOut: false,
        }));

    }, [gameState.status]);

    /*
    ========================================
    PUBLIC FUNCTIONS
    ========================================
    */

    const handlePlaceAutobet = (betData: any, selectedBetNumber: BetNumber) => {

        const baseBet =
            Number(betData.baseBet);

        const maxStake =
            Number(betData.maxStake);

        const autoCashout =
            Number(betData.autoCashout);

        const setSelectedAutobet =
            selectedBetNumber === 1
                ? setAutobet1
                : setAutobet2;

        const setSelectedBet =
            selectedBetNumber === 1
                ? setBet1
                : setBet2;

        if (
            baseBet <= 0 ||
            maxStake <= 0 ||
            autoCashout < 1.01
        ) {
            return;
        }

        if (
            gameState.status === 'waiting' &&
            balance < baseBet
        ) {
            return;
        }

        setSelectedAutobet({
            enabled: true,

            baseBet,
            currentBet: baseBet,

            maxStake,
            autoCashout,

            onWinAction:
            betData.onWinAction,

            onLoseAction:
            betData.onLoseAction,

            waitingNextRound:
                gameState.status === 'playing',
        });

        /*
        -------------------------
        INSTANT BET
        -------------------------
        */

        if (gameState.status === 'waiting') {

            cashoutInProgressRef.current[
                selectedBetNumber
                ] = false;

            setBalance(prev =>
                prev - baseBet
            );

            setSelectedBet(prev => ({
                ...prev,
                amount: String(baseBet),
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        }
    };

    const disableAutobet = (betNumber: BetNumber) => {

        const setSelectedAutobet =
            betNumber === 1
                ? setAutobet1
                : setAutobet2;

        setSelectedAutobet(prev => ({
            ...prev,
            enabled: false,
        }));
    };

    return {
        autobet1,
        setAutobet1,

        autobet2,
        setAutobet2,

        handlePlaceAutobet,

        disableAutobet,
    };
};
