require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function migrateBattles() {
    console.log('🔧 Migrating battles tables to match backend code...\n');
    
    try {
        console.log('[1/6] Disabling foreign key checks...');
        await sql.query('SET FOREIGN_KEY_CHECKS=0');
        console.log('  ✓ Success\n');
        
        // Drop tables
        console.log('[2/6] Dropping old battles tables...');
        await sql.query('DROP TABLE IF EXISTS battleOpenings');
        await sql.query('DROP TABLE IF EXISTS battlePlayers');
        await sql.query('DROP TABLE IF EXISTS battleRounds');
        await sql.query('DROP TABLE IF EXISTS battles');
        console.log('  ✓ Success\n');
        
        // Create battles table
        console.log('[3/6] Creating battles table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS battles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ownerId INT NOT NULL,
                entryPrice DECIMAL(15,2) DEFAULT 0.00,
                teams INT DEFAULT 2,
                playersPerTeam INT DEFAULT 1,
                round INT DEFAULT 0,
                privKey VARCHAR(255) NULL,
                minLevel INT DEFAULT 0,
                ownerFunding INT DEFAULT 0,
                EOSBlock INT NULL,
                clientSeed VARCHAR(255) NULL,
                serverSeed VARCHAR(255) NULL,
                winnerTeam INT NULL,
                gamemode ENUM('standard', 'crazy', 'group') DEFAULT 'standard',
                startedAt TIMESTAMP NULL,
                endedAt TIMESTAMP NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ownerId) REFERENCES users(id)
            )
        `);
        console.log('  ✓ Success\n');
        
        // Create battleRounds table
        console.log('[4/6] Creating battleRounds table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS battleRounds (
                id INT AUTO_INCREMENT PRIMARY KEY,
                battleId INT NOT NULL,
                round INT NOT NULL,
                caseVersionId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (battleId) REFERENCES battles(id),
                INDEX idx_battle_round (battleId, round)
            )
        `);
        console.log('  ✓ Success\n');
        
        // Create battlePlayers table
        console.log('[5/6] Creating battlePlayers table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS battlePlayers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                battleId INT NOT NULL,
                userId INT NOT NULL,
                slot INT NOT NULL,
                team INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (battleId) REFERENCES battles(id),
                FOREIGN KEY (userId) REFERENCES users(id),
                UNIQUE KEY unique_battle_slot (battleId, slot)
            )
        `);
        console.log('  ✓ Success\n');
        
        // Create battleOpenings table
        await sql.query(`
            CREATE TABLE IF NOT EXISTS battleOpenings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                battleId INT NOT NULL,
                caseOpeningId INT NOT NULL,
                round INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (battleId) REFERENCES battles(id),
                INDEX idx_battle_round (battleId, round)
            )
        `);
        
        console.log('[6/6] Re-enabling foreign key checks...');
        await sql.query('SET FOREIGN_KEY_CHECKS=1');
        console.log('  ✓ Success\n');
        
        console.log('✅ Battles migration completed successfully!\n');
        console.log('Battles tables are now ready to use.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

migrateBattles();
