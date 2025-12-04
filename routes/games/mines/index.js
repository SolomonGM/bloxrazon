const express = require('express');
const router = express.Router();

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 100,
	max: 1,
	message: { error: 'SLOW_DOWN' },
	standardHeaders: false,
	legacyHeaders: false,
    keyGenerator: (req, res) => req.userId
});

const { newBets } = require('../../../socketio/bets');
const { isAuthed } = require('../../auth/functions');
const { enabledFeatures, xpMultiplier } = require('../../admin/config');
const { generateMinePositions, calculateMultiplier, totalTiles, houseEdge } = require('./functions');
const io = require('../../../socketio/server');

const { sql, doTransaction } = require('../../../database');
const { roundDecimal, emitBalance, xpChanged } = require('../../../utils');

router.use(isAuthed);

router.get('/', async (req, res) => {

    const userId = parseInt(req.userId); // Ensure userId is a number
    const [[activeGame]] = await sql.query('SELECT minesCount, revealedTiles, amount FROM mines WHERE endedAt IS NULL AND userId = ?', [userId]);
    if (!activeGame) return res.json({ activeGame: false });

    // MySQL returns JSON columns as objects/arrays already
    activeGame.revealedTiles = Array.isArray(activeGame.revealedTiles) ? activeGame.revealedTiles : [];
    activeGame.multiplier = calculateMultiplier(activeGame.minesCount, activeGame.revealedTiles.length);
    activeGame.currentPayout = roundDecimal(activeGame.amount * activeGame.multiplier);

    res.json({ activeGame });

});

router.post('/start', apiLimiter, async (req, res) => {

    if (!enabledFeatures.mines) return res.status(400).json({ error: 'DISABLED' });

    let { amount, minesCount } = req.body;
    if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > totalTiles - 1) return res.status(400).json({ error: 'INVALID_MINES_COUNT' });

    amount = roundDecimal(amount);
    if (amount < 1) return res.status(400).json({ error: 'MINES_MIN_BET' });
    if (amount > 20000) return res.status(400).json({ error: 'MINES_MAX_BET' });

    const userId = parseInt(req.userId); // Ensure userId is a number
    console.log('[MINES] Start game request from userId:', userId, 'type:', typeof userId);

    try {

        await doTransaction(async (connection, commit) => {
            const [[activeGame]] = await connection.query('SELECT id FROM mines WHERE userId = ? AND endedAt IS NULL FOR UPDATE', [userId]);
            if (activeGame) return res.status(400).json({ error: 'MINES_GAME_ACTIVE' });

            const [[user]] = await connection.query(`
                SELECT u.id, u.balance, u.xp, ss.seed as serverSeed, ss.id as ssId, ss.nonce, cs.seed as clientSeed, cs.id as csId FROM users u
                LEFT JOIN serverSeeds ss ON u.id = ss.userId AND ss.endedAt IS NULL
                LEFT JOIN clientSeeds cs ON u.id = cs.userId AND cs.endedAt IS NULL
                WHERE u.id = ? FOR UPDATE
            `,[userId]);

            if (!user) return res.status(404).json({ error: 'UNKNOWN_ERROR' });
            if (amount > user.balance) return res.status(400).json({ error: 'INSUFFICIENT_BALANCE' });

            // Initialize seeds if they don't exist
            let serverSeedId = user.ssId;
            let clientSeedId = user.csId;
            let nonce = user.nonce || 0;
            let serverSeed = user.serverSeed;
            let clientSeed = user.clientSeed;

            if (!serverSeedId) {
                const crypto = require('crypto');
                serverSeed = crypto.randomBytes(32).toString('hex');
                const [ssResult] = await connection.query('INSERT INTO serverSeeds (userId, seed, nonce) VALUES (?, ?, ?)', [userId, serverSeed, 0]);
                serverSeedId = ssResult.insertId;
                console.log('[MINES] Created server seed for user:', userId);
            }

            if (!clientSeedId) {
                const crypto = require('crypto');
                clientSeed = crypto.randomBytes(16).toString('hex');
                const [csResult] = await connection.query('INSERT INTO clientSeeds (userId, seed) VALUES (?, ?)', [userId, clientSeed]);
                clientSeedId = csResult.insertId;
                console.log('[MINES] Created client seed for user:', userId);
            }

            nonce = nonce + 1;
            const minePositions = generateMinePositions(serverSeed, clientSeed, nonce, minesCount);
            
            console.log(`[MINES] Started game with ${minesCount} mines. Positions:`, minePositions);

            const [nonceIncrease] = await connection.query('UPDATE serverSeeds SET nonce = nonce + 1 WHERE id = ?', [serverSeedId]);
            if (nonceIncrease.affectedRows != 1) return res.status(404).json({ error: 'UNKNOWN_ERROR' });

            const xp = roundDecimal(amount * xpMultiplier);
            // Deduct balance at game start
            const newBalance = roundDecimal(user.balance - amount);
            await connection.query('UPDATE users SET xp = xp + ?, balance = ? WHERE id = ?', [xp, newBalance, userId]);
            const [result] = await connection.query(
                'INSERT INTO mines (userId, amount, clientSeedId, serverSeedId, nonce, minesCount, mines, revealedTiles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, amount, clientSeedId, serverSeedId, nonce, minesCount, JSON.stringify(minePositions), '[]']
            );

            const edge = roundDecimal(amount * houseEdge);
            await connection.query('INSERT INTO bets (userId, amount, winnings, edge, game, gameId, completed) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, amount, 0, edge, 'mines', result.insertId, 0]);

            await xpChanged(user.id, user.xp, roundDecimal(user.xp + xp), connection);
            await commit();

            // Emit balance update on game start
            console.log('[MINES] Emitting balance after game start:', { userId, newBalance, type: typeof userId });
            emitBalance(userId, 'set', newBalance);
            
            res.json({ success: true });
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

router.post('/reveal', apiLimiter, async (req, res) => {

    if (!enabledFeatures.mines) return res.status(400).json({ error: 'DISABLED' });

    const { field } = req.body;
    if (!Number.isInteger(field) || field < 0 || field > totalTiles - 1) return res.status(400).json({ error: 'INVALID_FIELD' });

    const userId = parseInt(req.userId); // Ensure userId is a number

    try {

        await doTransaction(async (connection, commit) => {

            const [[activeGame]] = await connection.query('SELECT id, mines, revealedTiles, amount, minesCount FROM mines WHERE endedAt IS NULL AND userId = ? FOR UPDATE', [userId]);
            if (!activeGame) return res.status(400).json({ error: 'NO_MINES_GAME_ACTIVE' });
    
            // MySQL returns JSON columns as objects/arrays already
            let revealedTiles = Array.isArray(activeGame.revealedTiles) ? activeGame.revealedTiles : [];
            if (revealedTiles.includes(field)) return res.status(400).json({ error: 'ALREADY_REVEALED' });
    
            let minePositions = Array.isArray(activeGame.mines) ? activeGame.mines : [];
            const isMine = minePositions.includes(field);
    
            revealedTiles.push(field);
    
            if (isMine) {
    
                await connection.query('UPDATE mines SET endedAt = NOW(), payout = 0, revealedTiles = ? WHERE id = ?', [JSON.stringify(revealedTiles), activeGame.id]);
                await connection.query('UPDATE bets SET winnings = 0, completed = 1 WHERE game = ? AND gameId = ?', ['mines', activeGame.id]);
            
                // Balance was already deducted at game start, no need to deduct again
                const [[user]] = await connection.query('SELECT id, username, balance, role, xp, anon FROM users WHERE id = ? FOR UPDATE', [userId]);
                
                await commit();
    
                // Emit balance update on loss (balance stays same since already deducted)
                console.log('[MINES] Mine hit, balance unchanged:', { userId, balance: user.balance, type: typeof userId });
                emitBalance(userId, 'set', user.balance);
    
                newBets([{
                    user: user,
                    amount: activeGame.amount,
                    edge: roundDecimal(activeGame.amount * houseEdge),
                    payout: 0,
                    game: 'mines'
                }]);
    
                return res.json({ success: true, isMine, minePositions, revealedTiles });
    
            }
    
            const multiplier = calculateMultiplier(activeGame.minesCount, revealedTiles.length);
            const currentPayout = roundDecimal(activeGame.amount * multiplier);
            
            console.log(`[MINES] Tile ${field} revealed. Total revealed: ${revealedTiles.length}, Mines: ${activeGame.minesCount}, Multiplier: ${multiplier}x, Payout: ${currentPayout}`);
    
            // Check if all safe tiles revealed (auto cashout)
            if (revealedTiles.length == totalTiles - activeGame.minesCount) {
                console.log('[MINES] All safe tiles revealed! Auto-cashing out...');
                
                // Update game and bet
                await connection.query('UPDATE mines SET endedAt = NOW(), payout = ?, revealedTiles = ? WHERE id = ?', [currentPayout, JSON.stringify(revealedTiles), activeGame.id]);
                await connection.query('UPDATE bets SET winnings = ?, completed = 1 WHERE game = ? AND gameId = ?', [currentPayout, 'mines', activeGame.id]);

                // Update user balance (add payout only, bet already deducted)
                const [[user]] = await connection.query('SELECT id, username, balance, role, xp, anon FROM users WHERE id = ? FOR UPDATE', [userId]);
                const balance = roundDecimal(user.balance + currentPayout);
                await connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, userId]);
                
                await commit();

                // Emit balance update
                console.log('[MINES] Emitting balance after auto-cashout:', { userId, balance, type: typeof userId });
                emitBalance(userId, 'set', balance);

                // Broadcast bet
                newBets([{
                    user: user,
                    amount: activeGame.amount,
                    edge: roundDecimal(activeGame.amount * houseEdge),
                    payout: currentPayout,
                    game: 'mines'
                }]);

                // Get mine positions for response
                let minePositions = Array.isArray(activeGame.mines) ? activeGame.mines : [];
                
                console.log('[MINES] Auto-cashout complete, sending response');
                return res.json({ success: true, isMine: false, payout: currentPayout, multiplier, minePositions, revealedTiles });
            }
            
            // Continue game - just update revealed tiles
            await connection.query('UPDATE mines SET revealedTiles = ? WHERE id = ?', [JSON.stringify(revealedTiles), activeGame.id]);
            
            await commit();
            
            // Don't emit balance update on safe tile reveals - balance already deducted at start
            console.log('[MINES] Safe tile revealed, continuing game');
            res.json({ success: true, isMine: false, revealedTiles, multiplier, currentPayout });

        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

router.post('/cashout', apiLimiter, async (req, res) => {

    if (!enabledFeatures.mines) return res.status(400).json({ error: 'DISABLED' });

    const userId = parseInt(req.userId); // Ensure userId is a number
    console.log('[MINES] Cashout endpoint hit by user:', userId, 'type:', typeof userId);

    try {

        const result = await doTransaction(async (connection, commit) => {
            console.log('[MINES] Starting cashout transaction for user:', userId);
            
            const [[activeGame]] = await connection.query('SELECT id, mines, revealedTiles, minesCount, amount FROM mines WHERE endedAt IS NULL AND userId = ? FOR UPDATE', [userId]);
            
            console.log('[MINES] Active game found:', activeGame ? `ID ${activeGame.id}` : 'NONE');
            
            if (!activeGame) {
                return { error: 'NO_MINES_GAME_ACTIVE' };
            }

            // MySQL returns JSON columns as objects/arrays already
            let revealedTiles = Array.isArray(activeGame.revealedTiles) ? activeGame.revealedTiles : [];
            
            console.log('[MINES] Revealed tiles count:', revealedTiles.length);
            
            if (revealedTiles.length < 1) {
                return { error: 'NEED_AT_LEAST_ONE_TILE' };
            }

            const multiplier = calculateMultiplier(activeGame.minesCount, revealedTiles.length);
            const payout = roundDecimal(activeGame.amount * multiplier);
            
            console.log('[MINES] Calculated payout:', payout, 'multiplier:', multiplier);

            // Update game
            await connection.query('UPDATE mines SET endedAt = NOW(), payout = ? WHERE id = ?', [payout, activeGame.id]);
            await connection.query('UPDATE bets SET winnings = ?, completed = 1 WHERE game = ? AND gameId = ?', [payout, 'mines', activeGame.id]);

            // Update user balance (add payout only, bet already deducted)
            const [[user]] = await connection.query('SELECT id, username, balance, role, xp, anon FROM users WHERE id = ? FOR UPDATE', [userId]);
            
            console.log('[MINES] User balance before cashout:', user.balance, 'Payout to add:', payout);

            const balance = roundDecimal(user.balance + payout);
            await connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, userId]);
            
            await commit();

            console.log('[MINES] Transaction committed. Balance after:', balance);

            return {
                success: true,
                user: user,
                activeGame: activeGame,
                payout: payout,
                multiplier: multiplier,
                balance: balance
            };
        });

        // Handle errors from transaction
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        // Emit socket update
        console.log('[MINES] Emitting balance to socket:', { userId, balance: result.balance, type: typeof userId });
        emitBalance(userId, 'set', result.balance);

        // Broadcast bet
        newBets([{
            user: result.user,
            amount: result.activeGame.amount,
            edge: roundDecimal(result.activeGame.amount * houseEdge),
            payout: result.payout,
            game: 'mines'
        }]);

        // Get mine positions for response
        let minePositions = Array.isArray(result.activeGame.mines) ? result.activeGame.mines : [];
        
        console.log('[MINES] Sending cashout success response:', { payout: result.payout, multiplier: result.multiplier, balance: result.balance });
        
        res.json({ success: true, payout: result.payout, multiplier: result.multiplier, minePositions });

    } catch (e) {
        console.error('[MINES] Cashout error:', e);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

module.exports = router;