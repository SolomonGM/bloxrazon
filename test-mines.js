require('dotenv').config();
const { generateMinePositions, calculateMultiplier } = require('./routes/games/mines/functions');

console.log('Testing Mines Game Functions\n');

// Test 1: Mine Generation
console.log('Test 1: Generating mines');
const serverSeed = 'test-server-seed';
const clientSeed = 'test-client-seed';
const nonce = 1;
const mineCount = 3;

const mines = generateMinePositions(serverSeed, clientSeed, nonce, mineCount);
console.log(`Generated ${mines.length} mine positions:`, mines);
console.log(`Are they unique? ${mines.length === new Set(mines).size}`);
console.log(`Are they in valid range (0-24)? ${mines.every(m => m >= 0 && m <= 24)}`);

// Test 2: Multiplier Calculation
console.log('\nTest 2: Multiplier calculations with 3 mines');
for (let revealed = 1; revealed <= 10; revealed++) {
    const mult = calculateMultiplier(3, revealed);
    console.log(`Tiles revealed: ${revealed}, Multiplier: ${mult}x`);
}

// Test 3: High mine count
console.log('\nTest 3: Generating 10 mines');
const mines10 = generateMinePositions(serverSeed, clientSeed, 2, 10);
console.log(`Generated ${mines10.length} mine positions:`, mines10);

// Test 4: Edge case - 24 mines (max)
console.log('\nTest 4: Generating 24 mines (max)');
const mines24 = generateMinePositions(serverSeed, clientSeed, 3, 24);
console.log(`Generated ${mines24.length} mine positions`);
console.log(`First win multiplier:`, calculateMultiplier(24, 1));

console.log('\n✅ All tests completed!');
process.exit(0);
