require('dotenv').config();
const { sql } = require('./index');

async function addAffiliateClaimsTable() {
    try {
        console.log('Starting affiliateClaims table migration...');

        // Check if affiliateClaims table exists
        const [claimsTableCheck] = await sql.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'affiliateClaims'
        `, [process.env.DB_NAME]);

        if (claimsTableCheck.length === 0) {
            console.log('Creating affiliateClaims table...');
            await sql.query(`
                CREATE TABLE IF NOT EXISTS affiliateClaims (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);
            console.log('✓ affiliateClaims table created');
        } else {
            console.log('✓ affiliateClaims table already exists');
        }

        console.log('\n✅ affiliateClaims table migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addAffiliateClaimsTable();
