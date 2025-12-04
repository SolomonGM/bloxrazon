const { sql } = require('./index');

async function addBotUser() {
    console.log('Checking for BOT user...\n');

    try {
        // Check if BOT user exists
        const [bots] = await sql.query(`SELECT id, username, role FROM users WHERE role = 'BOT' LIMIT 1`);

        if (bots.length > 0) {
            console.log('✓ BOT user already exists:');
            console.log(`  ID: ${bots[0].id}`);
            console.log(`  Username: ${bots[0].username}`);
            console.log(`  Role: ${bots[0].role}`);
        } else {
            console.log('No BOT user found. Creating one...');
            
            await sql.query(`
                INSERT INTO users (username, role, balance, xp, anon) 
                VALUES ('CoinflipBot', 'BOT', 0, 0, 0)
            `);
            
            const [newBot] = await sql.query(`SELECT id, username, role FROM users WHERE role = 'BOT' LIMIT 1`);
            
            console.log('✓ BOT user created:');
            console.log(`  ID: ${newBot[0].id}`);
            console.log(`  Username: ${newBot[0].username}`);
            console.log(`  Role: ${newBot[0].role}`);
        }

        console.log('\n✅ BOT user setup completed!');
        await sql.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up BOT user:', error.message);
        if (error.code) console.error('Error code:', error.code);
        await sql.end();
        process.exit(1);
    }
}

addBotUser();
