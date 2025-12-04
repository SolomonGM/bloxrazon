const { sql } = require('./index');

async function addRakebackClaimsTable() {
    try {
        console.log('Creating rakebackClaims table...');

        await sql.query(`
            CREATE TABLE IF NOT EXISTS rakebackClaims (
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
        
        // Check if there's an old rakeback table structure
        const [tables] = await sql.query("SHOW TABLES LIKE 'rakeback'");
        if (tables.length > 0) {
            console.log('Note: Old "rakeback" table still exists. This migration adds the new "rakebackClaims" table.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating rakebackClaims table:', error);
        process.exit(1);
    }
}

addRakebackClaimsTable();
