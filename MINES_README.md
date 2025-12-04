# Mines Game - Management Guide

## Game Overview

Mines is a provably fair grid-based game where players reveal tiles on a 5×5 grid (25 tiles total) while avoiding hidden mines. Players can cash out at any time to secure their winnings, or continue revealing tiles to increase their multiplier.

## Key Statistics

### House Edge & RTP

- **House Edge:** 7.5%
- **RTP (Return to Player):** 92.5%
- **Configuration File:** `routes/games/mines/functions.js` (Line 4)

```javascript
const houseEdge = 7.5 / 100; // 7.5% house edge
```

### Bet Limits

- **Minimum Bet:** 1 Robux
- **Maximum Bet:** 20,000 Robux
- **Configuration File:** `routes/games/mines/index.js` (Lines 44-45)

```javascript
if (amount < 1) return res.status(400).json({ error: 'MINES_MIN_BET' });
if (amount > 20000) return res.status(400).json({ error: 'MINES_MAX_BET' });
```

### Mine Count Limits

- **Minimum Mines:** 1
- **Maximum Mines:** 24 (must leave at least 1 safe tile)
- **Total Tiles:** 25

## Multiplier Calculation

The multiplier is calculated based on probability:

```
Base Multiplier = 1 / (probability of success)
Final Multiplier = Base Multiplier × (1 - House Edge)
```

### Example Multipliers (3 Mines)

| Tiles Revealed | Base Probability | Ideal Multiplier | Final Multiplier (7.5% edge) |
|----------------|------------------|------------------|------------------------------|
| 1              | 88.00%          | 1.136x           | 1.05x                        |
| 5              | 56.43%          | 1.772x           | 1.64x                        |
| 10             | 26.67%          | 3.750x           | 3.47x                        |
| 15             | 8.89%           | 11.250x          | 10.41x                       |
| 20             | 1.39%           | 71.875x          | 66.48x                       |
| 22 (max)       | 0.10%           | 990.000x         | 915.75x                      |

### Example Multipliers (10 Mines)

| Tiles Revealed | Base Probability | Ideal Multiplier | Final Multiplier (7.5% edge) |
|----------------|------------------|------------------|------------------------------|
| 1              | 60.00%          | 1.667x           | 1.54x                        |
| 5              | 19.13%          | 5.227x           | 4.84x                        |
| 10             | 2.87%           | 34.848x          | 32.23x                       |
| 15 (max)       | 0.00%           | 1,395,364x       | 1,290,710x                   |

## Game Flow

1. **Start Game** - Player selects bet amount and mine count
2. **Reveal Tiles** - Player clicks tiles to reveal (safe = gem, mine = bomb)
3. **Win Conditions:**
   - Cash out manually at any time
   - Auto cash out when all safe tiles are revealed
4. **Loss Condition:**
   - Hit a mine (lose entire bet)

## Provably Fair System

The game uses a cryptographically secure provably fair system:

### Seeds
- **Server Seed:** Hidden during gameplay, revealed after
- **Client Seed:** Player-controlled, can be changed
- **Nonce:** Increments with each game

### Verification
Mine positions are generated using:
```
HMAC-SHA256(serverSeed, clientSeed:nonce:round)
```

Players can verify game outcomes at `/docs/provably` on the frontend.

## Configuration Management

### Enable/Disable Game

**Via Database:**
```sql
-- Enable
UPDATE features SET enabled = 1 WHERE name = 'mines';

-- Disable
UPDATE features SET enabled = 0 WHERE name = 'mines';
```

**Note:** Restart server after changing features.

### Adjust House Edge

**File:** `routes/games/mines/functions.js`

```javascript
const houseEdge = 7.5 / 100; // Change to desired percentage
```

**Impact:**
- Higher edge = More profit, lower multipliers
- Lower edge = Less profit, higher multipliers
- Recommended range: 3% - 10%

### Adjust Bet Limits

**File:** `routes/games/mines/index.js`

```javascript
// Line 44 - Minimum bet
if (amount < 1) return res.status(400).json({ error: 'MINES_MIN_BET' });

// Line 45 - Maximum bet
if (amount > 20000) return res.status(400).json({ error: 'MINES_MAX_BET' });
```

### Adjust XP Rewards

**File:** `routes/admin/config.js`

```javascript
const xpMultiplier = 1; // XP = bet amount × multiplier
```

**XP Calculation:**
```
XP Earned = Bet Amount × XP Multiplier
```

Example: 100 Robux bet with 1x multiplier = 100 XP

### Rate Limiting

**Current Setting:** 1 request per 100ms per user

**File:** `routes/games/mines/index.js` (Lines 5-12)

```javascript
const apiLimiter = rateLimit({
    windowMs: 100,        // Time window
    max: 1,               // Max requests per window
    message: { error: 'SLOW_DOWN' },
    keyGenerator: (req, res) => req.userId
});
```

## Database Tables

### `mines` Table
Stores all game records:
- `id` - Game ID
- `userId` - Player ID
- `amount` - Bet amount
- `minesCount` - Number of mines
- `mines` - JSON array of mine positions
- `revealedTiles` - JSON array of revealed positions
- `payout` - Final payout (0 if lost)
- `serverSeedId` / `clientSeedId` / `nonce` - Provably fair data
- `createdAt` / `endedAt` - Timestamps

### `bets` Table
Tracks all bets across games:
- Links to mines via `game='mines'` and `gameId`
- Used for statistics and leaderboards

## Monitoring & Analytics

### Key Metrics to Monitor

1. **Win Rate**
   ```sql
   SELECT 
       COUNT(CASE WHEN payout > 0 THEN 1 END) * 100.0 / COUNT(*) as win_rate
   FROM mines 
   WHERE endedAt IS NOT NULL 
   AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR);
   ```

2. **Average Payout**
   ```sql
   SELECT AVG(payout) as avg_payout
   FROM mines 
   WHERE endedAt IS NOT NULL 
   AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR);
   ```

3. **Total Wagered vs Paid**
   ```sql
   SELECT 
       SUM(amount) as total_wagered,
       SUM(payout) as total_paid,
       (SUM(amount) - SUM(payout)) as house_profit
   FROM mines 
   WHERE endedAt IS NOT NULL 
   AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR);
   ```

4. **Most Popular Mine Counts**
   ```sql
   SELECT minesCount, COUNT(*) as games
   FROM mines 
   GROUP BY minesCount 
   ORDER BY games DESC;
   ```

5. **Average Tiles Revealed**
   ```sql
   SELECT AVG(JSON_LENGTH(revealedTiles)) as avg_tiles
   FROM mines 
   WHERE endedAt IS NOT NULL;
   ```

### Expected House Edge Validation

The actual house edge should match your configured edge over large sample sizes:

```sql
SELECT 
    (1 - (SUM(payout) / SUM(amount))) * 100 as actual_edge
FROM mines 
WHERE endedAt IS NOT NULL;
```

**Expected:** ~7.5% (or your configured edge)

## Troubleshooting

### Players Can't Start Games

**Check:**
1. Feature enabled: `SELECT enabled FROM features WHERE name = 'mines'`
2. User has balance: `SELECT balance FROM users WHERE id = ?`
3. User has seeds: Check `serverSeeds` and `clientSeeds` tables

### Multipliers Seem Wrong

**Verify calculation in:** `routes/games/mines/functions.js`

The `calculateMultiplier` function should match:
```javascript
successProbability = ∏(i=0 to revealedTiles-1) [(25 - mines - i) / (25 - i)]
adjustedMultiplier = (1 / successProbability) × (1 - houseEdge)
```

### JSON Parse Errors

**Fixed in current version.** All JSON.parse calls now handle:
- `null` values
- Empty strings `""`
- Invalid JSON

## Security Considerations

1. **Provably Fair:** Always maintain server seed secrecy until game ends
2. **Rate Limiting:** Prevents abuse and rapid-fire betting
3. **Transaction Safety:** Uses database transactions to prevent balance exploits
4. **Validation:** All inputs validated (bet amount, mine count, tile position)

## Recommendations

### For Balanced Gameplay
- **House Edge:** 5-8%
- **Min Bet:** 1-10 Robux
- **Max Bet:** 10,000-50,000 Robux
- **XP Multiplier:** 1x

### For High Roller Mode
- **Max Bet:** Increase to 100,000+
- **House Edge:** Can lower slightly (4-6%) to attract big bets

### For Promotional Events
- **XP Multiplier:** Increase to 2x or 3x temporarily
- **House Edge:** Lower to 5% for limited time
- **Add bonus for X consecutive wins**

## Support & Documentation

- **Full Setup Guide:** `MINES_SETUP.md`
- **Quick Start:** `MINES_QUICKSTART.md`
- **Complete Summary:** `MINES_COMPLETE.md`
- **Provably Fair Docs:** Frontend at `/docs/provably`

## API Endpoints

- `GET /mines` - Get active game
- `POST /mines/start` - Start new game
- `POST /mines/reveal` - Reveal a tile
- `POST /mines/cashout` - Cash out current game

All endpoints require authentication and respect rate limits.
