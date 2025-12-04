require('dotenv').config();
const { sql } = require('./index');

async function addAffiliateColumns() {
    try {
        console.log('Starting affiliate columns migration...');

        // Check if affiliateCode column exists
        const [affiliateCodeCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'affiliateCode'
        `, [process.env.DB_NAME]);

        if (affiliateCodeCheck.length === 0) {
            console.log('Adding affiliateCode column...');
            try {
                await sql.query(`
                    ALTER TABLE users 
                    ADD COLUMN affiliateCode VARCHAR(255) NULL UNIQUE
                `);
                console.log('✓ affiliateCode column added');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✓ affiliateCode column already exists');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('✓ affiliateCode column already exists');
        }

        // Check if affiliateEarningsOffset column exists
        const [earningsOffsetCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'affiliateEarningsOffset'
        `, [process.env.DB_NAME]);

        if (earningsOffsetCheck.length === 0) {
            console.log('Adding affiliateEarningsOffset column...');
            try {
                await sql.query(`
                    ALTER TABLE users 
                    ADD COLUMN affiliateEarningsOffset DECIMAL(15,2) DEFAULT 0.00
                `);
                console.log('✓ affiliateEarningsOffset column added');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✓ affiliateEarningsOffset column already exists');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('✓ affiliateEarningsOffset column already exists');
        }

        // Check if affiliateCodeLock column exists
        const [codeLockCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'affiliateCodeLock'
        `, [process.env.DB_NAME]);

        if (codeLockCheck.length === 0) {
            console.log('Adding affiliateCodeLock column...');
            try {
                await sql.query(`
                    ALTER TABLE users 
                    ADD COLUMN affiliateCodeLock BOOLEAN DEFAULT FALSE
                `);
                console.log('✓ affiliateCodeLock column added');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✓ affiliateCodeLock column already exists');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('✓ affiliateCodeLock column already exists');
        }

        // Check if affiliates table exists
        const [affiliatesTableCheck] = await sql.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'affiliates'
        `, [process.env.DB_NAME]);

        if (affiliatesTableCheck.length === 0) {
            console.log('Creating affiliates table...');
            await sql.query(`
                CREATE TABLE IF NOT EXISTS affiliates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    affiliateId INT NOT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id),
                    FOREIGN KEY (affiliateId) REFERENCES users(id),
                    UNIQUE KEY unique_affiliate (userId, affiliateId)
                )
            `);
            console.log('✓ affiliates table created');
        } else {
            console.log('✓ affiliates table already exists');
        }

        console.log('\n✅ Affiliate columns migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addAffiliateColumns();
