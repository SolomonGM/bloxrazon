require('dotenv').config();
const { sql } = require('./database');

async function testLeaderboard() {
    console.log('🧪 Testing Leaderboard System\n');

    try {
        // 1. Check if tables exist
        console.log('1. Checking tables...');
        const [tables] = await sql.query(`
            SHOW TABLES LIKE 'leaderboard%'
        `);
        console.log(`   Found ${tables.length} leaderboard tables:`, tables.map(t => Object.values(t)[0]));

        // 2. Check if leaderboardBan column exists in users
        console.log('\n2. Checking users table...');
        const [columns] = await sql.query(`
            SHOW COLUMNS FROM users LIKE 'leaderboardBan'
        `);
        console.log(`   leaderboardBan column: ${columns.length > 0 ? '✓ EXISTS' : '✗ MISSING'}`);

        // 3. Check active leaderboards
        console.log('\n3. Checking active leaderboards...');
        const [active] = await sql.query(`
            SELECT id, type, createdAt, endedAt 
            FROM leaderboards 
            WHERE endedAt IS NULL
        `);
        console.log(`   Active leaderboards: ${active.length}`);
        active.forEach(lb => {
            console.log(`   - ${lb.type}: Created ${new Date(lb.createdAt).toISOString()}`);
        });

        // 4. Check completed bets count
        console.log('\n4. Checking bet data...');
        const [[betCount]] = await sql.query(`
            SELECT COUNT(*) as count 
            FROM bets 
            WHERE completed = 1
        `);
        console.log(`   Completed bets: ${betCount.count}`);

        // 5. Check current top 10 daily wagerers
        console.log('\n5. Checking top daily wagerers...');
        const [dailyLeaderboard] = await sql.query(`
            SELECT * FROM leaderboards 
            WHERE type = 'daily' AND endedAt IS NULL 
            LIMIT 1
        `);

        if (dailyLeaderboard.length > 0) {
            const [topUsers] = await sql.query(`
                SELECT 
                    users.id,
                    users.username,
                    SUM(bets.amount) as totalWagered,
                    COUNT(bets.id) as betCount
                FROM bets
                INNER JOIN users ON users.id = bets.userId
                WHERE bets.createdAt >= ? 
                    AND bets.completed = 1 
                    AND users.leaderboardBan = 0 
                    AND users.role = 'USER'
                GROUP BY userId
                ORDER BY totalWagered DESC
                LIMIT 10
            `, [dailyLeaderboard[0].createdAt]);

            if (topUsers.length > 0) {
                console.log(`   Top ${topUsers.length} users:`);
                topUsers.forEach((user, i) => {
                    console.log(`   ${i + 1}. ${user.username} - R$${user.totalWagered.toFixed(2)} (${user.betCount} bets)`);
                });
            } else {
                console.log('   No users found (no completed bets yet)');
            }
        } else {
            console.log('   No active daily leaderboard (will be created on server start)');
        }

        // 6. Check leaderboard feature status
        console.log('\n6. Checking feature status...');
        const [[feature]] = await sql.query(`
            SELECT * FROM features WHERE name = 'leaderboard'
        `);
        if (feature) {
            console.log(`   Leaderboard feature: ${feature.enabled ? '✓ ENABLED' : '✗ DISABLED'}`);
        } else {
            console.log('   ✗ Leaderboard feature not found in features table');
        }

        // 7. Check past leaderboard winners
        console.log('\n7. Checking past winners...');
        const [winners] = await sql.query(`
            SELECT 
                lu.position,
                u.username,
                lu.totalWagered,
                lu.amountWon,
                l.type,
                l.createdAt
            FROM leaderboardUsers lu
            INNER JOIN users u ON u.id = lu.userId
            INNER JOIN leaderboards l ON l.id = lu.leaderboardId
            WHERE lu.position <= 3
            ORDER BY l.createdAt DESC, lu.position ASC
            LIMIT 10
        `);
        
        if (winners.length > 0) {
            console.log(`   Recent winners:`);
            winners.forEach(w => {
                console.log(`   ${w.position}. ${w.username} - ${w.type} (R$${w.amountWon}) on ${new Date(w.createdAt).toLocaleDateString()}`);
            });
        } else {
            console.log('   No past winners yet');
        }

        console.log('\n✅ Leaderboard system test complete!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error testing leaderboard:', error);
        process.exit(1);
    }
}

testLeaderboard();
