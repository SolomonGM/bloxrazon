const { sql, doTransaction } = require('../../../database');
const { newBets } = require('../../../socketio/bets');
const { sleep, roundDecimal, emitBalance } = require('../../../utils');
const { generateServerSeed, generateClientSeed, combine, getResult } = require('../../../fairness');
const { getEOSBlockNumber, waitForEOSBlock } = require('../../../fairness/eos');
const io = require('../../../socketio/server');

const colorsMultipliers = {
    0: 14,
    1: 2,
    2: 2
}

const colorNames = {
    0: 'gold',
    1: 'green',
    2: 'red'
}

// Map color name strings to numbers for comparison
const colorToNumber = {
    'gold': 0,
    'green': 1,
    'red': 2
}

function resultToColor(result) {
    // 0 = gold (14x multiplier)
    // 1-7 = green (2x multiplier)
    // 8-14 = red (2x multiplier)
    if (result === 0) return 0; // gold
    if (result >= 1 && result <= 7) return 1; // green
    if (result >= 8 && result <= 14) return 2; // red
    return 0; // default to gold
}

const roulette = {
    round: {},
    bets: [],
    last: [],
    config: {
        maxBet: 25000,
        betTime: 10000,
        rollTime: 5000
    }
};

const lastResults = 100;

async function createRouletteRound() {
    const roundId = generateClientSeed(16);
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    
    // Get current EOS block and commit to future block
    const currentBlock = await getEOSBlockNumber();
    const targetBlock = currentBlock + 2;
    
    const [result] = await sql.query(
        'INSERT INTO roulette (roundId, serverSeed, clientSeed, EOSBlock) VALUES (?, ?, ?, ?)',
        [roundId, serverSeed, clientSeed, targetBlock]
    );
    
    return result.insertId;
}

async function getRouletteRound() {

    const [[round]] = await sql.query('SELECT * FROM roulette WHERE endedAt IS NULL ORDER BY id ASC LIMIT 1');
    
    // If no round exists, create one
    if (!round) {
        const newRoundId = await createRouletteRound();
        const [[newRound]] = await sql.query('SELECT * FROM roulette WHERE id = ?', [newRoundId]);
        newRound.new = true;
        return newRound;
    }

    const now = new Date();

    if (!round.createdAt) {
        await sql.query('UPDATE roulette SET createdAt = ? WHERE id = ?', [now, round.id]);
        round.new = true;
    }

    round.createdAt = now;
    return round;

}

async function updateRoulette() {

    const round = await getRouletteRound();
    if (!round) return;

    roulette.round = round;
    
    if (!roulette.round.new) {

        const [bets] = await sql.query(`
            SELECT rouletteBets.userId, users.username, users.xp, users.anon, rouletteBets.color, rouletteBets.amount, rouletteBets.id FROM rouletteBets
            INNER JOIN users ON users.id = rouletteBets.userId WHERE roundId = ?
        `, [round.id]);

        roulette.bets = bets.map(bet => ({
            id: bet.id,
            user: {
                id: bet.userId,
                username: bet.username,
                xp: bet.xp,
                anon: bet.anon
            },
            color: typeof bet.color === 'string' ? colorToNumber[bet.color] : bet.color,
            amount: bet.amount
        }));

    } else {
        roulette.bets = [];
    }

    io.to('roulette').emit('roulette:new', {
        id: round.id,
        createdAt: round.createdAt
    });

    if (roulette.bets.length) {
        io.to('roulette').emit('roulette:bets', roulette.bets);
    }

}

async function cacheRoulette() {

    const [last] = await sql.query('SELECT result FROM roulette WHERE endedAt IS NOT NULL ORDER BY id DESC LIMIT ?', [lastResults]);
    roulette.last = last.map(bet => bet.result);

    await updateRoulette();
    rouletteInterval();

}

async function rouletteInterval() {

    // const startedAgo = new Date() - roulette.round.createdAt;

    // if (startedAgo < betTime) {
    //     await sleep(betTime - startedAgo);
    // }

    if (!roulette.round.rolledAt) {

        await sleep(roulette.config.betTime);

        // Get the EOS block hash and generate result
        const blockHash = await waitForEOSBlock(roulette.round.EOSBlock);
        const combined = combine(roulette.round.serverSeed, roulette.round.clientSeed, 0);
        const finalHash = combine(combined, blockHash, 0);
        const rawResult = getResult(finalHash);
        
        // Map result to 0-14 for roulette
        const result = rawResult % 15;
        const color = resultToColor(result);
        const colorName = colorNames[color];

        roulette.round.result = result;
        roulette.round.color = color;
        roulette.round.rolledAt = new Date();
        
        await sql.query(
            'UPDATE roulette SET result = ?, color = ?, rolledAt = ? WHERE id = ?',
            [result, colorName, roulette.round.rolledAt, roulette.round.id]
        );

        io.to('roulette').emit('roulette:roll', {
            id: roulette.round.id,
            result: roulette.round.result,
            color: roulette.round.color
        });

    }

    await sleep(roulette.config.rollTime);

    roulette.round.endedAt = new Date();

    try {

        const userBalanceUpdates = new Map(); // Track balance updates per user

        await doTransaction(async (connection, commit) => {
            
            await connection.query('UPDATE roulette SET endedAt = ? WHERE id = ?', [roulette.round.endedAt, roulette.round.id]);
            if (!roulette.bets.length) return await commit();

            const updateUserBalanceStmt = await connection.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
            const updateBetsStmt = await connection.prepare('UPDATE bets SET completed = 1, winnings = ? WHERE game = ? AND gameId = ?');
            const socketBets = [];

            for (const bet of roulette.bets) {
                const color = roulette.round.color;
                let won = 0;
    
                if (color === bet.color) {
                    won = roundDecimal(bet.amount * colorsMultipliers[color]);
                    await updateUserBalanceStmt.execute([won, bet.user.id]);
                    
                    // Track that this user needs a balance update (will emit once per user after commit)
                    userBalanceUpdates.set(bet.user.id, true);
                }
    
                await updateBetsStmt.execute([won, 'roulette', bet.id]);
                await connection.query('UPDATE rouletteBets SET payout = ? WHERE id = ?', [won, bet.id]);
                socketBets.push({ user: bet.user, amount: bet.amount, edge: roundDecimal(bet.amount * 0.05), payout: won, game: 'roulette' });
            }
                
            await commit();
            newBets(socketBets);
  
        });
        
        // Emit balance updates for users who won
        // Wait 5 seconds for animation, then query actual balance from DB and emit with 'set'
        if (userBalanceUpdates.size > 0) {
            setTimeout(async () => {
                for (const userId of userBalanceUpdates.keys()) {
                    try {
                        const [[user]] = await sql.query('SELECT balance FROM users WHERE id = ?', [userId]);
                        if (user) {
                            console.log(`[ROULETTE] Emitting final balance for user ${userId}: ${user.balance}`);
                            emitBalance(userId, 'set', roundDecimal(user.balance));
                        }
                    } catch (err) {
                        console.error(`[ROULETTE] Failed to query balance for user ${userId}:`, err);
                    }
                }
            }, 5000);
        }

    } catch (error) {
        console.error("Roulette err:", error);
    }

    roulette.last.unshift(roulette.round.result);
    if (roulette.last.length > lastResults) roulette.last.pop();

    await sleep(2500);

    await updateRoulette();
    rouletteInterval();

}

module.exports = {
    roulette,
    cacheRoulette
}