// Load environment variables
require('dotenv').config();

const { sql } = require('./index');

/**
 * Verification script to check if profile and settings tables/columns exist
 */

async function verifyProfileSetup() {
    try {
        console.log('🔍 Verifying profile and settings setup...\n');

        // Check users table columns
        console.log('Checking users table columns:');
        const [userColumns] = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
            AND COLUMN_NAME IN ('mentionsEnabled', 'robloxCookie', 'proxy', 'perms', 'anon')
            ORDER BY ORDINAL_POSITION
        `, [process.env.SQL_DB]);

        if (userColumns.length > 0) {
            userColumns.forEach(col => {
                console.log(`  ✓ ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
            });
        } else {
            console.log('  ⚠️  No profile columns found in users table');
        }

        // Check if required tables exist
        console.log('\nChecking required tables:');
        const tables = ['discordAuths', 'robuxExchanges', 'securityKeys', 'promoCodes', 'promoCodeUses'];
        
        for (const table of tables) {
            const [[result]] = await sql.query(`
                SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            `, [process.env.SQL_DB, table]);
            
            if (result.count > 0) {
                console.log(`  ✓ ${table} table exists`);
            } else {
                console.log(`  ❌ ${table} table is missing`);
            }
        }

        // Get table row counts
        console.log('\nTable row counts:');
        for (const table of tables) {
            try {
                const [[result]] = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`  ${table}: ${result.count} rows`);
            } catch (e) {
                console.log(`  ${table}: Error - ${e.message}`);
            }
        }

        // Check users table structure
        console.log('\nUsers table sample:');
        const [[sampleUser]] = await sql.query(`
            SELECT id, username, balance, xp, anon, mentionsEnabled 
            FROM users 
            LIMIT 1
        `);
        
        if (sampleUser) {
            console.log('  ✓ Sample user found:', {
                id: sampleUser.id,
                username: sampleUser.username,
                balance: sampleUser.balance,
                anon: sampleUser.anon,
                mentionsEnabled: sampleUser.mentionsEnabled
            });
        } else {
            console.log('  ⚠️  No users in database');
        }

        console.log('\n✅ Verification complete!\n');

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        throw error;
    } finally {
        process.exit(0);
    }
}

verifyProfileSetup();
