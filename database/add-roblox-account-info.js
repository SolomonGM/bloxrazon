const { sql } = require('./index');

async function addRobloxAccountInfo() {
    try {
        console.log('Adding Roblox account info columns to users table...');

        // Check if columns already exist
        const [columns] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('robloxId', 'robloxUsername', 'robloxAvatarUrl', 'robloxRobux')
        `);

        const existingColumns = columns.map(col => col.COLUMN_NAME);

        if (!existingColumns.includes('robloxId')) {
            await sql.query(`
                ALTER TABLE users 
                ADD COLUMN robloxId BIGINT NULL AFTER robloxCookie,
                ADD UNIQUE KEY unique_roblox_id (robloxId)
            `);
            console.log('✓ Added robloxId column');
        } else {
            console.log('- robloxId column already exists');
        }

        if (!existingColumns.includes('robloxUsername')) {
            await sql.query(`
                ALTER TABLE users 
                ADD COLUMN robloxUsername VARCHAR(255) NULL AFTER robloxId
            `);
            console.log('✓ Added robloxUsername column');
        } else {
            console.log('- robloxUsername column already exists');
        }

        if (!existingColumns.includes('robloxAvatarUrl')) {
            await sql.query(`
                ALTER TABLE users 
                ADD COLUMN robloxAvatarUrl TEXT NULL AFTER robloxUsername
            `);
            console.log('✓ Added robloxAvatarUrl column');
        } else {
            console.log('- robloxAvatarUrl column already exists');
        }

        if (!existingColumns.includes('robloxRobux')) {
            await sql.query(`
                ALTER TABLE users 
                ADD COLUMN robloxRobux INT DEFAULT 0 AFTER robloxAvatarUrl
            `);
            console.log('✓ Added robloxRobux column');
        } else {
            console.log('- robloxRobux column already exists');
        }

        console.log('✓ Roblox account info columns migration completed successfully');

    } catch (error) {
        console.error('✗ Migration failed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    addRobloxAccountInfo()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addRobloxAccountInfo };
