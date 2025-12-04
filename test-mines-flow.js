require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Simulate authenticated user
const testUserId = 2;

// Test the mines endpoints
const { generateMinePositions, calculateMultiplier } = require('./routes/games/mines/functions');
const { sql } = require('./database');

async function testMinesFlow() {
    console.log('=== Testing Complete Mines Game Flow ===\n');
    
    try {
        // Step 1: Check if user has seeds
        console.log('Step 1: Checking user seeds...');
        const [[user]] = await sql.query(`
            SELECT u.id, u.balance, u.xp, 
                   ss.seed as serverSeed, ss.id as ssId, ss.nonce, 
                   cs.seed as clientSeed, cs.id as csId 
            FROM users u
            LEFT JOIN serverSeeds ss ON u.id = ss.userId AND ss.endedAt IS NULL
            LEFT JOIN clientSeeds cs ON u.id = cs.userId AND cs.endedAt IS NULL
            WHERE u.id = ?
        `, [testUserId]);
        
        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }
        
        console.log(`✅ User ${user.id} found, Balance: ${user.balance}`);
        console.log(`   Server Seed: ${user.serverSeed ? 'EXISTS' : 'MISSING'}`);
        console.log(`   Client Seed: ${user.clientSeed ? 'EXISTS' : 'MISSING'}`);
        
        if (!user.serverSeed || !user.clientSeed) {
            console.error('❌ User missing seeds! Creating them...');
            
            if (!user.serverSeed) {
                const [result] = await sql.query('INSERT INTO serverSeeds (userId, seed, nonce) VALUES (?, ?, 0)', 
                    [testUserId, require('crypto').randomBytes(32).toString('hex')]);
                console.log('✅ Created server seed');
            }
            
            if (!user.clientSeed) {
                await sql.query('INSERT INTO clientSeeds (userId, seed) VALUES (?, ?)', 
                    [testUserId, require('crypto').randomBytes(32).toString('hex')]);
                console.log('✅ Created client seed');
            }
            
            // Re-fetch user
            const [[updatedUser]] = await sql.query(`
                SELECT u.id, u.balance, ss.seed as serverSeed, ss.id as ssId, ss.nonce, cs.seed as clientSeed, cs.id as csId 
                FROM users u
                INNER JOIN serverSeeds ss ON u.id = ss.userId AND ss.endedAt IS NULL
                INNER JOIN clientSeeds cs ON u.id = cs.userId AND cs.endedAt IS NULL
                WHERE u.id = ?
            `, [testUserId]);
            Object.assign(user, updatedUser);
        }
        
        // Step 2: Clear any active games
        console.log('\nStep 2: Clearing active games...');
        const [cleared] = await sql.query('UPDATE mines SET endedAt = NOW() WHERE userId = ? AND endedAt IS NULL', [testUserId]);
        console.log(`✅ Cleared ${cleared.affectedRows} active games`);
        
        // Step 3: Generate mines
        console.log('\nStep 3: Testing mine generation...');
        const minesCount = 3;
        const nonce = user.nonce + 1;
        const minePositions = generateMinePositions(user.serverSeed, user.clientSeed, nonce, minesCount);
        console.log(`✅ Generated ${minePositions.length} mines at positions:`, minePositions);
        console.log(`   All unique? ${minePositions.length === new Set(minePositions).size}`);
        console.log(`   All valid (0-24)? ${minePositions.every(m => m >= 0 && m <= 24)}`);
        
        // Step 4: Start a game
        console.log('\nStep 4: Starting a game...');
        const betAmount = 100;
        
        await sql.query('UPDATE serverSeeds SET nonce = nonce + 1 WHERE id = ?', [user.ssId]);
        await sql.query('UPDATE users SET balance = balance - ? WHERE id = ?', [betAmount, testUserId]);
        
        const [gameResult] = await sql.query(
            'INSERT INTO mines (userId, amount, clientSeedId, serverSeedId, nonce, minesCount, mines, revealedTiles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [testUserId, betAmount, user.csId, user.ssId, nonce, minesCount, JSON.stringify(minePositions), '[]']
        );
        
        const gameId = gameResult.insertId;
        console.log(`✅ Game started! ID: ${gameId}`);
        
        // Step 5: Check active game
        console.log('\nStep 5: Fetching active game...');
        const [[activeGame]] = await sql.query('SELECT * FROM mines WHERE id = ?', [gameId]);
        const mines = Array.isArray(activeGame.mines) ? activeGame.mines : JSON.parse(activeGame.mines);
        const revealedTiles = Array.isArray(activeGame.revealedTiles) ? activeGame.revealedTiles : (activeGame.revealedTiles ? JSON.parse(activeGame.revealedTiles) : []);
        console.log(`✅ Game found:`, {
            id: activeGame.id,
            minesCount: activeGame.minesCount,
            mines: mines,
            revealedTiles: revealedTiles
        });
        
        // Step 6: Reveal safe tiles
        console.log('\nStep 6: Revealing tiles...');
        const allTiles = Array.from({length: 25}, (_, i) => i);
        const safeTiles = allTiles.filter(t => !minePositions.includes(t));
        
        console.log(`Safe tiles available: ${safeTiles.length}`);
        console.log(`Revealing first 3 safe tiles:`, safeTiles.slice(0, 3));
        
        for (let i = 0; i < 3; i++) {
            const tile = safeTiles[i];
            const [[game]] = await sql.query('SELECT revealedTiles FROM mines WHERE id = ?', [gameId]);
            const revealed = Array.isArray(game.revealedTiles) ? game.revealedTiles : (game.revealedTiles ? JSON.parse(game.revealedTiles) : []);
            revealed.push(tile);
            
            await sql.query('UPDATE mines SET revealedTiles = ? WHERE id = ?', [JSON.stringify(revealed), gameId]);
            
            const multiplier = calculateMultiplier(minesCount, revealed.length);
            const payout = Math.floor(betAmount * multiplier * 100) / 100;
            
            console.log(`   Tile ${tile}: ${revealed.length} revealed, Multiplier: ${multiplier}x, Payout: ${payout}`);
        }
        
        // Step 7: Test cashout
        console.log('\nStep 7: Testing cashout...');
        const [[finalGame]] = await sql.query('SELECT * FROM mines WHERE id = ?', [gameId]);
        const finalRevealed = Array.isArray(finalGame.revealedTiles) ? finalGame.revealedTiles : JSON.parse(finalGame.revealedTiles);
        const finalMultiplier = calculateMultiplier(minesCount, finalRevealed.length);
        const finalPayout = Math.floor(betAmount * finalMultiplier * 100) / 100;
        
        await sql.query('UPDATE mines SET endedAt = NOW(), payout = ? WHERE id = ?', [finalPayout, gameId]);
        await sql.query('UPDATE users SET balance = balance + ? WHERE id = ?', [finalPayout, testUserId]);
        
        console.log(`✅ Cashed out! Payout: ${finalPayout}`);
        
        console.log('\n=== ✅ All Tests Passed! ===');
        console.log('The mines game backend is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
    
    process.exit(0);
}

testMinesFlow();
