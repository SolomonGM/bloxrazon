require('dotenv').config();
const { sql } = require('./index');

async function addMinesSupport() {
    try {
        console.log('Adding mines game support to database...');

        // Add missing columns to users table if they don't exist
        console.log('Checking users table columns...');
        await sql.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS sponsorLock BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS accountLock BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS lastLogout TIMESTAMP NULL
        `).catch(err => {
            // MySQL doesn't support IF NOT EXISTS for ALTER COLUMN, so we'll try each individually
            console.log('Trying individual column additions...');
        });

        // Try adding each column individually (for MySQL compatibility)
        const columns = [
            'banned BOOLEAN DEFAULT FALSE',
            'sponsorLock BOOLEAN DEFAULT FALSE',
            'accountLock BOOLEAN DEFAULT FALSE',
            'verified BOOLEAN DEFAULT FALSE',
            'lastLogout TIMESTAMP NULL'
        ];

        for (const column of columns) {
            const columnName = column.split(' ')[0];
            try {
                await sql.query(`ALTER TABLE users ADD COLUMN ${column}`);
                console.log(`✓ Added column: ${columnName}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`✓ Column already exists: ${columnName}`);
                } else {
                    console.error(`✗ Error adding column ${columnName}:`, err.message);
                }
            }
        }

        // Create features table
        console.log('Creating features table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS features (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                enabled BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Features table created/verified');

        // Create bannedPhrases table
        console.log('Creating bannedPhrases table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS bannedPhrases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phrase VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ BannedPhrases table created/verified');

        // Insert default features
        console.log('Adding default features...');
        const features = [
            ['mines', 1],
            ['crash', 1],
            ['roulette', 1],
            ['jackpot', 1],
            ['coinflip', 1],
            ['cases', 1],
            ['battles', 1],
            ['slots', 1],
            ['blackjack', 1],
            ['rain', 1],
            ['affiliates', 1],
            ['rakeback', 1],
            ['robuxDeposits', 1],
            ['robuxWithdrawals', 1],
            ['limitedDeposits', 1],
            ['limitedWithdrawals', 1],
            ['cryptoDeposits', 1],
            ['cryptoWithdrawals', 1],
            ['cardDeposits', 0],
            ['fiatDeposits', 0]
        ];

        for (const [name, enabled] of features) {
            try {
                await sql.query('INSERT INTO features (name, enabled) VALUES (?, ?)', [name, enabled]);
                console.log(`✓ Added feature: ${name} (${enabled ? 'enabled' : 'disabled'})`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`✓ Feature already exists: ${name}`);
                } else {
                    console.error(`✗ Error adding feature ${name}:`, err.message);
                }
            }
        }

        console.log('\n✅ Mines game support added successfully!');
        console.log('You can now use the mines game.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding mines support:', error);
        process.exit(1);
    }
}

addMinesSupport();
