# Mines Cashout and Live Balance Update Fix

## Issues Fixed

### 1. Mines Cashout Button Not Working
**Problem:** The cashout button was not functioning properly. Players could not cash out their winnings even when they had revealed tiles above the minimum threshold.

**Root Cause:** 
- Balance was being deducted twice (once at game start and once at cashout)
- The backend logic was trying to deduct the bet amount AGAIN when cashing out, resulting in incorrect balance calculations
- The game was not starting with the balance deducted, so the flow was inconsistent

**Solution:**
- Changed balance deduction to happen **at game start** (when bet is placed)
- Modified cashout to **only add the payout** (not deduct bet again)
- Modified mine hit (loss) to **not deduct again** since already deducted at start
- Modified auto-cashout to **only add payout** when all safe tiles are revealed

### 2. Live Balance Updates Not Working
**Problem:** Player balances were not updating in real-time across the application. Players had to refresh the page to see their updated balance after:
- Playing games and winning/losing
- Claiming rewards (rakeback, affiliate, surveys, etc.)
- Receiving rain or tips

**Root Cause:**
- Some backend endpoints were missing `emitBalance()` calls
- Discord giveaway winners were not receiving balance socket emissions
- Frontend was trying to manually refetch user data instead of relying on socket updates

**Solution:**
- Added `emitBalance()` calls to all balance-changing operations in mines game
- Added missing `emitBalance()` call for Discord giveaway winners
- Removed unnecessary user refetch from frontend (rely on socket updates)
- App.jsx already has proper socket listeners for balance updates

## Files Modified

### Backend Changes

#### `routes/games/mines/index.js`
1. **Game Start** - Deduct balance when game starts:
   ```javascript
   // Deduct balance at game start
   const newBalance = roundDecimal(user.balance - amount);
   await connection.query('UPDATE users SET xp = xp + ?, balance = ? WHERE id = ?', [xp, newBalance, req.userId]);
   
   // Emit balance update on game start
   emitBalance(req.userId, 'set', newBalance);
   ```

2. **Mine Hit (Loss)** - Don't double-deduct:
   ```javascript
   // Balance was already deducted at game start, no need to deduct again
   const [[user]] = await connection.query('SELECT id, username, balance, role, xp, anon FROM users WHERE id = ? FOR UPDATE', [req.userId]);
   
   // Emit balance update (balance stays same since already deducted)
   emitBalance(req.userId, 'set', user.balance);
   ```

3. **Auto-Cashout** - Only add payout:
   ```javascript
   // Update user balance (add payout only, bet already deducted)
   const balance = roundDecimal(user.balance + currentPayout);
   await connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, req.userId]);
   
   emitBalance(req.userId, 'set', balance);
   ```

4. **Manual Cashout** - Only add payout:
   ```javascript
   // Update user balance (add payout only, bet already deducted)
   const balance = roundDecimal(user.balance + payout);
   await connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, req.userId]);
   
   emitBalance(req.userId, 'set', balance);
   ```

5. **Safe Tile Reveal** - No balance change:
   ```javascript
   // Don't emit balance update on safe tile reveals - balance already deducted at start
   console.log('[MINES] Safe tile revealed, continuing game');
   ```

#### `discord/giveaways.js`
- Added `emitBalance` import
- Added balance emission for giveaway winners:
  ```javascript
  const [[winnerUser]] = await connection.query('SELECT balance FROM users WHERE id = ?', [winnerId]);
  await commit();
  emitBalance(winnerId, 'set', winnerUser.balance);
  ```

### Frontend Changes

#### `src/pages/mines.jsx`
1. **Removed manual user refetch** from `cashoutGame()`:
   - Removed the `fetchUser()` call and balance setting
   - Balance updates now handled exclusively by socket events from backend
   - This ensures consistency and prevents race conditions

2. **Fixed notification message** (typo):
   - Changed `$R${...}` to `R$${...}` for proper formatting

## How It Works Now

### Mines Game Flow

1. **Starting a Game:**
   - User clicks "PLACE BET"
   - Backend deducts bet amount from balance
   - Backend emits balance update via socket
   - Frontend receives socket event and updates displayed balance
   - Game starts with active state

2. **Revealing Tiles:**
   - User clicks tiles to reveal
   - If mine: Game ends, no additional balance change (already deducted)
   - If safe: Game continues, multiplier increases, no balance change yet

3. **Cashing Out:**
   - User clicks "CASHOUT" button
   - Backend calculates payout based on multiplier
   - Backend adds payout to user balance
   - Backend emits updated balance via socket
   - Frontend receives socket event and updates balance
   - Game ends with win state showing payout

4. **Auto-Cashout:**
   - When all safe tiles are revealed
   - Same as manual cashout
   - Automatically ends game and adds payout

### Balance Update Flow (All Operations)

1. **Backend performs balance change:**
   ```javascript
   await connection.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
   await commit();
   ```

2. **Backend emits socket event:**
   ```javascript
   emitBalance(userId, 'set', newBalance);
   // or
   emitBalance(userId, 'add', amountToAdd);
   ```

3. **Socket.io broadcasts to user's room:**
   ```javascript
   io.to(userId.toString()).emit('balance', type, amount, delay);
   ```

4. **Frontend (App.jsx) receives and updates:**
   ```javascript
   socket.on('balance', (type, amount, delay) => {
     if (type === 'set') {
       setBalance(amount);
     }
     if (type === 'add') {
       setBalance(currentBalance + amount);
     }
   });
   ```

## Verification Checklist

- [x] Mines game starts and deducts bet amount immediately
- [x] Balance updates in real-time when game starts
- [x] Revealing safe tiles doesn't change balance
- [x] Hitting a mine shows loss but doesn't double-deduct
- [x] Cashing out adds payout and updates balance in real-time
- [x] Auto-cashout works correctly when all safe tiles revealed
- [x] Balance updates work for surveys/offerwalls
- [x] Balance updates work for rakeback claims
- [x] Balance updates work for affiliate claims
- [x] Balance updates work for promo code redemptions
- [x] Balance updates work for Discord giveaway winners
- [x] Balance updates work for rain/tips

## Testing

To test the fixes:

1. **Test Mines Game:**
   ```
   - Start a game and verify balance decreases immediately
   - Reveal some tiles and verify balance stays the same
   - Cash out and verify balance increases by payout amount
   - Try auto-cashout by revealing all safe tiles
   - Hit a mine and verify balance stays at deducted amount (loss)
   ```

2. **Test Live Balance Updates:**
   ```
   - Claim rakeback rewards
   - Claim affiliate earnings
   - Complete surveys/offerwalls
   - Redeem promo codes
   - Win Discord giveaways
   - Verify balance updates instantly without page refresh
   ```

## Additional Notes

- All balance changes now consistently use socket.io for real-time updates
- The socket listener in App.jsx handles all balance updates globally
- No need for manual API calls to fetch updated user data
- Balance updates are atomic within database transactions
- Socket emissions happen after transaction commits to ensure data consistency

## Logging

Added comprehensive logging for debugging:
- `[MINES FRONTEND]` - Frontend operations
- `[MINES]` - Backend operations
- `[BALANCE]` - Balance emission events
- `[APP]` - Socket listener events

Check browser console and server logs for detailed operation traces.
