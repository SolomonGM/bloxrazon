const { sql } = require('./database');

async function testRoulette() {
    console.log('🎰 Testing Roulette Implementation...\n');
    
    try {
        // 1. Check database structure
        console.log('1️⃣ Checking database structure...');
        
        const [rouletteTables] = await sql.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('roulette', 'rouletteBets')
        `);
        
        if (rouletteTables.length !== 2) {
            console.log('❌ Missing tables! Run: node database/setup-roulette.js');
            return;
        }
        console.log('✅ Tables exist: roulette, rouletteBets');
        
        // 2. Check roulette table structure
        console.log('\n2️⃣ Checking roulette table structure...');
        const [rouletteColumns] = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'roulette'
            ORDER BY ORDINAL_POSITION
        `);
        
        const requiredColumns = ['id', 'roundId', 'result', 'color', 'EOSBlock', 'serverSeed', 'clientSeed', 'rolledAt', 'endedAt', 'createdAt'];
        const existingColumns = rouletteColumns.map(c => c.COLUMN_NAME);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
            console.log('   Run: node database/setup-roulette.js');
            return;
        }
        console.log('✅ All required columns present');
        
        // 3. Check color enum values
        const colorColumn = rouletteColumns.find(c => c.COLUMN_NAME === 'color');
        if (colorColumn && !colorColumn.COLUMN_TYPE.includes('gold')) {
            console.log('⚠️  Color column should include "gold" enum value');
        } else {
            console.log('✅ Color enum includes gold, green, red');
        }
        
        // 4. Check rouletteBets structure
        console.log('\n3️⃣ Checking rouletteBets table structure...');
        const [betColumns] = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'rouletteBets'
            ORDER BY ORDINAL_POSITION
        `);
        
        const requiredBetColumns = ['id', 'roundId', 'userId', 'amount', 'color', 'payout', 'createdAt'];
        const existingBetColumns = betColumns.map(c => c.COLUMN_NAME);
        const missingBetColumns = requiredBetColumns.filter(col => !existingBetColumns.includes(col));
        
        if (missingBetColumns.length > 0) {
            console.log(`❌ Missing columns: ${missingBetColumns.join(', ')}`);
            return;
        }
        console.log('✅ All required bet columns present');
        
        // 5. Check foreign keys
        console.log('\n4️⃣ Checking foreign key constraints...');
        const [fks] = await sql.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'rouletteBets'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        const hasRouletteFk = fks.some(fk => fk.REFERENCED_TABLE_NAME === 'roulette');
        const hasUserFk = fks.some(fk => fk.REFERENCED_TABLE_NAME === 'users');
        
        if (!hasRouletteFk) {
            console.log('❌ Missing foreign key to roulette table');
        } else {
            console.log('✅ Foreign key to roulette exists');
        }
        
        if (!hasUserFk) {
            console.log('❌ Missing foreign key to users table');
        } else {
            console.log('✅ Foreign key to users exists');
        }
        
        // 6. Check features table
        console.log('\n5️⃣ Checking features configuration...');
        const [[feature]] = await sql.query('SELECT * FROM features WHERE name = ?', ['roulette']);
        
        if (!feature) {
            console.log('❌ Roulette not in features table');
            console.log('   Add with: INSERT INTO features (name, enabled) VALUES ("roulette", 1)');
        } else if (feature.enabled) {
            console.log('✅ Roulette is enabled');
        } else {
            console.log('⚠️  Roulette is disabled');
            console.log('   Enable with: UPDATE features SET enabled = 1 WHERE name = "roulette"');
        }
        
        // 7. Check for existing rounds
        console.log('\n6️⃣ Checking existing roulette data...');
        const [[roundCount]] = await sql.query('SELECT COUNT(*) as count FROM roulette');
        const [[betCount]] = await sql.query('SELECT COUNT(*) as count FROM rouletteBets');
        const [[activeRound]] = await sql.query('SELECT COUNT(*) as count FROM roulette WHERE endedAt IS NULL');
        
        console.log(`   Total rounds: ${roundCount.count}`);
        console.log(`   Total bets: ${betCount.count}`);
        console.log(`   Active rounds: ${activeRound.count}`);
        
        // 8. Test file existence
        console.log('\n7️⃣ Checking backend files...');
        const fs = require('fs');
        const path = require('path');
        
        const requiredFiles = [
            'routes/games/roulette/index.js',
            'routes/games/roulette/functions.js',
            'src/pages/roulette.jsx',
            'src/components/Roulette/roulettecolor.jsx',
            'src/components/Roulette/roulettespinner.jsx',
            'src/components/Roulette/betcontrols.jsx',
            'src/util/roulettehelpers.jsx'
        ];
        
        let allFilesExist = true;
        for (const file of requiredFiles) {
            const exists = fs.existsSync(path.join(__dirname, file));
            if (!exists) {
                console.log(`❌ Missing: ${file}`);
                allFilesExist = false;
            }
        }
        
        if (allFilesExist) {
            console.log('✅ All required files present');
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        
        if (missingColumns.length === 0 && 
            missingBetColumns.length === 0 && 
            hasRouletteFk && 
            hasUserFk && 
            feature && 
            feature.enabled &&
            allFilesExist) {
            console.log('✅ All tests passed! Roulette is ready to use.');
            console.log('\n🚀 To start the server:');
            console.log('   1. Make sure both servers are running:');
            console.log('      - Backend: node app.js');
            console.log('      - Frontend: npm run dev');
            console.log('   2. Navigate to http://localhost:5173/roulette');
        } else {
            console.log('⚠️  Some issues found. Please fix them before using roulette.');
            if (missingColumns.length > 0 || missingBetColumns.length > 0) {
                console.log('\n🔧 Run: node database/setup-roulette.js');
            }
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

// Run the test
testRoulette().catch(console.error);
