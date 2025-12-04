# Mines Game - Quick Start

## What I've Configured

The Mines game is now fully configured and ready to use! Here's what was done:

### ✅ Database Configuration
1. **Updated schema.sql** with:
   - Added `features` table for enabling/disabling games
   - Added `bannedPhrases` table for chat moderation
   - Updated `users` table with additional required columns
   - Added default feature flags (mines enabled by default)

2. **Created migration script**: `database/add-mines-support.js`
   - Use this to upgrade existing databases
   - Safely adds missing tables and columns

### ✅ Backend Ready
- Routes already configured in `app.js`
- Game logic implemented in `routes/games/mines/`
- Provably fair system using SHA-256 HMAC
- Rate limiting and validation in place

### ✅ Frontend Ready
- Page component: `src/pages/mines.jsx`
- Tile component: `src/components/Mines/tile.jsx`
- All assets created/verified
- Integrated with navbar and routing

## To Get Started

### 1. Set Up Database

**If you have a fresh database:**
```bash
node database/apply-complete-schema.js
```

**If you have an existing database:**
```bash
node database/add-mines-support.js
```

This will create all necessary tables and enable the mines feature.

### 2. Start the Server

```bash
# Install dependencies (if not done)
pnpm install

# Start backend
node app.js
```

### 3. Access the Game

Navigate to: **http://localhost:3000/mines** (or your configured port)

## Game Features

- **Provably Fair**: Every game is verifiable using server/client seeds
- **Flexible Betting**: 1-24 mines, customizable bet amounts
- **Real-time Updates**: Socket.IO for instant balance updates
- **Live Feed**: Bets appear in the live drops feed
- **Mobile Responsive**: Works on all screen sizes
- **XP System**: Players earn XP based on their bets

## Configuration Options

### Enable/Disable Game
```sql
UPDATE features SET enabled = 1 WHERE name = 'mines';  -- Enable
UPDATE features SET enabled = 0 WHERE name = 'mines';  -- Disable
```

### Adjust Bet Limits
Edit `routes/games/mines/index.js`:
- Minimum: Line 44 (currently 1 Robux)
- Maximum: Line 45 (currently 20,000 Robux)

### Adjust House Edge
Edit `routes/games/mines/functions.js`:
- Line 4 (currently 7.5%)

### Adjust Mine Limits
Edit `routes/games/mines/index.js`:
- Line 43 (currently 1-24 mines)

## Testing

Test user is automatically created:
- **Username**: testuser
- **Balance**: 10,000 Robux
- **User ID**: 1

## Documentation

For detailed information, see:
- `MINES_SETUP.md` - Comprehensive setup and configuration guide
- `/docs/provably` - Frontend provably fair verification

## Troubleshooting

**Game shows "DISABLED":**
- Run the migration script
- Restart the server
- Check features table in database

**User has no seeds:**
- Seeds are created automatically for new users
- For existing users, run queries in MINES_SETUP.md

**Balance not updating:**
- Check Socket.IO connection
- Verify user authentication
- Check browser console for errors

## Support Files Created

1. `/database/add-mines-support.js` - Migration script
2. `/MINES_SETUP.md` - Full documentation
3. `/public/assets/icons/mines.svg` - Game icon
4. Updated `/database/schema.sql` - Complete schema

## Game is Ready! 🎮

The Mines game is fully functional and ready to use. Just run the migration and start the server!
