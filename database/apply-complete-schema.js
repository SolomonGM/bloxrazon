const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

async function applyCompleteSchema() {
    console.log('🔧 Applying complete database schema...');
    
    const connection = await mysql.createConnection({
        host: process.env.SQL_HOST || 'localhost',
        user: process.env.SQL_USER || 'root',
        password: process.env.SQL_PASS || '',
        database: process.env.SQL_DB || 'bloxrazon',
        port: process.env.SQL_PORT || 3306,
        ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : false,
        multipleStatements: true
    });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolons and execute each statement
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'USE bloxrazon');

        console.log(`📋 Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.includes('CREATE DATABASE')) continue;
            
            try {
                await connection.execute(statement);
                
                // Extract table name for better logging
                const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i) || 
                                 statement.match(/INSERT IGNORE INTO (\w+)/i);
                if (tableMatch) {
                    console.log(`   ✅ ${tableMatch[1]}`);
                }
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('already exists') && 
                    !err.message.includes('Duplicate')) {
                    console.log(`   ⚠️  ${err.message.substring(0, 100)}`);
                }
            }
        }

        console.log('\n🎉 Complete schema applied successfully!');
        console.log('\n📊 Verifying tables...');
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`\n✅ Total tables in database: ${tables.length}`);
        console.log('\nTables:');
        tables.forEach(row => {
            console.log(`   - ${Object.values(row)[0]}`);
        });

    } catch (error) {
        console.error('❌ Error applying schema:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    applyCompleteSchema()
        .then(() => {
            console.log('\n✅ Schema application completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Schema application failed:', error);
            process.exit(1);
        });
}

module.exports = { applyCompleteSchema };
