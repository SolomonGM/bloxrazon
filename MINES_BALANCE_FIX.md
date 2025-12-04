# Mines Game Balance & UI Fixes

## Changes Made

### Backend Changes (`routes/games/mines/index.js`)

1. **Balance Updates on Reveal**
   - Added real-time balance emission after each tile reveal
   - Ensures frontend stays synchronized with actual balance
   - Query user balance and emit via socket.io after successful reveal

### Frontend Changes (`src/pages/mines.jsx`)

1. **Disabled Input Fields During Active Game**
   - Bet amount input: `disabled={game()?.active}`
   - All bet modifier buttons (1/2, 2X, MAX): `disabled={game()?.active}`
   - Mines count dropdown: `disabled={game()?.active}`
   - Prevents users from changing bet parameters mid-game

2. **Cashout Button Logic**
   - Disabled until at least 1 tile is revealed: `disabled={isProcessing() || (game()?.active && revealed().length === 0)}`
   - Added early return if clicked with 0 tiles revealed
   - Prevents invalid cashout attempts

3. **CSS Styling for Disabled States**
   - `input:disabled`: 50% opacity, not-allowed cursor
   - `.mines-select:disabled`: 50% opacity, not-allowed cursor
   - `button:disabled`: 50% opacity, not-allowed cursor, no transform on hover

## How It Works Now

### Starting a Game
1. User enters bet amount and selects mine count
2. Clicks "PLACE BET"
3. Balance is deducted immediately
4. Socket.io emits balance update
5. All inputs become disabled (greyed out)
6. Cashout button appears but is disabled

### During Gameplay
1. User clicks tiles to reveal
2. Each reveal updates multiplier and payout
3. Balance stays updated via socket emissions
4. After first tile, Cashout button becomes enabled
5. Inputs remain disabled

### Cashing Out
1. User clicks "CASHOUT" (only after revealing tiles)
2. Payout is added to balance
3. Socket.io emits final balance update
4. Game ends, inputs re-enabled
5. "PLAY AGAIN" button appears

### Losing (Hit Mine)
1. User clicks a mine
2. Game ends immediately
3. No payout (balance already deducted at start)
4. Inputs re-enabled
5. "TRY AGAIN" button appears

## Balance Update Flow

```
Start Game:
- DB: balance = balance - bet
- Socket: emit('balance', 'set', newBalance)

Reveal Tile:
- Socket: emit('balance', 'set', currentBalance)
- (No change, just sync check)

Cashout/Win:
- DB: balance = balance + payout
- Socket: emit('balance', 'set', newBalance)
```

## Testing Checklist

- [x] Balance deducts when starting game
- [x] Inputs disabled during active game
- [x] Cashout disabled with 0 tiles revealed
- [x] Cashout enabled after revealing 1+ tiles
- [x] Balance updates on cashout
- [x] "PLAY AGAIN" re-enables inputs
- [x] Multiple rapid clicks don't cause issues (isProcessing check)
- [x] Socket.io keeps balance in sync throughout game
