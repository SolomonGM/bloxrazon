// Test Balance Emission Script
// Run with: node test-balance-direct.js

const io = require('./socketio/server');

// Replace with your actual user ID
const TEST_USER_ID = 5185473152;
const TEST_BALANCE = 999.99;

console.log('\n=== Testing Direct Balance Emission ===\n');
console.log('User ID:', TEST_USER_ID);
console.log('User ID Type:', typeof TEST_USER_ID);
console.log('Test Balance:', TEST_BALANCE);
console.log('\nEmitting balance update...\n');

// Convert userId to string for room (matching emitBalance logic)
const userIdNum = typeof TEST_USER_ID === 'string' ? parseInt(TEST_USER_ID) : TEST_USER_ID;
const userIdStr = userIdNum.toString();

console.log('Room ID:', userIdStr);
console.log('Room ID Type:', typeof userIdStr);

// Emit to user's room
io.to(userIdStr).emit('balance', 'set', TEST_BALANCE, 0);

console.log('\n✅ Balance emission sent!');
console.log('Check your browser - balance should now be:', TEST_BALANCE);
console.log('\nIf balance updated → Socket system works correctly ✅');
console.log('If not → Check:');
console.log('  1. Is user logged in?');
console.log('  2. Is socket connected? (check browser console)');
console.log('  3. Did user join room? (check server logs for "joined room")');
console.log('  4. Is balance listener active? (check browser console)\n');
