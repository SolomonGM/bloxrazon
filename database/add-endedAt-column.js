require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function addEndedAtColumn() {
    console.log('🔧 Adding missing endedAt column to caseVersions...\n');
    
    try {
        console.log('[1/3] Checking current structure...');
        const [columns] = await sql.query('SHOW COLUMNS FROM caseVersions');
        const hasEndedAt = columns.some(col => col.Field === 'endedAt');
        
        if (hasEndedAt) {
            console.log('  ✓ endedAt column already exists\n');
        } else {
            console.log('  ✗ endedAt column missing\n');
            
            console.log('[2/3] Adding endedAt column...');
            await sql.query(`
                ALTER TABLE caseVersions 
                ADD COLUMN endedAt TIMESTAMP NULL AFTER createdAt
            `);
            console.log('  ✓ Success\n');
        }
        
        console.log('[3/3] Verifying updated structure...');
        const [newColumns] = await sql.query('SHOW COLUMNS FROM caseVersions');
        console.log('  Columns:');
        newColumns.forEach(col => {
            console.log(`    - ${col.Field} (${col.Type})`);
        });
        console.log('  ✓ Success\n');
        
        console.log('✅ caseVersions table updated successfully!\n');
        console.log('You can now start the server.');
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

addEndedAtColumn();
