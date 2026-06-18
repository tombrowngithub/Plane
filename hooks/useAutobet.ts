import React, {useEffect, useState} from "react";
import {AutoBet, BetSettlement, BetState} from "@/types/autobet";
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

    onCashOut: (betNumber: BetNumber, multiplier?: number) => void;
    onPlaceBet: (betNumber: BetNumber, amountOverride?: number) => boolean;

    lastSettlement: BetSettlement | null;
};

export const useAutobet = ({
                               gameState,

                               balance,

                               bet1,
                               bet2,

                               setBet1,
                               setBet2,

                               onCashOut,
                               onPlaceBet,
                               lastSettlement
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
                1
            );
        }

        if (autobet2.enabled && bet2.placed && !bet2.cashedOut && autobet2.autoCashout > 0 && gameState.multiplier >= autobet2.autoCashout) {
            onCashOut(
                2
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

                // Autoplay goes through the same backend bet acceptance path as manual bets.
                onPlaceBet(1, amount);

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

                availableBalance -= amount;

                // Autoplay goes through the same backend bet acceptance path as manual bets.
                onPlaceBet(2, amount);

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
    HANDLE SERVER BET SETTLEMENT
    ========================================
    */

    useEffect(() => {

        if (!lastSettlement) return;

        const updateAutobetAfterSettlement = (
            setSelectedAutobet: React.Dispatch<React.SetStateAction<AutoBet>>,
            isWin: boolean
        ) => {
            setSelectedAutobet(prev => {
                if (!prev.enabled) return prev;

                const nextBet = getNextBetAmount(prev, isWin);

                const stop = shouldStopAutobet(
                    nextBet,
                    lastSettlement.balance,
                    prev.maxStake
                );

                if (stop) {
                    return {
                        ...prev,
                        enabled: false,
                    };
                }

                return {
                    ...prev,
                    currentBet: nextBet,
                };
            });
        };

        lastSettlement.results.forEach(result => {
            const isWin = result.outcome === 'win';

            if (result.betNumber === 1) {
                updateAutobetAfterSettlement(setAutobet1, isWin);
            }

            if (result.betNumber === 2) {
                updateAutobetAfterSettlement(setAutobet2, isWin);
            }
        });

    }, [lastSettlement]);

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

            // Prefill the visible amount, but wait for the backend before marking the bet as placed.
            setSelectedBet(prev => ({
                ...prev,
                amount: String(baseBet),
            }));

            onPlaceBet(selectedBetNumber, baseBet);
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
