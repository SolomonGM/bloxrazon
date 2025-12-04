require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

async function seedCases() {
    console.log('Starting case seeding...\n');

    const cases = require('../utils/cases.json');
    
    const connection = await sql.getConnection();
    
    try {
        await connection.beginTransaction();

        for (let i = 0; i < cases.length; i++) {
            const caseInfo = cases[i];
            const slug = slugify(caseInfo.name);

            console.log(`[${i + 1}/${cases.length}] Processing: ${caseInfo.name} (${slug})`);

            // Check if case already exists
            const [[existingCase]] = await connection.query('SELECT id FROM cases WHERE slug = ?', [slug]);

            let caseId;

            if (existingCase) {
                console.log(`  ↳ Case exists, using ID: ${existingCase.id}`);
                caseId = existingCase.id;
            } else {
                // Insert new case (CORRECT SCHEMA - no price in cases table)
                console.log(`  ↳ Inserting new case...`);
                const [caseResult] = await connection.query(
                    'INSERT INTO cases (name, slug, img) VALUES (?, ?, ?)',
                    [caseInfo.name, slug, `/public/cases/${slug}.png`]
                );
                caseId = caseResult.insertId;
                console.log(`  ↳ Created case with ID: ${caseId}`);
            }

            // Insert new version
            const [versionResult] = await connection.query(
                'INSERT INTO caseVersions (caseId, price) VALUES (?, ?)',
                [caseId, caseInfo.price]
            );
            const versionId = versionResult.insertId;
            console.log(`  ↳ Created version ID: ${versionId} with price: ${caseInfo.price}`);

            // Insert items
            console.log(`  ↳ Inserting ${caseInfo.items.length} items...`);
            for (let j = 0; j < caseInfo.items.length; j++) {
                const item = caseInfo.items[j];
                
                await connection.query(
                    'INSERT INTO caseItems (caseVersionId, robloxId, name, img, price, rangeFrom, rangeTo) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [versionId, item.id, item.name, item.img || null, item.price, item.rangeFrom, item.rangeTo]
                );
            }
            console.log(`  ↳ ✓ All items inserted\n`);
        }

        await connection.commit();
        console.log('\n✅ Successfully seeded all cases!');
        console.log(`Total cases: ${cases.length}`);
        
        // Verify
        const [[count]] = await connection.query('SELECT COUNT(*) as count FROM cases');
        const [[versionCount]] = await connection.query('SELECT COUNT(*) as count FROM caseVersions');
        const [[itemCount]] = await connection.query('SELECT COUNT(*) as count FROM caseItems');
        
        console.log(`\nDatabase stats:`);
        console.log(`  Cases: ${count.count}`);
        console.log(`  Versions: ${versionCount.count}`);
        console.log(`  Items: ${itemCount.count}`);
        
    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Error seeding cases:', error);
        throw error;
    } finally {
        connection.release();
        await sql.end();
    }
}

// Run seeding
seedCases().catch(console.error);
