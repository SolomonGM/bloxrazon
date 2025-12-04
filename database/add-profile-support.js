// Load environment variables
require('dotenv').config();

const { sql } = require('./index');

/**
 * Migration script to add profile and settings support
 * Adds missing columns to users table and creates missing tables
 */

async function addProfileSupport() {
    try {
        console.log('Starting profile and settings migration...');
        console.log('Connecting to database:', process.env.SQL_HOST);

        // Add missing columns to users table
        console.log('Adding missing columns to users table...');
        
        // Check and add mentionsEnabled column
        try {
            const [[column]] = await sql.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'mentionsEnabled'
            `, [process.env.SQL_DB]);
            
            if (!column) {
                await sql.query(`ALTER TABLE users ADD COLUMN mentionsEnabled BOOLEAN DEFAULT TRUE AFTER anon`);
                console.log('✓ Added mentionsEnabled column');
            } else {
                console.log('✓ mentionsEnabled column already exists');
            }
        } catch (e) {
            console.log('Note: mentionsEnabled -', e.message);
        }

        // Check and add robloxCookie column
        try {
            const [[column]] = await sql.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'robloxCookie'
            `, [process.env.SQL_DB]);
            
            if (!column) {
                await sql.query(`ALTER TABLE users ADD COLUMN robloxCookie TEXT NULL AFTER verified`);
                console.log('✓ Added robloxCookie column');
            } else {
                console.log('✓ robloxCookie column already exists');
            }
        } catch (e) {
            console.log('Note: robloxCookie -', e.message);
        }

        // Check and add proxy column
        try {
            const [[column]] = await sql.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'proxy'
            `, [process.env.SQL_DB]);
            
            if (!column) {
                await sql.query(`ALTER TABLE users ADD COLUMN proxy VARCHAR(255) NULL AFTER robloxCookie`);
                console.log('✓ Added proxy column');
            } else {
                console.log('✓ proxy column already exists');
            }
        } catch (e) {
            console.log('Note: proxy -', e.message);
        }

        // Check and add perms column
        try {
            const [[column]] = await sql.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'perms'
            `, [process.env.SQL_DB]);
            
            if (!column) {
                await sql.query(`ALTER TABLE users ADD COLUMN perms JSON NULL AFTER proxy`);
                console.log('✓ Added perms column');
            } else {
                console.log('✓ perms column already exists');
            }
        } catch (e) {
            console.log('Note: perms -', e.message);
        }

        // Create discordAuths table
        console.log('\nCreating discordAuths table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS discordAuths (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                discordId VARCHAR(255) NOT NULL UNIQUE,
                token TEXT NOT NULL,
                tokenExpiresAt TIMESTAMP NOT NULL,
                refreshToken TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);
        console.log('✓ Created discordAuths table');

        // Create robuxExchanges table
        console.log('Creating robuxExchanges table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS robuxExchanges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                totalAmount DECIMAL(15,2) NOT NULL,
                filledAmount DECIMAL(15,2) DEFAULT 0.00,
                operation ENUM('deposit', 'withdraw') NOT NULL,
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);
        console.log('✓ Created robuxExchanges table');

        // Create securityKeys table
        console.log('Creating securityKeys table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS securityKeys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                keyName VARCHAR(255) NOT NULL,
                privateKey TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);
        console.log('✓ Created securityKeys table');

        // Create promoCodes table
        console.log('Creating promoCodes table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS promoCodes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(255) NOT NULL UNIQUE,
                amount DECIMAL(15,2) NOT NULL,
                totalUses INT NULL,
                currentUses INT DEFAULT 0,
                minLvl INT DEFAULT 0,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created promoCodes table');

        // Create promoCodeUses table
        console.log('Creating promoCodeUses table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS promoCodeUses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                promoCodeId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (promoCodeId) REFERENCES promoCodes(id),
                UNIQUE KEY unique_user_promo (userId, promoCodeId)
            )
        `);
        console.log('✓ Created promoCodeUses table');

        console.log('\n✅ Profile and settings migration completed successfully!');
        console.log('\nThe following has been added:');
        console.log('  - mentionsEnabled column to users table');
        console.log('  - robloxCookie column to users table');
        console.log('  - proxy column to users table');
        console.log('  - perms column to users table');
        console.log('  - discordAuths table');
        console.log('  - robuxExchanges table');
        console.log('  - securityKeys table');
        console.log('  - promoCodes table');
        console.log('  - promoCodeUses table');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

addProfileSupport();
