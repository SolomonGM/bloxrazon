// Test if socket.io balance emissions are working
require('dotenv').config();
const io = require('../socketio/server');

// Simulate sending a balance update after 2 seconds
setTimeout(() => {
    const testUserId = 1; // Change this to your actual user ID
    const testBalance = 12345.67;
    
    console.log(`\n🧪 Testing Socket.IO balance emission...`);
    console.log(`User ID: ${testUserId}`);
    console.log(`Test Balance: ${testBalance}`);
    console.log(`Emitting to room: ${testUserId}\n`);
    
    io.to(testUserId).emit('balance', 'set', testBalance);
    
    console.log('✅ Balance emission sent!');
    console.log('Check your browser console for: [APP] Balance socket event received');
    console.log('\nIf you see the log in browser console, socket.io is working correctly.\n');
    
}, 2000);

console.log('⏳ Waiting 2 seconds before sending test emission...');
console.log('Make sure:');
console.log('  1. Backend server is running');
console.log('  2. Frontend is open in browser');
console.log('  3. You are logged in');
console.log('  4. Browser console is open to see the logs\n');
