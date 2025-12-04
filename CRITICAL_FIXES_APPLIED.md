# Critical Fixes Applied - Mines Cashout & Live Balance

## Root Cause Analysis

The main issues preventing cashout and live balance updates from working were:

### 1. **UserId Type Inconsistency** (CRITICAL)
- **Problem**: JWT stored userId as **STRING** (`uid: "${userId}"`)
- **Impact**: Socket rooms used string IDs, but emissions might have type mismatches
- **Solution**: 
  - Convert `req.userId` to **NUMBER** at the start of each endpoint
  - Convert `socket.userId` to **NUMBER** during socket authentication
  - Ensure `emitBalance()` handles both types and converts to string for rooms

### 2. **Socket Listener Lifecycle Issues**
- **Problem**: Socket listeners in `App.jsx` were being removed/re-added repeatedly
- **Impact**: Balance events might be emitted when no listener is active
- **Solution**: 
  - Proper cleanup function in `createEffect`
  - Named functions for handlers to ensure proper removal
  - Don't check `socket.connected` - just check if socket exists

### 3. **Room Join/Leave Consistency**
- **Problem**: Leaving rooms used wrong type (number instead of string)
- **Solution**: Always use `.toString()` when joining/leaving rooms

## Files Modified

### 1. `routes/games/mines/index.js`
**Changes:**
- Convert `req.userId` to `parseInt()` at the start of each endpoint
- Use consistent `userId` variable throughout
- Added detailed logging with type information
- Fixed all database queries to use numeric userId
- Fixed all `emitBalance()` calls to use numeric userId

**Key Lines:**
```javascript
// In each endpoint
const userId = parseInt(req.userId); // Ensure userId is a number
console.log('[MINES] Action from userId:', userId, 'type:', typeof userId);

// In emitBalance calls
emitBalance(userId, 'set', newBalance);
console.log('[MINES] Emitting balance:', { userId, balance, type: typeof userId });
```

### 2. `socketio/index.js`
**Changes:**
- Convert `socket.userId` to number during authentication
- Use `.toString()` when joining/leaving rooms
- Added detailed logging

**Key Lines:**
```javascript
function socketLogin(socket, token) {
    socket.userId = parseInt(valid.uid); // Convert to number
    const roomId = socket.userId.toString(); // String for room
    socket.join(roomId);
    console.log('[SOCKET] User', socket.userId, '(number) joined room:', roomId, '(string)');
}

// When re-authenticating
socket.leave(socket.userId.toString()); // Use string for room operations
```

### 3. `utils/index.js`
**Changes:**
- Enhanced `emitBalance()` to handle both string and number inputs
- Convert to number first, then to string for socket room
- Added logging with input type

**Key Lines:**
```javascript
function emitBalance(userId, type, amount, delay = 0) {
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const userIdStr = userIdNum.toString();
    console.log(`[BALANCE] Emitting to user ${userIdStr}:`, { type, amount, delay, inputType: typeof userId });
    io.to(userIdStr).emit('balance', type, amount, delay);
}
```

### 4. `src/App.jsx`
**Changes:**
- Fixed socket listener lifecycle
- Named handler functions for proper cleanup
- Added cleanup function to `createEffect`
- Removed `socket.connected` check

**Key Lines:**
```javascript
createEffect(() => {
    const socket = ws();
    if (!socket) return;
    
    const handleBalance = (type, amount, delay) => { /* handler */ };
    
    socket.off('balance', handleBalance);
    socket.on('balance', handleBalance);
    
    return () => {
        socket.off('balance', handleBalance);
    };
})
```

### 5. `src/pages/mines.jsx`
**Changes:**
- Removed manual user refetch (rely on socket)
- Fixed notification typo

## How The Flow Works Now

### Game Start
```
1. Frontend: clicks "PLACE BET"
2. Backend: receives POST /mines/start
3. Backend: const userId = parseInt(req.userId) → userId is NUMBER
4. Backend: deducts balance, commits transaction
5. Backend: emitBalance(userId, 'set', newBalance)
6. utils/index.js: converts userId to string → "123"
7. Socket.io: io.to("123").emit('balance', 'set', newBalance)
8. Frontend: socket.on('balance') receives event
9. Frontend: setBalance(newBalance) updates UI immediately
```

### Cashout
```
1. Frontend: clicks "CASHOUT"
2. Backend: receives POST /mines/cashout
3. Backend: const userId = parseInt(req.userId) → userId is NUMBER
4. Backend: calculates payout, adds to balance, commits
5. Backend: emitBalance(userId, 'set', balance)
6. utils/index.js: converts userId to string → "123"
7. Socket.io: io.to("123").emit('balance', 'set', balance)
8. Frontend: socket.on('balance') receives event
9. Frontend: setBalance(balance) updates UI immediately
10. Frontend: shows "YOU WON" popup
```

## Debug Checklist

### Step 1: Verify Socket Connection
**Browser Console:**
```javascript
// Should see:
"Connected to WS"
"[APP] Setting up socket listeners, connected: true, user: 123"
```

**Server Log:**
```
[SOCKET] User 123 (number) joined room: 123 (string)
```

✅ **Success Criteria:**
- Socket connects
- User authenticates
- Joins room with userId as string

---

### Step 2: Verify Game Start
**Server Log:**
```
[MINES] Start game request from userId: 123 type: number
[MINES] Emitting balance after game start: { userId: 123, newBalance: 900, type: 'number' }
[BALANCE] Emitting to user 123: { type: 'set', amount: 900, delay: 0, inputType: 'number' }
```

**Browser Console:**
```javascript
[APP] Balance socket event received: { type: 'set', amount: 900, ... }
[APP] Setting balance to: 900
```

✅ **Success Criteria:**
- Balance decreases by bet amount immediately
- No page refresh needed
- Game board activates

---

### Step 3: Verify Cashout
**Server Log:**
```
[MINES] Cashout endpoint hit by user: 123 type: number
[MINES] Calculated payout: 150 multiplier: 1.5
[MINES] Transaction committed. Balance after: 1050
[MINES] Emitting balance to socket: { userId: 123, balance: 1050, type: 'number' }
[BALANCE] Emitting to user 123: { type: 'set', amount: 1050, ... }
```

**Browser Console:**
```javascript
[MINES FRONTEND] Cashout button clicked
[MINES FRONTEND] Calling /mines/cashout API
[MINES FRONTEND] Cashout response: { success: true, payout: 150, ... }
[MINES FRONTEND] cashoutGame called with: { payout: 150, ... }
[APP] Balance socket event received: { type: 'set', amount: 1050, ... }
[APP] Setting balance to: 1050
```

✅ **Success Criteria:**
- "YOU WON" popup appears
- Balance increases by payout amount immediately
- No page refresh needed

---

## Common Issues & Solutions

### Issue: "Cashout button does nothing"

**Check:**
1. Browser console for errors
2. Network tab for API response
3. Server logs for endpoint hit

**Likely Causes:**
- `isProcessing()` stuck as true
- `game()?.active` is false
- `revealed().length < 1`

**Solution:**
```javascript
// In browser console:
console.log({
    isProcessing: isProcessing(),
    gameActive: game()?.active,
    revealedCount: revealed().length
});
```

---

### Issue: "Balance doesn't update"

**Check Server Logs:**
```
[BALANCE] Emitting to user 123: { type: 'set', amount: 1050, ... }
```

If you see this, emission happened. Check frontend:

**Check Browser Console:**
```javascript
[APP] Balance socket event received: ...
```

If you DON'T see this, socket listener isn't active.

**Solutions:**
1. Refresh page to re-establish socket
2. Check if socket is connected: `ws()?.connected`
3. Check if user is authenticated: `user()?.id`

---

### Issue: "Balance updates but wrong amount"

**Check:**
- Starting balance in database
- Bet amount deducted correctly
- Payout calculated correctly

**Verify Flow:**
```
Start: balance = 1000
Start game (100 bet): balance = 900 ✅
Cashout (150 payout): balance = 1050 ✅
```

---

## Type Safety Verification

Run this in browser console after logging in:

```javascript
// Should log your numeric userId
console.log('User ID:', user()?.id, 'Type:', typeof user()?.id);

// Should log socket info
console.log('Socket connected:', ws()?.connected);
console.log('Socket ID:', ws()?.id);
```

Run this in server terminal to test emission:

```javascript
const io = require('./socketio/server');
const { emitBalance } = require('./utils');

// Test emission (replace 123 with your userId)
emitBalance(123, 'set', 999.99);
```

You should immediately see balance update in browser.

---

## Final Verification Script

Create `test-balance-emission.js` in project root:

```javascript
const io = require('./socketio/server');
const { emitBalance } = require('./utils');

const testUserId = 5185473152; // Replace with your user ID
const testBalance = 123.45;

console.log('Testing balance emission...');
console.log('User ID:', testUserId, 'Type:', typeof testUserId);
console.log('Balance:', testBalance);

emitBalance(testUserId, 'set', testBalance);

console.log('✅ Emission sent! Check browser for balance update.');
```

Run: `node test-balance-emission.js`

If balance updates in browser → Socket system works ✅
If not → Check socket connection, room membership

---

## Success Indicators

When everything works correctly, you'll see:

**Server Logs:**
```
[SOCKET] User 123 (number) joined room: 123 (string)
[MINES] Start game request from userId: 123 type: number
[BALANCE] Emitting to user 123: { type: 'set', amount: 900, ... }
[MINES] Cashout endpoint hit by user: 123 type: number
[BALANCE] Emitting to user 123: { type: 'set', amount: 1050, ... }
```

**Browser Console:**
```
Connected to WS
[APP] Setting up socket listeners, user: 123
[APP] Balance socket event received: { type: 'set', amount: 900 }
[APP] Setting balance to: 900
[MINES FRONTEND] Cashout button clicked
[APP] Balance socket event received: { type: 'set', amount: 1050 }
[APP] Setting balance to: 1050
```

**User Experience:**
- ✅ Balance updates instantly (no refresh)
- ✅ Game starts when button clicked
- ✅ Tiles reveal when clicked
- ✅ Cashout button works
- ✅ "YOU WON" popup shows
- ✅ Balance increases by payout amount

---

## Emergency Rollback

If issues persist, the key files to check are:
1. `routes/games/mines/index.js` - userId conversion
2. `socketio/index.js` - socket authentication
3. `utils/index.js` - emitBalance function
4. `src/App.jsx` - socket listeners

The core fix is ensuring userId types are consistent:
- API endpoints: use `parseInt(req.userId)`
- Socket authentication: use `parseInt(valid.uid)`
- Socket rooms: always use `.toString()` for room IDs
- emitBalance: handle both types, convert to string
