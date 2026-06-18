import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { CrashHistoryRound, FairnessInfo, GameState } from "@/types/game";

const initialFairnessInfo: FairnessInfo = {
    roundId: null,
    serverSeedHash: null,
    serverSeed: null,
    clientSeed: null,
    nonce: null,
};

const readNumberOrNull = (value: unknown) => {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
};

export const useCrashGame = () => {

    const [gameState, setGameState] = useState<GameState>({
        multiplier: 1,
        status: 'waiting',
        countdown: null,
        crashPoint: null,
        cashoutMultiplier: null,
    });

    const [crashHistory, setCrashHistory] = useState<number[]>([]);
    const [fairnessInfo, setFairnessInfo] = useState<FairnessInfo>(initialFairnessInfo);

    useEffect(() => {

        socket.on('roundStarted', (data) => {

            // The backend sends only the seed hash before the round, then reveals the seed after crash.
            setFairnessInfo({
                roundId: readNumberOrNull(data.roundId),
                serverSeedHash: data.serverSeedHash ?? null,
                serverSeed: null,
                clientSeed: data.clientSeed ?? null,
                nonce: readNumberOrNull(data.nonce),
            });
        });

        socket.on('update', (data) => {

            const multiplier = parseFloat(data.multiplier);

            setGameState(prev => ({
                ...prev,
                multiplier,
                status: 'playing',
            }));
        });

        socket.on('crash', (data) => {

            const crashPoint = parseFloat(data.crashPoint);

            setGameState(prev => ({
                ...prev,
                multiplier: crashPoint,
                status: 'crashed',
                crashPoint,
            }));

            setFairnessInfo({
                roundId: readNumberOrNull(data.roundId),
                serverSeedHash: data.serverSeedHash ?? null,
                serverSeed: data.serverSeed ?? null,
                clientSeed: data.clientSeed ?? null,
                nonce: readNumberOrNull(data.nonce),
            });
        });

        socket.on('history', (data) => {

            const history = Array.isArray(data.history)
                ? data.history as CrashHistoryRound[]
                : [];

            // Crash history now comes from the backend, so all connected viewers share the same list.
            setCrashHistory(
                history
                    .map(item => Number(item.crashPoint))
                    .filter(Number.isFinite)
            );
        });

        socket.on('countdown', (data) => {

            setGameState({
                multiplier: 1,
                status: 'waiting',
                countdown: data.countdown,
                crashPoint: null,
                cashoutMultiplier: null,
            });

        });

        return () => {
            socket.off('roundStarted');
            socket.off('update');
            socket.off('crash');
            socket.off('history');
            socket.off('countdown');
        };

    }, []);

    return {
        gameState,
        setGameState,
        crashHistory,
        fairnessInfo,
    };
};
