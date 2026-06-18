const crypto = require('crypto');

const HOUSE_EDGE = 0.03;
const RTP = 1 - HOUSE_EDGE;

function generateCrashPoint(serverSeed, clientSeed, nonce) {
    const hash = crypto
        .createHash('sha256')
        .update(`${serverSeed}:${clientSeed}:${nonce}`)
        .digest('hex');

    const h = parseInt(hash.slice(0, 13), 16); // first 52 bits
    const e = Math.pow(2, 52);

    // The 0.97 factor models a 3% house edge: a fixed cashout strategy returns about 97% over time.
    let crash = RTP / (1 - (h / e));
    if (crash < 1) crash = 1;

    crash = parseFloat(crash.toFixed(2));

    // Cap max crash at 100.00x
    if (crash > 100) crash = 100.00;

    return crash;
}

module.exports = { generateCrashPoint };
