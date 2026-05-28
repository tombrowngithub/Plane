import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { GameState } from "@/types/game";

export const useCrashGame = () => {

    const [gameState, setGameState] = useState<GameState>({
        multiplier: 1,
        status: 'waiting',
        countdown: null,
        crashPoint: null,
        cashoutMultiplier: null,
    });

    const [crashHistory, setCrashHistory] = useState<number[]>([]);

    useEffect(() => {

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

            setCrashHistory(prev => [crashPoint, ...prev]);
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
            socket.off('update');
            socket.off('crash');
            socket.off('countdown');
        };

    }, []);

    return {
        gameState,
        setGameState,
        crashHistory,
    };
};
