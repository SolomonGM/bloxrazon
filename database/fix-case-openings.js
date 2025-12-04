require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

async function fixCaseOpenings() {
    console.log('🔧 Creating missing caseOpenings table...\n');
    
    try {
        console.log('[1/2] Creating caseOpenings table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS caseOpenings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                caseVersionId INT NOT NULL,
                rollId INT NOT NULL,
                caseItemId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id),
                FOREIGN KEY (caseItemId) REFERENCES caseItems(id)
            )
        `);
        console.log('  ✓ Success\n');
        
        console.log('[2/2] Verifying table structure...');
        const [columns] = await sql.query('SHOW COLUMNS FROM caseOpenings');
        console.log('  Columns:');
        columns.forEach(col => {
            console.log(`    - ${col.Field} (${col.Type})`);
        });
        console.log('  ✓ Success\n');
        
        console.log('✅ caseOpenings table created successfully!\n');
        console.log('You can now start the server.');
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

fixCaseOpenings();
