export type GameStatus = | 'waiting' | 'playing' | 'crashed' | 'cashed';

export type GameState = {
    multiplier: number;
    status: GameStatus;
    countdown: number | null;
    crashPoint: number | null;
    cashoutMultiplier: number | null;
};
