const { sql } = require('./index');

async function setupRoulette() {
    console.log('Setting up roulette tables...');
    
    try {
        // First, check if tables exist and drop them if needed for a fresh start
        console.log('Checking existing roulette tables...');
        
        // Check if we need to update the schema
        const [rouletteTables] = await sql.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('roulette', 'rouletteBets')
        `);
        
        console.log(`Found ${rouletteTables.length} existing roulette tables`);
        
        // Check if roulette table has the correct columns
        if (rouletteTables.some(t => t.TABLE_NAME === 'roulette')) {
            const [columns] = await sql.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'roulette'
            `);
            
            console.log('Roulette table columns:', columns.map(c => c.COLUMN_NAME).join(', '));
            
            // Check if we need to add missing columns
            const columnNames = columns.map(c => c.COLUMN_NAME);
            
            if (!columnNames.includes('roundId')) {
                console.log('Adding roundId column...');
                await sql.query('ALTER TABLE roulette ADD COLUMN roundId VARCHAR(255) NULL AFTER id');
            }
            
            if (!columnNames.includes('serverSeed')) {
                console.log('Adding serverSeed column...');
                await sql.query('ALTER TABLE roulette ADD COLUMN serverSeed VARCHAR(255) NULL AFTER color');
            }
            
            if (!columnNames.includes('clientSeed')) {
                console.log('Adding clientSeed column...');
                await sql.query('ALTER TABLE roulette ADD COLUMN clientSeed VARCHAR(255) NULL AFTER serverSeed');
            }
        } else {
            // Create roulette table from scratch
            console.log('Creating roulette table...');
            await sql.query(`
                CREATE TABLE IF NOT EXISTS roulette (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    roundId VARCHAR(255) NULL,
                    result INT NULL,
                    color ENUM('red', 'green', 'gold') NULL,
                    EOSBlock INT NULL,
                    serverSeed VARCHAR(255) NULL,
                    clientSeed VARCHAR(255) NULL,
                    rolledAt TIMESTAMP NULL,
                    endedAt TIMESTAMP NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }
        
        // Check/create rouletteBets table
        if (rouletteTables.some(t => t.TABLE_NAME === 'rouletteBets')) {
            console.log('rouletteBets table already exists');
            
            // Check if it has the correct structure
            const [betColumns] = await sql.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'rouletteBets'
            `);
            
            console.log('rouletteBets columns:', betColumns.map(c => c.COLUMN_NAME).join(', '));
            
            // Check if roundId column exists (it should reference roulette.id, not be called rouletteId)
            const columnNames = betColumns.map(c => c.COLUMN_NAME);
            
            if (columnNames.includes('rouletteId') && !columnNames.includes('roundId')) {
                console.log('Renaming rouletteId to roundId in rouletteBets...');
                
                // Drop foreign key first if it exists
                const [fks] = await sql.query(`
                    SELECT CONSTRAINT_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'rouletteBets'
                    AND CONSTRAINT_NAME != 'PRIMARY'
                    AND REFERENCED_TABLE_NAME = 'roulette'
                `);
                
                for (const fk of fks) {
                    console.log(`Dropping foreign key ${fk.CONSTRAINT_NAME}...`);
                    await sql.query(`ALTER TABLE rouletteBets DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                }
                
                // Rename column
                await sql.query('ALTER TABLE rouletteBets CHANGE rouletteId roundId INT NOT NULL');
                
                // Re-add foreign key
                await sql.query('ALTER TABLE rouletteBets ADD FOREIGN KEY (roundId) REFERENCES roulette(id)');
            }
        } else {
            console.log('Creating rouletteBets table...');
            await sql.query(`
                CREATE TABLE IF NOT EXISTS rouletteBets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    roundId INT NOT NULL,
                    userId INT NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    color ENUM('red', 'green', 'gold') NOT NULL,
                    payout DECIMAL(15,2) DEFAULT 0.00,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (roundId) REFERENCES roulette(id),
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);
        }
        
        // Verify the setup
        const [[rouletteCount]] = await sql.query('SELECT COUNT(*) as count FROM roulette');
        const [[betsCount]] = await sql.query('SELECT COUNT(*) as count FROM rouletteBets');
        
        console.log('\n✅ Roulette setup complete!');
        console.log(`   - Roulette rounds: ${rouletteCount.count}`);
        console.log(`   - Roulette bets: ${betsCount.count}`);
        
        // Check if roulette feature is enabled
        const [[feature]] = await sql.query('SELECT enabled FROM features WHERE name = ?', ['roulette']);
        if (!feature) {
            console.log('\n⚠️  Adding roulette to features table...');
            await sql.query('INSERT INTO features (name, enabled) VALUES (?, 1)', ['roulette']);
        } else if (feature.enabled) {
            console.log('✅ Roulette feature is enabled');
        } else {
            console.log('⚠️  Roulette feature is disabled. Enable it in the admin panel or run:');
            console.log('   UPDATE features SET enabled = 1 WHERE name = "roulette"');
        }
        
    } catch (error) {
        console.error('❌ Error setting up roulette:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    setupRoulette()
        .then(() => {
            console.log('\n✅ Done!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { setupRoulette };
