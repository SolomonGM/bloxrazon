const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoulette() {
    console.log('🔧 Fixing roulette table...\n');
    
    const connection = await mysql.createConnection({
        host: process.env.SQL_HOST || 'localhost',
        port: process.env.SQL_PORT || 3306,
        user: process.env.SQL_USER,
        database: process.env.SQL_DB,
        password: process.env.SQL_PASS,
    });

    try {
        console.log('✅ Connected to database');
        
        // Fix result column
        console.log('1️⃣ Updating result column to allow NULL...');
        await connection.query('ALTER TABLE roulette MODIFY COLUMN result INT NULL');
        console.log('✅ Result column updated');
        
        // Fix color column in roulette table
        console.log('2️⃣ Updating color enum to include gold...');
        await connection.query("ALTER TABLE roulette MODIFY COLUMN color ENUM('red', 'green', 'gold') NULL");
        console.log('✅ Roulette color column updated');
        
        // Fix color column in rouletteBets table
        console.log('3️⃣ Updating rouletteBets color enum...');
        await connection.query("ALTER TABLE rouletteBets MODIFY COLUMN color ENUM('red', 'green', 'gold') NOT NULL");
        console.log('✅ RouletteBets color column updated');
        
        // Check if we need to rename rouletteId to roundId
        console.log('4️⃣ Checking rouletteBets column names...');
        const [columns] = await connection.query("SHOW COLUMNS FROM rouletteBets LIKE 'rouletteId'");
        
        if (columns.length > 0) {
            console.log('⚠️  Found old column name "rouletteId", renaming to "roundId"...');
            
            // Drop foreign key first
            const [fks] = await connection.query(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'rouletteBets' 
                AND COLUMN_NAME = 'rouletteId'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `);
            
            for (const fk of fks) {
                console.log(`   Dropping foreign key ${fk.CONSTRAINT_NAME}...`);
                await connection.query(`ALTER TABLE rouletteBets DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
            }
            
            // Rename column
            console.log('   Renaming column...');
            await connection.query('ALTER TABLE rouletteBets CHANGE rouletteId roundId INT NOT NULL');
            
            // Re-add foreign key
            console.log('   Re-adding foreign key...');
            await connection.query('ALTER TABLE rouletteBets ADD FOREIGN KEY (roundId) REFERENCES roulette(id)');
            
            console.log('✅ Column renamed from rouletteId to roundId');
        } else {
            console.log('✅ Column name is already correct (roundId)');
        }
        
        console.log('\n🎉 All fixes applied successfully!');
        console.log('✅ You can now start the server with: node app.js\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await connection.end();
        process.exit(0);
    }
}

fixRoulette().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
