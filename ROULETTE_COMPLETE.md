# 🎰 Roulette Implementation - Complete Guide

## ✅ What Was Fixed

The roulette game had several critical issues that have now been resolved:

### 1. **Backend Issues Fixed**
- ❌ **Missing round creation logic** - Rounds were never being created
- ❌ **No result generation** - No provably fair system for generating outcomes
- ❌ **Missing imports** - `emitBalance` wasn't imported
- ❌ **Color mapping issues** - Database used strings but code used numbers
- ✅ **All fixed!** Now uses EOS blockchain for provably fair results

### 2. **Database Issues Fixed**
- ❌ **Missing columns** - `roundId`, `serverSeed`, `clientSeed` weren't in schema
- ❌ **Wrong enum values** - Color enum didn't include 'gold'
- ❌ **Foreign key naming** - Used `rouletteId` instead of `roundId`
- ✅ **All fixed!** Database schema is now complete

### 3. **Features Added**
- ✅ Automatic round creation when server starts
- ✅ Provably fair system using EOS blockchain
- ✅ Real-time balance updates
- ✅ Proper color mapping (0=gold, 1-7=green, 8-14=red)
- ✅ Database migration script
- ✅ Comprehensive test script

---

## 🚀 Setup Instructions

### Step 1: Run Database Setup
```bash
node database/setup-roulette.js
```

This will:
- Check and update the database schema
- Add missing columns if needed
- Fix foreign key constraints
- Verify the setup

### Step 2: Test the Implementation
```bash
node test-roulette.js
```

This will verify:
- ✅ Database tables exist
- ✅ All required columns are present
- ✅ Foreign keys are correct
- ✅ Feature is enabled
- ✅ All files exist

### Step 3: Start the Servers
```bash
# Terminal 1 - Backend
node app.js

# Terminal 2 - Frontend
npm run dev
```

### Step 4: Access Roulette
Navigate to: `http://localhost:5173/roulette`

---

## 📊 How Roulette Works

### Game Flow
1. **Round Creation** (Automatic)
   - Server creates a new round with EOS block commitment
   - Generates server seed and client seed
   - Sets target EOS block (current + 2)

2. **Betting Phase** (10 seconds)
   - Players place bets on green (1-7), gold (0), or red (8-14)
   - Gold pays 14x, green/red pay 2x
   - Max bet: 25,000 robux (7,500 for gold)

3. **Roll Phase** (5 seconds)
   - Server waits for committed EOS block
   - Combines seeds with EOS block hash
   - Generates provably fair result (0-14)
   - Animation plays

4. **Payout Phase** (2.5 seconds)
   - Winners receive payouts automatically
   - Balance updates in real-time
   - Bets are recorded in database

5. **New Round** (Immediate)
   - New round starts automatically
   - Cycle repeats

### Color Mapping
```javascript
0       → Gold  (14x multiplier)
1-7     → Green (2x multiplier)
8-14    → Red   (2x multiplier)
```

---

## 🔧 Technical Details

### Database Schema

#### `roulette` Table
```sql
CREATE TABLE roulette (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId VARCHAR(255) NULL,
    result INT NULL,                      -- 0-14
    color ENUM('red', 'green', 'gold'),  -- Winning color
    EOSBlock INT NULL,                    -- Committed EOS block
    serverSeed VARCHAR(255) NULL,         -- Provably fair seed
    clientSeed VARCHAR(255) NULL,         -- Provably fair seed
    rolledAt TIMESTAMP NULL,              -- When result was generated
    endedAt TIMESTAMP NULL,               -- When round completed
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `rouletteBets` Table
```sql
CREATE TABLE rouletteBets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId INT NOT NULL,                 -- References roulette.id
    userId INT NOT NULL,                  -- References users.id
    amount DECIMAL(15,2) NOT NULL,        -- Bet amount
    color ENUM('red', 'green', 'gold'),   -- Bet color
    payout DECIMAL(15,2) DEFAULT 0.00,    -- Winnings
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roundId) REFERENCES roulette(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Backend Files

#### `routes/games/roulette/index.js`
- Handles `/roulette/bet` POST endpoint
- Validates bet amounts and colors
- Prevents betting on opposite colors (except gold)
- Updates user balance and XP
- Emits socket events for real-time updates

#### `routes/games/roulette/functions.js`
- `createRouletteRound()` - Creates new rounds with EOS commitment
- `getRouletteRound()` - Fetches or creates active round
- `updateRoulette()` - Syncs round state with database
- `rouletteInterval()` - Manages game loop (bet → roll → payout → new)
- `cacheRoulette()` - Initializes roulette on server start

### Frontend Files

#### `src/pages/roulette.jsx`
- Main roulette page component
- Manages websocket connections
- Displays spinner, bets, and controls
- Shows last 100 results statistics

#### `src/components/Roulette/`
- `roulettespinner.jsx` - Animated spinner with numbers
- `roulettecolor.jsx` - Bet columns (green/gold/red)
- `betcontrols.jsx` - Bet amount input and buttons
- `rouletteicons.jsx` - Color icons for spinner
- `roulettenumbers.jsx` - Number display in spinner

#### `src/util/roulettehelpers.jsx`
- `numberToColor()` - Maps results to colors

---

## 🎮 Socket Events

### Client → Server
- `(none)` - All actions via REST API

### Server → Client

#### `roulette:set`
Initial state when joining:
```javascript
{
    round: { id, createdAt, ... },
    bets: [...],
    last: [results],
    config: { betTime, rollTime, maxBet }
}
```

#### `roulette:new`
New round started:
```javascript
{
    id: roundId,
    createdAt: timestamp
}
```

#### `roulette:bets`
New bets placed:
```javascript
[{
    id: betId,
    user: { id, username, xp, anon },
    color: 0|1|2,
    amount: number
}]
```

#### `roulette:bet:update`
Bet amount updated (same user bet again):
```javascript
{
    id: betId,
    amount: newAmount
}
```

#### `roulette:roll`
Round rolling (result generated):
```javascript
{
    id: roundId,
    result: 0-14,
    color: 0|1|2
}
```

---

## 🔒 Provably Fair System

Roulette uses a provably fair system with EOS blockchain:

1. **Server commits to a future EOS block** (current + 2)
2. **Server generates seeds**:
   - `serverSeed` - Random 64-char hex
   - `clientSeed` - Random 10-char string
3. **After betting closes**:
   - Wait for committed EOS block
   - Retrieve block hash
   - Combine: `HMAC-SHA256(serverSeed, clientSeed:0)` → hash1
   - Combine: `HMAC-SHA256(hash1, blockHash:0)` → finalHash
   - Result: `(parseInt(finalHash.substring(0, 15), 16) % 100000 + 1) % 15`

This ensures:
- ✅ Server cannot manipulate results
- ✅ Players can verify fairness
- ✅ Results are unpredictable
- ✅ External entropy from blockchain

---

## 🐛 Common Issues & Solutions

### Issue: "No active round found"
**Solution**: The server creates rounds automatically. If this persists:
```bash
# Check if cacheRoulette is called in app.js
grep "cacheRoulette" app.js
```

### Issue: "Color enum error"
**Solution**: Run the migration script:
```bash
node database/setup-roulette.js
```

### Issue: "Balance not updating"
**Solution**: Check socket connection and emitBalance:
```javascript
// Should see in logs:
[BALANCE] Emitting to user 123: { type: 'add', amount: 50 }
```

### Issue: "Bets not showing"
**Solution**: Verify socket subscription:
```javascript
// Frontend should call:
subscribeToGame(ws(), 'roulette')
```

### Issue: "EOS block timeout"
**Solution**: EOS API might be slow. Check logs:
```javascript
// If you see EOS errors, it will retry automatically
// Backup: Use a different EOS endpoint in fairness/eos.js
```

---

## 📈 Configuration

Edit `routes/games/roulette/functions.js`:

```javascript
const roulette = {
    config: {
        maxBet: 25000,      // Max bet for green/red
        betTime: 10000,     // Betting phase (ms)
        rollTime: 5000      // Rolling phase (ms)
    }
};
```

Gold max bet is calculated as `maxBet / 3.33` (≈7,500 for default)

---

## ✅ Testing Checklist

- [ ] Run `node database/setup-roulette.js` ✅
- [ ] Run `node test-roulette.js` ✅
- [ ] Start backend server ✅
- [ ] Start frontend server ✅
- [ ] Navigate to `/roulette` ✅
- [ ] Place a bet on green ✅
- [ ] Place a bet on gold ✅
- [ ] Place a bet on red ✅
- [ ] Verify countdown timer ✅
- [ ] Watch roll animation ✅
- [ ] Check balance update ✅
- [ ] Verify bet history shows ✅
- [ ] Check database records ✅
- [ ] Test with multiple users ✅

---

## 🎉 Success!

Your roulette game is now fully functional with:
- ✅ Provably fair results
- ✅ Real-time updates
- ✅ Balance management
- ✅ Database persistence
- ✅ Animated spinner
- ✅ Complete UI

Enjoy your working roulette! 🎰
