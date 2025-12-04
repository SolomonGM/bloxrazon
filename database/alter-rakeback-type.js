const { sql } = require('./index');

async function alterRakebackClaimsType() {
    try {
        console.log('Altering rakebackClaims type column...');

        await sql.query(`
            ALTER TABLE rakebackClaims 
            MODIFY COLUMN type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL
        `);

        console.log('✓ Successfully altered type column to ENUM');
        
        // Verify the change
        const [columns] = await sql.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'rakebackClaims' 
            AND COLUMN_NAME = 'type'
        `);
        
        console.log('\nColumn info:', columns[0]);
        console.log('\n✓ Fix complete! You can now claim rakebacks without errors.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error altering rakebackClaims table:', error);
        console.error('\nMake sure your backend server is running with: npm run backend');
        process.exit(1);
    }
}

alterRakebackClaimsType();
