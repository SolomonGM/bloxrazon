require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function renameBots() {
    console.log('🤖 Renaming existing bot users...\n');
    
    try {
        // Mapping of old names to new names
        const botNameMapping = {
            'BotPlayer1': 'JeroldBOT',
            'BotPlayer2': 'TimmyBOT',
            'BotPlayer3': 'DanielBOT',
            'BotPlayer4': 'RaymondBOT',
            'BotPlayer5': 'EdwinBOT',
            'CoinflipBot': 'CoinflipBOT'
        };

        // Get all current bot users
        const [bots] = await sql.query(
            'SELECT id, username, role FROM users WHERE role = ?',
            ['BOT']
        );

        console.log(`Found ${bots.length} bot users in database\n`);

        let renamed = 0;

        for (const bot of bots) {
            const newName = botNameMapping[bot.username];
            
            if (newName && newName !== bot.username) {
                console.log(`Renaming: ${bot.username} → ${newName} (ID: ${bot.id})`);
                
                await sql.query(
                    'UPDATE users SET username = ? WHERE id = ?',
                    [newName, bot.id]
                );
                
                renamed++;
            } else if (bot.username.includes('Bot') && !bot.username.includes('BOT')) {
                // Handle any other bot names that need the BOT suffix
                const newName = bot.username.replace('Bot', 'BOT');
                console.log(`Renaming: ${bot.username} → ${newName} (ID: ${bot.id})`);
                
                await sql.query(
                    'UPDATE users SET username = ? WHERE id = ?',
                    [newName, bot.id]
                );
                
                renamed++;
            } else {
                console.log(`Skipping: ${bot.username} (already correct format)`);
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`Renamed ${renamed} bot(s)\n`);

        // Show final bot list
        const [updatedBots] = await sql.query(
            'SELECT id, username FROM users WHERE role = ? ORDER BY id',
            ['BOT']
        );

        console.log('Current bot users:');
        updatedBots.forEach(bot => {
            console.log(`  - ${bot.username} (ID: ${bot.id})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

renameBots();
