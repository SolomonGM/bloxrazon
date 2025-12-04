const { sql } = require('./index');

async function verifyCoinflipSetup() {
    console.log('Verifying coinflip table setup...\n');

    try {
        // Check table exists
        const [tableCheck] = await sql.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips'
        `);

        if (tableCheck.length === 0) {
            console.log('❌ coinflips table does not exist');
            console.log('   Run: node database/apply-complete-schema.js');
            process.exit(1);
        }

        console.log('✓ coinflips table exists');

        // Check all required columns
        const [columns] = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips'
            ORDER BY ORDINAL_POSITION
        `);

        console.log('\nTable columns:');
        const requiredColumns = [
            'id', 'ownerId', 'fire', 'ice', 'amount', 'winnerSide', 
            'privKey', 'minLevel', 'EOSBlock', 'clientSeed', 'serverSeed', 
            'result', 'startedAt', 'endedAt', 'createdAt'
        ];

        const existingColumns = columns.map(col => col.COLUMN_NAME);
        
        for (const reqCol of requiredColumns) {
            if (existingColumns.includes(reqCol)) {
                const col = columns.find(c => c.COLUMN_NAME === reqCol);
                console.log(`  ✓ ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
            } else {
                console.log(`  ❌ ${reqCol} - MISSING`);
            }
        }

        // Check foreign keys
        const [foreignKeys] = await sql.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'coinflips'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        console.log('\nForeign keys:');
        for (const fk of foreignKeys) {
            console.log(`  ✓ ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
        }

        // Check if there are any coinflip records
        const [[{ count }]] = await sql.query('SELECT COUNT(*) as count FROM coinflips');
        console.log(`\nExisting coinflip records: ${count}`);

        // Check bets table for coinflip entries
        const [[{ betCount }]] = await sql.query(`
            SELECT COUNT(*) as betCount 
            FROM bets 
            WHERE game = 'coinflip'
        `);
        console.log(`Coinflip bet records: ${betCount}`);

        console.log('\n✅ Coinflip setup verification completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error verifying coinflip setup:', error);
        process.exit(1);
    }
}

verifyCoinflipSetup();
