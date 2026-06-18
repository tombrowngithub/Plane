export type GameStatus = | 'waiting' | 'playing' | 'crashed' | 'cashed';

export type GameState = {
    multiplier: number;
    status: GameStatus;
    countdown: number | null;
    crashPoint: number | null;
    cashoutMultiplier: number | null;
};

export type FairnessInfo = {
    roundId: number | null;
    serverSeedHash: string | null;
    serverSeed: string | null;
    clientSeed: string | null;
    nonce: number | null;
};

export type CrashHistoryRound = {
    roundId: number;
    crashPoint: number;
    serverSeedHash: string;
    serverSeed: string;
    clientSeed: string;
    nonce: number;
};
