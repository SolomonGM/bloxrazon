require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function createBots() {
    console.log('🤖 Creating bot users for battles...\n');
    
    try {
        const botNames = [
            'JeroldBOT',
            'TimmyBOT', 
            'DanielBOT',
            'RaymondBOT',
            'EdwinBOT',
            'CoinflipBOT'
        ];
        
        for (let i = 0; i < botNames.length; i++) {
            const botName = botNames[i];
            
            console.log(`[${i + 1}/${botNames.length}] Creating bot: ${botName}...`);
            
            // Check if bot already exists
            const [[existing]] = await sql.query(
                'SELECT id FROM users WHERE username = ?',
                [botName]
            );
            
            if (existing) {
                console.log(`  ↳ Bot already exists with ID: ${existing.id}`);
                
                // Make sure it has BOT role
                await sql.query(
                    'UPDATE users SET role = ? WHERE id = ?',
                    ['BOT', existing.id]
                );
                console.log('  ↳ Role updated to BOT\n');
            } else {
                // Create new bot user
                const [result] = await sql.query(`
                    INSERT INTO users (username, balance, xp, role, anon, banned, verified)
                    VALUES (?, 999999.99, 10000, 'BOT', 0, 0, 1)
                `, [botName]);
                
                console.log(`  ↳ Created bot with ID: ${result.insertId}\n`);
            }
        }
        
        // Verify bots
        const [bots] = await sql.query(
            'SELECT id, username, role, balance, xp FROM users WHERE role = ?',
            ['BOT']
        );
        
        console.log('✅ Bot creation completed!\n');
        console.log(`Total bots available: ${bots.length}`);
        console.log('\nBot Users:');
        bots.forEach(bot => {
            console.log(`  - ${bot.username} (ID: ${bot.id}, Balance: R$ ${bot.balance})`);
        });
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

createBots();
