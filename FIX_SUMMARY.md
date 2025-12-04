# MINES & BALANCE FIX - FINAL SUMMARY

## What Was Fixed

### 🔴 CRITICAL ISSUE: UserId Type Mismatch

**The Problem:**
- JWT authentication stores userId as **STRING**: `uid: "${userId}"`
- Socket rooms require **STRING** IDs
- But there was inconsistency between string/number types
- This caused socket emissions to fail because room IDs didn't match

**The Fix:**
1. **API Endpoints** → Convert `req.userId` to **NUMBER**  
   ```javascript
   const userId = parseInt(req.userId);
   ```

2. **Socket Auth** → Convert `socket.userId` to **NUMBER**
   ```javascript
   socket.userId = parseInt(valid.uid);
   ```

3. **Socket Rooms** → Always use **STRING** for room operations
   ```javascript
   socket.join(socket.userId.toString());
   ```

4. **emitBalance** → Handle both types, convert to string
   ```javascript
   const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
   const userIdStr = userIdNum.toString();
   io.to(userIdStr).emit('balance', type, amount, delay);
   ```

### 🟡 ISSUE: Socket Listener Lifecycle

**The Problem:**
- Listeners were being added/removed repeatedly
- Race condition: emission happens when listener is removed
- No proper cleanup function

**The Fix:**
- Named handler functions for proper removal
- Cleanup function in `createEffect`
- Remove `socket.connected` check

### 🟡 ISSUE: Balance Deduction Timing

**The Problem:**
- Balance was deducted at wrong times
- Double deduction on cashout

**The Fix:**
- Deduct balance **once** at game start
- Cashout only **adds payout**
- Mine hit doesn't deduct (already deducted)

## Files Changed

### Backend
1. ✅ `routes/games/mines/index.js` - userId conversion, balance logic
2. ✅ `socketio/index.js` - Socket authentication, room joining
3. ✅ `utils/index.js` - emitBalance type handling

### Frontend
4. ✅ `src/App.jsx` - Socket listener lifecycle
5. ✅ `src/pages/mines.jsx` - Remove manual refetch

## How to Test

### 1. Check Socket Connection
**Browser Console:**
```
Connected to WS
[APP] Setting up socket listeners, user: 123
```

**Server Terminal:**
```
[SOCKET] User 123 (number) joined room: 123 (string)
```

### 2. Test Game Start
1. Navigate to `/mines`
2. Set bet to 100
3. Click "PLACE BET"
4. **Expected:** Balance decreases by 100 immediately

**Server Log:**
```
[MINES] Start game request from userId: 123 type: number
[BALANCE] Emitting to user 123: { type: 'set', amount: 900 }
```

**Browser Console:**
```
[APP] Balance socket event received: { type: 'set', amount: 900 }
[APP] Setting balance to: 900
```

### 3. Test Cashout
1. Reveal at least 1 tile
2. Click "CASHOUT"
3. **Expected:** 
   - "YOU WON" popup appears
   - Balance increases by payout immediately

**Server Log:**
```
[MINES] Cashout endpoint hit by user: 123 type: number
[MINES] Calculated payout: 150 multiplier: 1.5
[BALANCE] Emitting to user 123: { type: 'set', amount: 1050 }
```

**Browser Console:**
```
[MINES FRONTEND] Cashout button clicked
[APP] Balance socket event received: { type: 'set', amount: 1050 }
[APP] Setting balance to: 1050
```

### 4. Direct Test (Server-Side)
```bash
# Edit test-balance-direct.js with your userId
# Replace TEST_USER_ID = 5185473152 with your actual ID

node test-balance-direct.js
```

Check browser - balance should update immediately.

## Troubleshooting

### ❌ "Cashout button does nothing"

**Check browser console:**
```javascript
console.log({
  isProcessing: isProcessing(),
  gameActive: game()?.active,
  revealedCount: revealed().length
});
```

**Common causes:**
- Need at least 1 revealed tile
- Game not active
- isProcessing stuck as true

**Solution:** Refresh page, start new game

---

### ❌ "Balance doesn't update"

**Check if emission happens (server log):**
```
[BALANCE] Emitting to user 123: { type: 'set', amount: 1050 }
```

If YES → Check frontend:
```javascript
// Browser console - should see:
[APP] Balance socket event received: ...
```

If NO → Socket listener not active:
1. Check socket connected: `ws()?.connected`
2. Refresh page
3. Check network tab for WebSocket connection

**Check room membership:**
```
[SOCKET] User 123 (number) joined room: 123 (string)
```

If userId and room don't match → Problem is in socket auth

---

### ❌ "Wrong balance amount"

**Verify flow:**
```
Initial:  balance = 1000
Start:    balance = 900  (deducted 100)
Cashout:  balance = 1050 (added 150 payout)
```

**Check database:**
```sql
SELECT balance FROM users WHERE id = 123;
```

Should match what's shown in UI.

---

## Quick Reference

### Server Logs to Watch For
```
✅ [SOCKET] User 123 (number) joined room: 123 (string)
✅ [MINES] Start game request from userId: 123 type: number
✅ [BALANCE] Emitting to user 123: { type: 'set', amount: X }
✅ [MINES] Cashout endpoint hit by user: 123 type: number
```

### Browser Console to Watch For
```
✅ Connected to WS
✅ [APP] Setting up socket listeners, user: 123
✅ [APP] Balance socket event received: { type: 'set', amount: X }
✅ [APP] Setting balance to: X
```

### What Should Work Now
- ✅ Mines game start (balance decreases)
- ✅ Mines cashout (balance increases, popup shows)
- ✅ Mine hit/loss (game ends correctly)
- ✅ Auto-cashout (all tiles revealed)
- ✅ Live balance updates (no refresh needed)
- ✅ Multiple tabs synchronized
- ✅ All reward claims update balance live
- ✅ Survey completions update balance live
- ✅ All game wins/losses update balance live

### UserId Type Reference
```
JWT:           string  "123"
req.userId:    string  "123" → parseInt() → number 123
socket.userId: number  123
Room ID:       string  "123" (via .toString())
Database:      number  123
emitBalance:   accepts both → converts to string for room
```

## If Still Not Working

1. **Clear browser cache and cookies**
2. **Restart server**
3. **Check .env file for correct JWT_SECRET**
4. **Verify database connection**
5. **Check firewall/CORS settings**
6. **Test with `test-balance-direct.js`**

If direct test works but game doesn't:
- Problem is in game logic, not socket system

If direct test doesn't work:
- Problem is in socket connection/authentication

## Success Indicators

When everything works:
- No console errors
- Balance updates without refresh
- Cashout button responds
- "YOU WON" popup appears
- Server logs show emissions
- Browser logs show receptions
- Multiple tabs stay synced

## Notes

- The core fix was ensuring userId types are consistent throughout the flow
- Socket rooms MUST use string IDs
- Database queries work with number IDs
- emitBalance now handles both types gracefully
- All other games (blackjack, roulette, etc.) should also benefit from this fix
- The emitBalance function is used globally, so all balance updates should work

## Technical Details

**Why parseInt()?**
- JWT stores userId as string for consistency
- Database stores userId as INT
- Socket rooms require string IDs
- By converting req.userId to number in API endpoints, we ensure:
  - Correct database queries (number matches INT)
  - Consistent variable types
  - Proper logging with type information
  - emitBalance receives predictable input

**Why socket.userId as number?**
- Consistency with API endpoints
- Easier debugging (types match)
- toString() converts to string when needed
- Room operations explicitly use string

**Why not store as string everywhere?**
- Database expects INT, not VARCHAR
- Number comparisons are faster
- Easier arithmetic operations
- Industry standard for user IDs
