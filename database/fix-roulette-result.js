const { sql } = require('./index');

async function fixRouletteResultColumn() {
    console.log('🔧 Fixing roulette result column to allow NULL...\n');
    
    try {
        // Check current column definition
        const [columns] = await sql.query(`
            SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'roulette'
            AND COLUMN_NAME = 'result'
        `);
        
        if (columns.length === 0) {
            console.log('❌ Result column not found in roulette table!');
            return;
        }
        
        const resultCol = columns[0];
        console.log('Current definition:', {
            nullable: resultCol.IS_NULLABLE,
            default: resultCol.COLUMN_DEFAULT,
            type: resultCol.COLUMN_TYPE
        });
        
        if (resultCol.IS_NULLABLE === 'NO') {
            console.log('\n⚠️  Result column does not allow NULL. Fixing...');
            
            // Modify the column to allow NULL
            await sql.query(`
                ALTER TABLE roulette 
                MODIFY COLUMN result INT NULL
            `);
            
            console.log('✅ Result column updated to allow NULL values');
        } else {
            console.log('\n✅ Result column already allows NULL values');
        }
        
        // Also check and fix color column if needed
        const [colorColumns] = await sql.query(`
            SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'roulette'
            AND COLUMN_NAME = 'color'
        `);
        
        if (colorColumns.length > 0) {
            const colorCol = colorColumns[0];
            console.log('\nColor column:', {
                nullable: colorCol.IS_NULLABLE,
                type: colorCol.COLUMN_TYPE
            });
            
            if (!colorCol.COLUMN_TYPE.includes('gold')) {
                console.log('⚠️  Updating color enum to include gold...');
                await sql.query(`
                    ALTER TABLE roulette 
                    MODIFY COLUMN color ENUM('red', 'green', 'gold') NULL
                `);
                console.log('✅ Color enum updated');
            }
        }
        
        console.log('\n🎉 All fixes applied successfully!');
        console.log('\n📝 You can now start the server with: node app.js');
        
    } catch (error) {
        console.error('❌ Error fixing roulette table:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

// Run the fix
fixRouletteResultColumn().catch(console.error);
