# Mines Game Setup Guide

This guide will help you set up and configure the Mines game on your BloxRazon platform.

## Prerequisites

- MySQL database running
- Node.js and npm/pnpm installed
- Database connection configured in `.env` file

## Setup Steps

### 1. Database Setup

You have two options for setting up the database:

#### Option A: Fresh Installation

If you're setting up the database for the first time:

```bash
node database/apply-complete-schema.js
```

This will create all necessary tables including the mines table and enable the mines feature.

#### Option B: Add Mines Support to Existing Database

If you already have a database running:

```bash
node database/add-mines-support.js
```

This migration script will:
- Add missing columns to the `users` table (banned, sponsorLock, accountLock, verified, lastLogout)
- Create the `features` table for enabling/disabling game modes
- Create the `bannedPhrases` table for chat moderation
- Insert default feature flags with mines enabled

### 2. Verify Database Tables

After running the migration, verify that these tables exist:

**Required tables for Mines:**
- `users` - User accounts with balance, xp, etc.
- `serverSeeds` - Server seeds for provably fair gaming
- `clientSeeds` - Client seeds for provably fair gaming
- `mines` - Mines game records
- `bets` - Bet tracking across all games
- `features` - Feature flags to enable/disable games

**Check mines table structure:**
```sql
DESCRIBE mines;
```

Expected columns:
- `id` - Primary key
- `userId` - Foreign key to users
- `amount` - Bet amount
- `clientSeedId` - Foreign key to clientSeeds
- `serverSeedId` - Foreign key to serverSeeds
- `nonce` - Nonce for provably fair
- `minesCount` - Number of mines in the game
- `mines` - JSON array of mine positions
- `revealedTiles` - JSON array of revealed tile positions
- `payout` - Final payout amount
- `endedAt` - When the game ended (NULL if active)
- `createdAt` - When the game was created

### 3. Enable Mines Feature

The migration script automatically enables mines, but you can manually verify/enable it:

```sql
SELECT * FROM features WHERE name = 'mines';
```

To enable if disabled:
```sql
UPDATE features SET enabled = 1 WHERE name = 'mines';
```

### 4. Configure Server Seeds

Each user needs active server and client seeds. For new users, these are created automatically.

For existing users without seeds:
```sql
-- Check if user has seeds
SELECT u.id, u.username, 
       (SELECT COUNT(*) FROM serverSeeds WHERE userId = u.id AND endedAt IS NULL) as activeServerSeeds,
       (SELECT COUNT(*) FROM clientSeeds WHERE userId = u.id AND endedAt IS NULL) as activeClientSeeds
FROM users u;

-- Add seeds for users missing them (replace USER_ID with actual ID)
INSERT INTO serverSeeds (userId, seed, nonce) 
VALUES (USER_ID, SHA2(CONCAT(USER_ID, UNIX_TIMESTAMP(), RAND()), 256), 0);

INSERT INTO clientSeeds (userId, seed) 
VALUES (USER_ID, SHA2(CONCAT(USER_ID, UNIX_TIMESTAMP(), RAND()), 256));
```

### 5. Start the Server

```bash
# Install dependencies if not already done
pnpm install

# Start the backend server
npm run dev
# or
node app.js
```

The server will cache the features table on startup. Look for:
```
cacheAdmin completed in Xms
```

### 6. Frontend Setup

The frontend is already configured and ready to use. The mines game page is accessible at `/mines`.

**Key frontend files:**
- `src/pages/mines.jsx` - Main mines page component
- `src/components/Mines/tile.jsx` - Individual tile component
- `public/assets/icons/mines.svg` - Mines icon
- `public/assets/icons/minesgem.png` - Gem image for safe tiles
- `public/assets/icons/bomb.png` - Bomb image for mine tiles
- `public/assets/gamemodes/mines.png` - Game mode preview image

## Game Configuration

### Adjusting House Edge

Edit `routes/games/mines/functions.js`:

```javascript
const houseEdge = 7.5 / 100; // 7.5% house edge
```

### Bet Limits

Edit `routes/games/mines/index.js`:

```javascript
// Minimum bet
if (amount < 1) return res.status(400).json({ error: 'MINES_MIN_BET' });

// Maximum bet
if (amount > 20000) return res.status(400).json({ error: 'MINES_MAX_BET' });
```

### Mine Count Limits

Currently set to 1-24 mines (at least 1 tile must be safe):

```javascript
if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > totalTiles - 1)
```

### XP Multiplier

Edit `routes/admin/config.js`:

```javascript
const xpMultiplier = 1; // 1x XP, or 2 for 2x XP, etc.
```

## Testing the Game

### 1. Create a Test User

The schema includes a test user:
- Username: `testuser`
- Initial Balance: 10,000 Robux
- User ID: 1

### 2. Test the Game Flow

1. **Start a game:**
   - POST `/mines/start`
   - Body: `{ "amount": 100, "minesCount": 3 }`

2. **Reveal tiles:**
   - POST `/mines/reveal`
   - Body: `{ "field": 0 }` (where field is 0-24)

3. **Cash out:**
   - POST `/mines/cashout`

4. **Check active game:**
   - GET `/mines`

### 3. Verify Provably Fair

After a game ends, verify the mine positions:
1. Get the server seed, client seed, and nonce from the database
2. Use the verification function in `routes/games/mines/functions.js`
3. The frontend has a provably fair checker at `/docs/provably`

## Troubleshooting

### "DISABLED" Error

The mines feature is disabled. Enable it:
```sql
UPDATE features SET enabled = 1 WHERE name = 'mines';
```

Then restart the server to reload the cache.

### "MINES_GAME_ACTIVE" Error

User already has an active game. Either:
- Complete the active game first (reveal all tiles or hit a mine)
- Cash out the current game
- Or check for stuck games in the database

### No Server/Client Seeds

User is missing seeds:
```sql
-- Check
SELECT * FROM serverSeeds WHERE userId = ? AND endedAt IS NULL;
SELECT * FROM clientSeeds WHERE userId = ? AND endedAt IS NULL;

-- Add if missing (replace ? with user ID)
INSERT INTO serverSeeds (userId, seed, nonce) VALUES (?, UUID(), 0);
INSERT INTO clientSeeds (userId, seed) VALUES (?, UUID());
```

### Balance Not Updating

Check that:
1. Socket.IO is running properly
2. User is authenticated
3. `io.to(userId).emit('balance', 'set', balance)` is being called

## API Endpoints

### GET /mines
Get the user's active game (if any)

**Response:**
```json
{
  "activeGame": {
    "minesCount": 3,
    "revealedTiles": [0, 1, 5],
    "amount": 100,
    "multiplier": 1.35,
    "currentPayout": 135
  }
}
```

### POST /mines/start
Start a new mines game

**Request:**
```json
{
  "amount": 100,
  "minesCount": 3
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /mines/reveal
Reveal a tile

**Request:**
```json
{
  "field": 5
}
```

**Response (safe tile):**
```json
{
  "success": true,
  "isMine": false,
  "revealedTiles": [0, 1, 5],
  "multiplier": 1.35,
  "currentPayout": 135
}
```

**Response (mine hit):**
```json
{
  "success": true,
  "isMine": true,
  "minePositions": [2, 7, 12],
  "revealedTiles": [0, 1, 5]
}
```

**Response (all tiles revealed - auto cashout):**
```json
{
  "success": true,
  "payout": 1500,
  "multiplier": 15.0,
  "minePositions": [2, 7, 12]
}
```

### POST /mines/cashout
Cash out current game

**Response:**
```json
{
  "success": true,
  "payout": 135,
  "multiplier": 1.35,
  "minePositions": [2, 7, 12]
}
```

## Admin Panel

Mines can be enabled/disabled from the admin panel at `/admin/settings` (requires admin role).

## Additional Notes

- Rate limited to 1 request per 100ms per user
- Provably fair using EOS blockchain or SHA-256 HMAC
- Live bet feed shows mines results
- XP is awarded based on bet amount × xpMultiplier
- House edge is deducted from ideal multiplier
- All games are recorded in the `bets` table for statistics

## Support

If you encounter any issues:
1. Check the server logs for error messages
2. Verify database tables and data
3. Ensure all dependencies are installed
4. Check that the features cache is loaded on startup
