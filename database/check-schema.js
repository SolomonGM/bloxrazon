require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function checkTables() {
    console.log('Checking database table structures...\n');
    
    try {
        const tables = ['cases', 'caseVersions', 'caseItems', 'caseOpenings', 'fairRolls'];
        
        for (const table of tables) {
            try {
                const [columns] = await sql.query(`SHOW COLUMNS FROM ${table}`);
                console.log(`\n=== ${table} ===`);
                columns.forEach(col => {
                    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
                });
            } catch (err) {
                console.log(`\n=== ${table} ===`);
                console.log(`  ❌ Table does not exist: ${err.message}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sql.end();
    }
}

checkTables();
