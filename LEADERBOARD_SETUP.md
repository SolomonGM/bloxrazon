# Leaderboard System - Complete Setup Guide

## Overview
The CLASH LEADERBOARD system tracks the top wagering users and rewards them with prizes on a daily and weekly basis.

## Features
- **Daily Leaderboard**: Resets every 24 hours with prizes up to R$1,000
- **Weekly Leaderboard**: Resets every 7 days with prizes over R$3,500
- **Top 10 Ranking**: Shows top 10 wagerers with bronze, silver, and gold medals
- **Automatic Payouts**: Winners receive prizes automatically when leaderboard ends
- **Live Updates**: Real-time leaderboard updates every 10 minutes
- **Animations**: Podium reveal animations with confetti and sound effects

## Database Setup

### 1. Update Database Schema
Run the migration script to create/update the leaderboard tables:

```bash
node database/update-leaderboard-schema.js
```

This will:
- Create `leaderboards` table (tracks leaderboard periods)
- Create `leaderboardUsers` table (tracks user placements and prizes)
- Add `leaderboardBan` column to `users` table

### 2. Tables Structure

#### `leaderboards` table
- `id`: Primary key
- `type`: 'daily' or 'weekly'
- `createdAt`: When the leaderboard period started
- `endedAt`: When the leaderboard period ended (NULL if active)

#### `leaderboardUsers` table
- `id`: Primary key
- `leaderboardId`: Reference to leaderboards table
- `userId`: Reference to users table
- `position`: Rank (1-10)
- `totalWagered`: Total amount wagered during period
- `amountWon`: Prize amount awarded
- `createdAt`: Timestamp

#### `users.leaderboardBan` column
- Boolean flag to ban users from appearing on leaderboard

## Backend Configuration

### Prize Structure

Located in `routes/leaderboard/functions.js`:

```javascript
const leaderboards = {
    'daily': {
        interval: 1000 * 60 * 60 * 24, // 24 hours
        rewards: {
            1: 1000,   // 1st place: R$1,000
            2: 500,    // 2nd place: R$500
            3: 250,    // 3rd place: R$250
            4: 50,     // 4th-10th place: R$50 each
            5: 50,
            6: 50,
            7: 50,
            8: 50,
            9: 50,
            10: 50
        }
    },
    'weekly': {
        interval: 1000 * 60 * 60 * 24 * 7, // 7 days
        rewards: {
            1: 3500,   // 1st place: R$3,500
            2: 2000,   // 2nd place: R$2,000
            3: 1000,   // 3rd place: R$1,000
            4: 200,    // 4th-10th place: R$200 each
            5: 200,
            6: 200,
            7: 200,
            8: 200,
            9: 200,
            10: 200
        }
    }
}
```

### How It Works

1. **Initialization**: On server start, `cacheLeaderboards()` is called
2. **Tracking**: User wagers from the `bets` table where `completed = 1`
3. **Filtering**: Excludes users with `leaderboardBan = 1` or `role != 'USER'`
4. **Caching**: Updates leaderboard data every 10 minutes
5. **Payout**: When period ends, winners receive prizes automatically
6. **Logging**: Discord webhook logs winners and prizes

## Frontend Features

### Page Location
`src/pages/leaderboard.jsx`

### UI Components
- **Banner**: Gold gradient header with "CLASH LEADERBOARD" title
- **Timer**: Shows time remaining until period ends
- **Period Selector**: Toggle between Daily and Weekly
- **Podiums**: Top 3 users with animated reveal
  - Gold (1st): Center, largest, with glow effect
  - Silver (2nd): Left side
  - Bronze (3rd): Right side
- **Table**: Positions 4-10 in a clean table layout

### Animations
1. **Page Load**: 
   - 1 second delay
   - "lets go gambling" audio plays
   - Text animation

2. **Podium Reveal** (2.5s after page load):
   - Bronze appears first (bounce animation)
   - Silver appears 1.5s later
   - Gold appears 1.5s later with:
     - Confetti explosion (150+ particles)
     - Screen flash effect
     - Victory sound effect
     - Glow animation

### Sound Effects
- `lets go gambling.mp3`: Intro audio
- `winorcashout.mp3`: Victory sound for gold reveal

## API Endpoints

### GET `/leaderboard/:type`
Get current leaderboard data

**Parameters:**
- `type`: 'daily' or 'weekly'

**Response:**
```json
{
  "id": 1,
  "createdAt": 1700000000000,
  "endsAt": 1700086400000,
  "endsIn": 86400000,
  "users": [
    {
      "id": 123,
      "username": "Player1",
      "xp": 5000,
      "wagered": 10000.00,
      "position": 1,
      "reward": 1000,
      "item": "https://..."
    }
  ]
}
```

## Admin Controls

### Enable/Disable Leaderboard
In admin config (`routes/admin/config.js`):
```javascript
enabledFeatures.leaderboard = true; // or false
```

### Ban User from Leaderboard
Update user record:
```sql
UPDATE users SET leaderboardBan = 1 WHERE id = ?;
```

## Testing

### Test Leaderboard Data
1. Place bets in any game (mines, crash, roulette, etc.)
2. Ensure bets are marked as `completed = 1`
3. Wait up to 10 minutes for cache refresh
4. Visit `/leaderboard` page to see rankings

### Verify Database
```sql
-- Check active leaderboards
SELECT * FROM leaderboards WHERE endedAt IS NULL;

-- Check user rankings (example for daily)
SELECT 
  SUM(bets.amount) as wagered,
  users.id,
  users.username
FROM bets
INNER JOIN users ON users.id = bets.userId
WHERE bets.createdAt >= (SELECT createdAt FROM leaderboards WHERE type = 'daily' AND endedAt IS NULL)
  AND bets.completed = 1
  AND users.leaderboardBan = 0
  AND users.role = 'USER'
GROUP BY userId
ORDER BY wagered DESC
LIMIT 10;
```

### Force Leaderboard End (Testing)
```sql
-- End current daily leaderboard manually
UPDATE leaderboards SET endedAt = NOW() WHERE type = 'daily' AND endedAt IS NULL;
```

Then restart the server to trigger a new period and payout.

## Troubleshooting

### Leaderboard Not Updating
- Check if server is running
- Verify `enabledFeatures.leaderboard = true`
- Check console for errors in `cacheLeaderboards()`
- Ensure database has `bets` with `completed = 1`

### Users Not Appearing
- Check if `leaderboardBan = 1`
- Verify `role = 'USER'`
- Ensure bets are `completed = 1`
- Check if createdAt is within current period

### Prizes Not Paying Out
- Check if `enabledFeatures.leaderboard = true`
- Verify leaderboard period has ended
- Check transaction logs in database
- Check Discord logs for payout confirmation

### Frontend Not Loading
- Clear browser cache
- Check browser console for API errors
- Verify API endpoint `/leaderboard/:type` is accessible
- Check if audio files exist in `public/assets/sfx/`

## Customization

### Change Prize Amounts
Edit `routes/leaderboard/functions.js`:
```javascript
rewards: {
    1: 5000,  // Increase 1st place to R$5,000
    2: 2500,
    // ...
}
```

### Change Period Duration
```javascript
interval: 1000 * 60 * 60 * 12, // 12 hours instead of 24
```

### Change Top 10 Item Display
Items shown for top 3 are automatically selected based on prize value from Roblox catalog cache.

### Modify UI Colors
Edit inline styles in `src/pages/leaderboard.jsx`:
- Gold: `#FCA31E`, `#FFD700`
- Silver: `#C1C1C1`, `#FBFBFB`
- Bronze: `#A47C66`, `#735544`

## Maintenance

### Daily Tasks
- Monitor Discord logs for leaderboard endings
- Verify payouts are processing correctly
- Check for any banned users circumventing system

### Weekly Tasks
- Review prize pool vs. house edge
- Analyze leaderboard participation metrics
- Adjust prizes if needed for engagement

### Monthly Tasks
- Audit historical leaderboard data
- Clean up old `leaderboardUsers` records (optional)
- Review and optimize database queries

## Support

For issues or questions:
1. Check server console logs
2. Review database for inconsistencies
3. Verify API responses
4. Check frontend browser console
5. Test with fresh browser session

---

**Last Updated**: November 2025  
**Version**: 1.0
