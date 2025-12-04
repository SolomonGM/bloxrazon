const { sql } = require('./index');

async function addDeletedColumn() {
    try {
        // Check if column exists
        const [columns] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'notifications' 
            AND COLUMN_NAME = 'deleted'
        `);

        if (columns.length > 0) {
            console.log('✅ Column "deleted" already exists in notifications table');
        } else {
            await sql.query('ALTER TABLE notifications ADD COLUMN deleted BOOLEAN DEFAULT FALSE');
            console.log('✅ Successfully added "deleted" column to notifications table');
        }
        
        await sql.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding deleted column:', error);
        await sql.end();
        process.exit(1);
    }
}

addDeletedColumn();
