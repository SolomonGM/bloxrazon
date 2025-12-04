require('dotenv').config();
const { sql } = require('./database');

async function testCashout() {
    const testUserId = 2;
    
    console.log('=== Testing Cashout Flow ===\n');
    
    try {
        // Get user balance before
        const [[userBefore]] = await sql.query('SELECT balance FROM users WHERE id = ?', [testUserId]);
        console.log('1. User balance before:', userBefore.balance);
        
        // Clear any active games
        await sql.query('UPDATE mines SET endedAt = NOW() WHERE userId = ? AND endedAt IS NULL', [testUserId]);
        
        // Get user seeds
        const [[user]] = await sql.query(`
            SELECT u.id, ss.id as ssId, cs.id as csId FROM users u
            INNER JOIN serverSeeds ss ON u.id = ss.userId AND ss.endedAt IS NULL
            INNER JOIN clientSeeds cs ON u.id = cs.userId AND cs.endedAt IS NULL
            WHERE u.id = ?
        `, [testUserId]);
        
        if (!user) throw new Error('User or seeds not found');
        
        // Start a game
        const betAmount = 100;
        const minesCount = 3;
        await sql.query('UPDATE users SET balance = balance - ? WHERE id = ?', [betAmount, testUserId]);
        
        const [result] = await sql.query(
            'INSERT INTO mines (userId, amount, clientSeedId, serverSeedId, nonce, minesCount, mines, revealedTiles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [testUserId, betAmount, user.csId, user.ssId, 999, minesCount, JSON.stringify([0, 5, 10]), '[]']
        );
        
        console.log('2. Started game ID:', result.insertId, 'Bet:', betAmount);
        
        // Reveal some tiles
        const revealedTiles = [1, 2, 3]; // 3 safe tiles
        await sql.query('UPDATE mines SET revealedTiles = ? WHERE id = ?', [JSON.stringify(revealedTiles), result.insertId]);
        
        console.log('3. Revealed tiles:', revealedTiles);
        
        // Calculate expected payout
        const totalTiles = 25;
        const safeRevealed = revealedTiles.length;
        const safeTiles = totalTiles - minesCount;
        
        let multiplier = 1;
        for (let i = 0; i < safeRevealed; i++) {
            const probability = (safeTiles - i) / (totalTiles - i);
            multiplier *= (1 / probability);
        }
        multiplier *= (1 - 0.075); // House edge
        
        const expectedPayout = Math.round(betAmount * multiplier * 100) / 100;
        console.log('4. Expected multiplier:', multiplier.toFixed(2) + 'x');
        console.log('5. Expected payout:', expectedPayout);
        
        // Simulate cashout
        const [[game]] = await sql.query('SELECT * FROM mines WHERE id = ?', [result.insertId]);
        const gameRevealedTiles = Array.isArray(game.revealedTiles) ? game.revealedTiles : JSON.parse(game.revealedTiles);
        
        console.log('6. Game revealed tiles from DB:', gameRevealedTiles);
        
        const payout = expectedPayout;
        await sql.query('UPDATE mines SET endedAt = NOW(), payout = ? WHERE id = ?', [payout, result.insertId]);
        await sql.query('UPDATE users SET balance = balance + ? WHERE id = ?', [payout, testUserId]);
        
        const [[userAfter]] = await sql.query('SELECT balance FROM users WHERE id = ?', [testUserId]);
        
        console.log('7. User balance after:', userAfter.balance);
        console.log('8. Balance change:', userAfter.balance - userBefore.balance);
        console.log('9. Net profit:', (userAfter.balance - userBefore.balance) + betAmount, '(should be positive if won)');
        
        console.log('\n✅ Cashout flow test complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await sql.end();
    }
}

testCashout();
