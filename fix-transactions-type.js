const { sql } = require('./database');

async function fixTransactionsType() {
    try {
        console.log('Connecting to database...');
        
        // Test connection first
        await sql.query('SELECT 1');
        console.log('✅ Database connected');
        
        console.log('Updating transactions table type column...');
        
        await sql.query(`
            ALTER TABLE transactions 
            MODIFY COLUMN type ENUM('in', 'out', 'deposit', 'withdraw') NOT NULL
        `);
        
        console.log('✅ Successfully updated transactions table!');
        console.log('The type column now supports: in, out, deposit, withdraw');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

fixTransactionsType();
