const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const { generateCrashPoint } = require('./utils/crash');
const players = new Map();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

function startGameRound(socket) {
    let isCrashed = false;
    let hasCashedOut = false;
    let tick = 0;
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const clientSeed = 'default';
    const nonce = 0;
    const crashPoint = generateCrashPoint(serverSeed, clientSeed, nonce);

    console.log('Crash point for', socket.id, ':', crashPoint);

    players.set(socket.id, { hasCashedOut: false });

    const interval = setInterval(() => {
        if (isCrashed || (hasCashedOut && !players.get(socket.id))) return;

        tick++;
        const currentMultiplier = Math.floor(100 * Math.pow(1.00559, tick)) / 100;

        if (currentMultiplier >= crashPoint) {
            socket.emit('update', { multiplier: currentMultiplier.toFixed(2) });
            isCrashed = true;
            socket.emit('crash', { crashPoint: crashPoint.toFixed(2) });
            players.delete(socket.id);
            clearInterval(interval);

            let countdown = 5;
            const countdownInterval = setInterval(() => {
                socket.emit('countdown', { countdown });
                countdown--;
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    startGameRound(socket);
                }
            }, 1000);
        } else {
            socket.emit('update', { multiplier: currentMultiplier.toFixed(2) });
        }
    }, 100);


    socket.once('cashOut', () => {
        if (!isCrashed && !hasCashedOut) {
            hasCashedOut = true;
            socket.emit('cashedOut', { multiplier: (1.0 + tick * 0.01).toFixed(2) });
            players.set(socket.id, { hasCashedOut: true });
        }
    });

}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    startGameRound(socket);

    socket.on('disconnect', () => {
        players.delete(socket.id);
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
