const { sql } = require('./index');

async function updateCoinflipSchema() {
    console.log('Updating coinflip table schema...\n');

    try {
        // Check if creatorId column exists and remove it (deprecated)
        const [creatorIdCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'creatorId'
        `);

        if (creatorIdCheck.length > 0) {
            console.log('Removing deprecated creatorId column...');
            // First remove foreign key if exists
            try {
                const [fks] = await sql.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'coinflips' 
                    AND COLUMN_NAME = 'creatorId'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                `);
                for (const fk of fks) {
                    await sql.query(`ALTER TABLE coinflips DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                }
            } catch (e) {}
            
            await sql.query(`ALTER TABLE coinflips DROP COLUMN creatorId`);
            console.log('✓ creatorId column removed\n');
        } else {
            console.log('✓ creatorId column does not exist (good)\n');
        }

        // Check if ownerId column exists
        const [ownerIdCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'ownerId'
        `);

        if (ownerIdCheck.length === 0) {
            console.log('Adding ownerId column...');
            try {
                await sql.query(`ALTER TABLE coinflips ADD COLUMN ownerId INT NOT NULL AFTER id`);
                await sql.query(`ALTER TABLE coinflips ADD CONSTRAINT fk_coinflips_owner FOREIGN KEY (ownerId) REFERENCES users(id)`);
                console.log('✓ ownerId column added with foreign key\n');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✓ ownerId column already exists\n');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('✓ ownerId column already exists\n');
        }

        // Check if startedAt column exists
        const [startedAtCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'startedAt'
        `);

        if (startedAtCheck.length === 0) {
            console.log('Adding startedAt column...');
            try {
                await sql.query(`ALTER TABLE coinflips ADD COLUMN startedAt TIMESTAMP NULL AFTER serverSeed`);
                console.log('✓ startedAt column added\n');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✓ startedAt column already exists\n');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('✓ startedAt column already exists\n');
        }

        console.log('✅ Coinflip schema update completed successfully!');
        await sql.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error updating coinflip schema:', error.message);
        if (error.code) console.error('Error code:', error.code);
        await sql.end();
        process.exit(1);
    }
}

updateCoinflipSchema();
