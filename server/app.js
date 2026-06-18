const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const { generateCrashPoint } = require('./utils/crash');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

const ROUND_TICK_MS = 100;
const COUNTDOWN_SECONDS = 7;
const MAX_HISTORY_ITEMS = 20;
const STARTING_BALANCE = 5000;

let roundNonce = 0;
let currentRound = null;
let crashHistory = [];
const players = new Map();

function hashServerSeed(serverSeed) {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

function getRoundCommitment(round) {
    return {
        roundId: round.roundId,
        serverSeedHash: round.serverSeedHash,
        clientSeed: round.clientSeed,
        nonce: round.nonce,
    };
}

function getRoundReveal(round) {
    return {
        ...getRoundCommitment(round),
        serverSeed: round.serverSeed,
        crashPoint: round.crashPoint.toFixed(2),
    };
}

function getPublicCrashHistory() {
    return crashHistory.map((round) => ({
        ...getRoundReveal(round),
        crashPoint: Number(round.crashPoint.toFixed(2)),
    }));
}

function broadcastCrashHistory() {
    // History is now owned by the backend so every viewer sees the same completed rounds.
    io.emit('history', { history: getPublicCrashHistory() });
}

function createPlayer() {
    return {
        balance: STARTING_BALANCE,
        bets: new Map(),
        stats: {
            totalBets: 0,
            totalWins: 0,
            totalLosses: 0,
            totalProfit: 0,
        },
    };
}

function getPublicStats(stats) {
    return {
        totalBets: stats.totalBets,
        totalWins: stats.totalWins,
        totalLosses: stats.totalLosses,
        totalProfit: Number(stats.totalProfit.toFixed(2)),
    };
}

function getPublicPlayerState(player) {
    return {
        balance: Number(player.balance.toFixed(2)),
        stats: getPublicStats(player.stats),
        bets: Array.from(player.bets.values()).map((bet) => ({
            betNumber: bet.betNumber,
            amount: bet.amount,
            state: bet.state,
            roundId: bet.roundId,
        })),
    };
}

function sendPlayerState(socket) {
    const player = players.get(socket.id);

    if (!player) return;

    socket.emit('playerState', getPublicPlayerState(player));
}

function emitBetRejected(socket, betNumber, reason) {
    socket.emit('betRejected', {
        betNumber,
        reason,
    });
}

// One round object now lives at server scope, so every socket watches the same flight.
function createRound() {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = hashServerSeed(serverSeed);
    const clientSeed = 'default';
    const nonce = roundNonce++;
    const crashPoint = generateCrashPoint(serverSeed, clientSeed, nonce);

    return {
        roundId: nonce + 1,
        status: 'playing',
        tick: 0,
        latestMultiplier: 1,
        serverSeed,
        serverSeedHash,
        clientSeed,
        nonce,
        crashPoint,
        interval: null,
        countdownInterval: null,
        countdown: null,
    };
}

function activatePendingBetsForCurrentRound() {
    if (!currentRound) return;

    players.forEach((player) => {
        player.bets.forEach((bet) => {
            if (bet.state !== 'pending') return;

            // Bets accepted during countdown become active only when the shared round starts.
            bet.state = 'active';
            bet.roundId = currentRound.roundId;
        });
    });
}

function settleLosingBetsForCurrentRound() {
    if (!currentRound) return;

    players.forEach((player, socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        const losses = [];

        player.bets.forEach((bet, betNumber) => {
            if (bet.roundId !== currentRound.roundId) return;

            if (bet.state === 'active') {
                player.stats.totalLosses++;
                player.stats.totalProfit = Number((player.stats.totalProfit - bet.amount).toFixed(2));
                losses.push({
                    betNumber,
                    amount: bet.amount,
                    outcome: 'loss',
                });
            }

            player.bets.delete(betNumber);
        });

        if (!socket || losses.length === 0) return;

        socket.emit('betLost', {
            losses,
            balance: Number(player.balance.toFixed(2)),
            stats: getPublicStats(player.stats),
        });
    });
}

function startGameRound() {
    currentRound = createRound();

    console.log('Crash point = :', currentRound.crashPoint);

    activatePendingBetsForCurrentRound();

    // Commit to the secret seed before the round result is revealed.
    io.emit('roundStarted', getRoundCommitment(currentRound));

    currentRound.interval = setInterval(() => {
        currentRound.tick++;
        const currentMultiplier = Math.floor(100 * Math.pow(1.00559, currentRound.tick)) / 100;
        currentRound.latestMultiplier = currentMultiplier;

        // Broadcast from the backend, because all players must see the same multiplier.
        io.emit('update', { multiplier: currentMultiplier.toFixed(2) });

        if (currentMultiplier >= currentRound.crashPoint) {
            crashCurrentRound();
        }
    }, ROUND_TICK_MS);
}

function crashCurrentRound() {
    if (!currentRound || currentRound.status === 'crashed') return;

    currentRound.status = 'crashed';
    clearInterval(currentRound.interval);

    crashHistory = [currentRound, ...crashHistory].slice(0, MAX_HISTORY_ITEMS);

    // After the crash, reveal the server seed so the hash and crash result can be verified.
    io.emit('crash', getRoundReveal(currentRound));
    settleLosingBetsForCurrentRound();
    broadcastCrashHistory();
    startCountdown();
}

function startCountdown() {
    currentRound.countdown = COUNTDOWN_SECONDS;

    currentRound.countdownInterval = setInterval(() => {
        io.emit('countdown', { countdown: currentRound.countdown });
        currentRound.countdown--;

        if (currentRound.countdown < 0) {
            clearInterval(currentRound.countdownInterval);
            startGameRound();
        }
    }, 1000);
}

function sendCurrentRoundToSocket(socket) {
    if (!currentRound) return;

    socket.emit('history', { history: getPublicCrashHistory() });

    // A late joiner receives the current shared state instead of starting a private round.
    if (currentRound.status === 'playing') {
        socket.emit('roundStarted', getRoundCommitment(currentRound));
        socket.emit('update', { multiplier: currentRound.latestMultiplier.toFixed(2) });
        return;
    }

    socket.emit('crash', getRoundReveal(currentRound));

    if (currentRound.countdown !== null) {
        socket.emit('countdown', { countdown: currentRound.countdown });
    }
}

function readBetNumber(value) {
    const betNumber = Number(value || 1);

    return betNumber === 1 || betNumber === 2 ? betNumber : null;
}

function handlePlaceBet(socket, data = {}) {
    const player = players.get(socket.id);
    const betNumber = readBetNumber(data.betNumber);
    const amount = Number(data.amount);

    if (!player || !betNumber) return;

    if (!Number.isFinite(amount) || amount <= 0) {
        emitBetRejected(socket, betNumber, 'Invalid bet amount.');
        return;
    }

    if (currentRound && currentRound.status === 'playing') {
        emitBetRejected(socket, betNumber, 'Betting is closed for the active round.');
        return;
    }

    if (player.bets.has(betNumber)) {
        emitBetRejected(socket, betNumber, 'This bet panel already has a pending bet.');
        return;
    }

    if (amount > player.balance) {
        emitBetRejected(socket, betNumber, 'Insufficient balance.');
        return;
    }

    player.balance = Number((player.balance - amount).toFixed(2));
    player.stats.totalBets++;

    // The server owns the stake ledger; the frontend only displays accepted state.
    player.bets.set(betNumber, {
        betNumber,
        amount,
        state: 'pending',
        roundId: null,
    });

    socket.emit('betAccepted', {
        betNumber,
        amount,
        balance: Number(player.balance.toFixed(2)),
        stats: getPublicStats(player.stats),
    });
}

function handleCashOut(socket, data = {}) {
    const player = players.get(socket.id);
    const betNumber = readBetNumber(data.betNumber);

    if (!player || !betNumber) return;

    if (!currentRound || currentRound.status !== 'playing') {
        emitBetRejected(socket, betNumber, 'There is no active round to cash out from.');
        return;
    }

    const bet = player.bets.get(betNumber);

    if (!bet || bet.state !== 'active' || bet.roundId !== currentRound.roundId) {
        emitBetRejected(socket, betNumber, 'No active bet found for this round.');
        return;
    }

    const settledMultiplier = currentRound.latestMultiplier;
    const payout = Number((bet.amount * settledMultiplier).toFixed(2));
    const profit = Number((payout - bet.amount).toFixed(2));

    bet.state = 'cashedOut';
    bet.multiplier = settledMultiplier;
    bet.payout = payout;

    player.balance = Number((player.balance + payout).toFixed(2));
    player.stats.totalWins++;
    player.stats.totalProfit = Number((player.stats.totalProfit + profit).toFixed(2));

    socket.emit('cashedOut', {
        betNumber,
        amount: bet.amount,
        multiplier: settledMultiplier.toFixed(2),
        payout,
        profit,
        balance: Number(player.balance.toFixed(2)),
        stats: getPublicStats(player.stats),
    });
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    players.set(socket.id, createPlayer());
    sendPlayerState(socket);
    sendCurrentRoundToSocket(socket);

    socket.on('placeBet', (data = {}) => {
        handlePlaceBet(socket, data);
    });

    socket.on('cashOut', (data = {}) => {
        handleCashOut(socket, data);
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startGameRound();
});
