require('dotenv').config();
const { sql } = require('./index');

async function updateLeaderboardSchema() {
    console.log('Updating leaderboard schema...');

    try {
        // Drop old leaderboards table if it exists with wrong schema
        await sql.query(`DROP TABLE IF EXISTS leaderboardUsers`);
        await sql.query(`DROP TABLE IF EXISTS leaderboards`);

        // Create new leaderboards table
        await sql.query(`
            CREATE TABLE IF NOT EXISTS leaderboards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('daily', 'weekly') NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                endedAt TIMESTAMP NULL
            )
        `);

        console.log('✓ Created leaderboards table');

        // Create leaderboardUsers table
        await sql.query(`
            CREATE TABLE IF NOT EXISTS leaderboardUsers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                leaderboardId INT NOT NULL,
                userId INT NOT NULL,
                position INT NOT NULL,
                totalWagered DECIMAL(15,2) DEFAULT 0.00,
                amountWon DECIMAL(15,2) DEFAULT 0.00,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (leaderboardId) REFERENCES leaderboards(id),
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        console.log('✓ Created leaderboardUsers table');

        // Add leaderboardBan column to users if it doesn't exist
        try {
            await sql.query(`
                ALTER TABLE users 
                ADD COLUMN leaderboardBan BOOLEAN DEFAULT FALSE 
                AFTER affiliateCodeLock
            `);
            console.log('✓ Added leaderboardBan column to users table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ leaderboardBan column already exists');
            } else {
                throw e;
            }
        }

        // Add leaderboard feature if it doesn't exist
        try {
            await sql.query(`
                INSERT IGNORE INTO features (name, enabled) 
                VALUES ('leaderboard', 1)
            `);
            console.log('✓ Added leaderboard feature');
        } catch (e) {
            console.log('✓ Leaderboard feature already exists');
        }

        console.log('✅ Leaderboard schema update complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error updating leaderboard schema:', error);
        process.exit(1);
    }
}

updateLeaderboardSchema();
