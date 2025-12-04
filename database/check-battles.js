require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function checkBattles() {
    console.log('Checking battles tables...\n');
    
    try {
        const tables = ['battles', 'battleRounds', 'battlePlayers', 'battleOpenings'];
        
        for (const table of tables) {
            try {
                const [columns] = await sql.query(`SHOW COLUMNS FROM ${table}`);
                console.log(`\n=== ${table} ===`);
                columns.forEach(col => {
                    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
                });
            } catch (err) {
                console.log(`\n=== ${table} ===`);
                console.log(`  ❌ Table does not exist`);
            }
        }
        
        // Check if there are any battles
        try {
            const [[count]] = await sql.query('SELECT COUNT(*) as count FROM battles');
            console.log(`\n\n📊 Current battles: ${count.count}`);
        } catch (e) {
            console.log('\n\n📊 Cannot count battles - table may not exist');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sql.end();
    }
}

checkBattles();
