const crypto = require('crypto');

function generateCrashPoint(serverSeed, clientSeed, nonce) {
    const hash = crypto
        .createHash('sha256')
        .update(`${serverSeed}:${clientSeed}:${nonce}`)
        .digest('hex');

    const h = parseInt(hash.slice(0, 13), 16); // first 52 bits
    const e = Math.pow(2, 52);

    // Provably fair crash point
    let crash = 1 / (1 - (h / e));
    crash = parseFloat(crash.toFixed(2));

    // Cap max crash at 100.00x
    if (crash > 100) crash = 100.00;

    return crash;
}

module.exports = { generateCrashPoint };
