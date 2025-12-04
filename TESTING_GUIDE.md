# Testing Guide - Mines & Live Balance Updates

## Prerequisites
1. Server is running
2. Database is connected
3. User account with sufficient balance (at least 100 R$)

## Test 1: Mines Game - Start and Balance Deduction

**Steps:**
1. Navigate to `/mines` page
2. Check current balance in wallet (top right)
3. Set bet amount to 100 R$
4. Select 3 mines
5. Click "PLACE BET"

**Expected Result:**
- ✅ Balance decreases by 100 R$ immediately (no page refresh needed)
- ✅ Game board becomes active
- ✅ Bet interface is disabled
- ✅ Current multiplier shows 1.00x
- ✅ Current payout shows 100 R$

**Check Logs:**
```
[MINES FRONTEND] Starting new game...
[MINES] Started game with 3 mines...
[MINES] Emitting balance after game start: { userId: XXX, newBalance: YYY }
[APP] Balance socket event received: { type: 'set', amount: YYY }
[APP] Setting balance to: YYY
```

---

## Test 2: Mines Game - Reveal Safe Tiles

**Steps:**
1. Continue from Test 1 (game active)
2. Click on a tile
3. Wait for animation
4. Observe balance

**Expected Result:**
- ✅ Tile reveals as gem (green)
- ✅ Multiplier increases
- ✅ Current payout increases
- ✅ Balance remains the same (already deducted)

**Check Logs:**
```
[MINES] Tile X revealed. Total revealed: Y, Mines: 3, Multiplier: Z.ZZx
[MINES] Safe tile revealed, continuing game
[MINES FRONTEND] Updating revealed tiles...
```

---

## Test 3: Mines Game - Successful Cashout

**Steps:**
1. Continue from Test 2 (reveal at least 1 tile)
2. Note current balance and payout amount
3. Click "CASHOUT" button
4. Wait for response

**Expected Result:**
- ✅ Balance increases by payout amount immediately
- ✅ Game ends showing "YOU WON"
- ✅ Shows multiplier achieved
- ✅ Shows amount won
- ✅ Bomb positions are revealed
- ✅ Success notification appears

**Check Logs:**
```
[MINES FRONTEND] Cashout button clicked
[MINES FRONTEND] Calling /mines/cashout API
[MINES] Cashout endpoint hit by user: XXX
[MINES] Calculated payout: YYY multiplier: Z.ZZ
[MINES] User balance before cashout: AAA Payout to add: YYY
[MINES] Transaction committed. Balance after: BBB
[MINES] Emitting balance to socket: BBB
[BALANCE] Emitting to user XXX: { type: 'set', amount: BBB }
[APP] Balance socket event received: { type: 'set', amount: BBB }
```

---

## Test 4: Mines Game - Hit a Mine (Loss)

**Steps:**
1. Start a new game with 100 R$ bet, 3 mines
2. Click tiles until you hit a mine

**Expected Result:**
- ✅ Mine explodes (purple bomb appears)
- ✅ Game ends showing "YOU LOST"
- ✅ Shows -100 R$ (or bet amount)
- ✅ Balance remains at (original - bet) amount
- ✅ All mine positions are revealed
- ✅ Loss sound plays

**Check Logs:**
```
[MINES] Mine hit, balance unchanged: { userId: XXX, balance: YYY }
[BALANCE] Emitting to user XXX: { type: 'set', amount: YYY }
```

---

## Test 5: Mines Game - Auto-Cashout (All Tiles)

**Steps:**
1. Start a new game with 100 R$ bet, 1 mine (easy mode)
2. Reveal tiles one by one
3. Reveal the last safe tile (24th tile)

**Expected Result:**
- ✅ Game automatically cashes out
- ✅ Shows "YOU WON"
- ✅ Balance updates with payout
- ✅ All bombs revealed
- ✅ Success notification

**Check Logs:**
```
[MINES] All safe tiles revealed! Auto-cashing out...
[MINES] Emitting balance after auto-cashout: { userId: XXX, balance: YYY }
[MINES] Auto-cashout complete, sending response
```

---

## Test 6: Live Balance - Rakeback Claim

**Steps:**
1. Play some games to generate rakeback
2. Open rakeback modal (if available)
3. Claim rakeback
4. Watch balance

**Expected Result:**
- ✅ Balance increases immediately
- ✅ No page refresh needed
- ✅ Success notification appears

---

## Test 7: Live Balance - Promo Code

**Steps:**
1. Navigate to profile or promo section
2. Enter a valid promo code
3. Submit

**Expected Result:**
- ✅ Balance increases by promo amount immediately
- ✅ Success notification shows amount

---

## Test 8: Live Balance - Survey/Offerwall Completion

**Steps:**
1. Complete a survey or offerwall task
2. Wait for webhook callback
3. Observe balance

**Expected Result:**
- ✅ Balance increases automatically
- ✅ No page refresh needed
- ✅ Notification may appear (depending on implementation)

---

## Test 9: Live Balance - Affiliate Claim

**Steps:**
1. If you have affiliate earnings
2. Navigate to affiliates page
3. Click claim
4. Watch balance

**Expected Result:**
- ✅ Balance increases by affiliate earnings
- ✅ Updates in real-time

---

## Test 10: Live Balance - Multiple Browser Tabs

**Steps:**
1. Open the site in two browser tabs
2. In tab 1, start a mines game
3. Observe tab 2 balance

**Expected Result:**
- ✅ Both tabs show same balance
- ✅ Balance updates in both tabs simultaneously
- ✅ When game starts in tab 1, both tabs deduct balance
- ✅ When cashout in tab 1, both tabs increase balance

---

## Debugging Tips

### If Balance Not Updating:

1. **Check Browser Console:**
   ```javascript
   // Should see:
   [APP] Balance socket event received: { type: 'set', amount: XXX }
   [APP] Setting balance to: XXX
   ```

2. **Check Server Logs:**
   ```
   [BALANCE] Emitting to user XXX: { type: 'set', amount: YYY }
   ```

3. **Check Socket Connection:**
   - Open browser dev tools → Network tab
   - Look for WebSocket connection
   - Should be connected and green

4. **Check User Room:**
   - Server log should show: `[SOCKET] User XXX joined room: XXX`

### If Cashout Not Working:

1. **Check if game is active:**
   ```javascript
   // In console:
   game()?.active // should be true
   revealed().length // should be > 0
   ```

2. **Check API response:**
   - Open Network tab
   - Click cashout
   - Check `/mines/cashout` response
   - Should return `{ success: true, payout: XXX, multiplier: X.XX, minePositions: [...] }`

3. **Check for errors:**
   - Browser console errors
   - Server terminal errors
   - Database errors

### Common Issues:

❌ **Balance decreases twice on game start:**
- Check if balance deduction happens in both `/mines/start` and elsewhere
- Should only happen once in `/mines/start`

❌ **Balance doesn't update on cashout:**
- Check if `emitBalance()` is called after commit
- Check if socket is connected
- Check if userId matches socket room

❌ **Cashout button doesn't respond:**
- Check if `isProcessing()` is stuck as true
- Check if `game()?.active` is false when it should be true
- Check if `revealed().length < 1`

---

## Success Criteria

All tests pass if:
- ✅ No page refreshes needed for balance updates
- ✅ Balance updates instantly across all operations
- ✅ Mines game works correctly (start, reveal, cashout, loss)
- ✅ No double-deduction of bet amounts
- ✅ No errors in browser console
- ✅ No errors in server logs
- ✅ Multiple tabs stay synchronized

---

## Performance Check

Monitor these during testing:
- Balance update latency (should be < 100ms)
- Socket connection stability
- Database transaction completion times
- No memory leaks in browser
- No socket disconnections
