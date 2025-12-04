const { sql } = require('./index');

async function fixRakebackClaimsType() {
    try {
        console.log('Fixing rakebackClaims table type column...');

        // Check if table exists
        const [tables] = await sql.query("SHOW TABLES LIKE 'rakebackClaims'");
        
        if (tables.length === 0) {
            console.log('Table does not exist. Creating it...');
            await sql.query(`
                CREATE TABLE rakebackClaims (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id),
                    INDEX idx_user_type (userId, type),
                    INDEX idx_user_created (userId, createdAt)
                )
            `);
            console.log('✓ Successfully created rakebackClaims table');
        } else {
            console.log('Table exists. Modifying type column...');
            
            // Modify the type column to be ENUM
            await sql.query(`
                ALTER TABLE rakebackClaims 
                MODIFY COLUMN type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL
            `);
            
            console.log('✓ Successfully modified type column to ENUM');
            
            // Try to add indexes (ignore errors if they already exist)
            try {
                await sql.query('ALTER TABLE rakebackClaims ADD INDEX idx_user_type (userId, type)');
                console.log('✓ Added idx_user_type index');
            } catch (e) {
                if (e.code === 'ER_DUP_KEYNAME') {
                    console.log('  Index idx_user_type already exists');
                } else {
                    console.log('  Could not add idx_user_type:', e.message);
                }
            }
            
            try {
                await sql.query('ALTER TABLE rakebackClaims ADD INDEX idx_user_created (userId, createdAt)');
                console.log('✓ Added idx_user_created index');
            } catch (e) {
                if (e.code === 'ER_DUP_KEYNAME') {
                    console.log('  Index idx_user_created already exists');
                } else {
                    console.log('  Could not add idx_user_created:', e.message);
                }
            }
        }

        console.log('\n✓ Rakeback claims table is now ready!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing rakebackClaims table:', error);
        process.exit(1);
    }
}

fixRakebackClaimsType();
