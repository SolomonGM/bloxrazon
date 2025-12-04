require('dotenv').config({ path: '.env.production' });
const { sql } = require('./index');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🔧 Starting database migration for cases schema...\n');
    
    try {
        // Disable foreign key checks
        console.log('[1/9] Disabling foreign key checks...');
        await sql.query('SET FOREIGN_KEY_CHECKS=0');
        console.log('  ✓ Success\n');
        
        // Drop tables
        const tablesToDrop = ['caseOpenings', 'caseItems', 'caseVersions', 'cases'];
        for (let i = 0; i < tablesToDrop.length; i++) {
            const table = tablesToDrop[i];
            console.log(`[${i + 2}/9] Dropping table: ${table}...`);
            try {
                await sql.query(`DROP TABLE IF EXISTS ${table}`);
                console.log('  ✓ Success\n');
            } catch (err) {
                console.log(`  ℹ Already dropped\n`);
            }
        }
        
        // Create tables
        console.log('[6/9] Creating cases table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS cases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                img VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✓ Success\n');
        
        console.log('[7/9] Creating caseVersions table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS caseVersions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                caseId INT NOT NULL,
                price DECIMAL(15,2) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (caseId) REFERENCES cases(id)
            )
        `);
        console.log('  ✓ Success\n');
        
        console.log('[8/9] Creating caseItems table...');
        await sql.query(`
            CREATE TABLE IF NOT EXISTS caseItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                caseVersionId INT NOT NULL,
                robloxId VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                img VARCHAR(255),
                price DECIMAL(15,2) NOT NULL,
                rangeFrom INT NOT NULL,
                rangeTo INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id)
            )
        `);
        console.log('  ✓ Success\n');
        
        console.log('[9/9] Re-enabling foreign key checks...');
        await sql.query('SET FOREIGN_KEY_CHECKS=1');
        console.log('  ✓ Success\n');
        
        console.log('✅ Migration completed successfully!\n');
        console.log('Next step: Run the seeding script');
        console.log('  node database/seed-cases.js\n');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await sql.end();
    }
}

runMigration();
