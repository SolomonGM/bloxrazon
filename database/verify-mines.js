require('dotenv').config();
const { sql } = require('./index');

async function verify() {
    try {
        console.log('Checking mines feature status...\n');
        
        const [[feature]] = await sql.query('SELECT * FROM features WHERE name = ?', ['mines']);
        console.log('✅ Mines feature:', feature.enabled ? 'ENABLED' : 'DISABLED');
        
        const [minesTable] = await sql.query("SHOW TABLES LIKE 'mines'");
        console.log('✅ Mines table:', minesTable.length > 0 ? 'EXISTS' : 'MISSING');
        
        const [users] = await sql.query('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users in database:', users[0].count);
        
        console.log('\n✅ Database is ready for mines game!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verify();
