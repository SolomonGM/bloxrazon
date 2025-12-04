# Profile and Settings Setup - Quick Start

## Run the database migration to add all required tables and columns

To set up profile and settings functionality, run:

```bash
node database/add-profile-support.js
```

This will add:
- Missing columns to the users table (mentionsEnabled, robloxCookie, proxy, perms)
- discordAuths table for Discord OAuth
- robuxExchanges table for Robux trading
- securityKeys table for secure trading
- promoCodes and promoCodeUses tables for promo code system

## Verify Setup

After running the migration, restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
# or
node app.js
```

## Test Profile Features

1. Navigate to `/profile/transactions` to view transaction history
2. Navigate to `/profile/history` to view bet history  
3. Navigate to `/profile/settings` to configure settings:
   - Adjust sound volume
   - Toggle anonymous mode
   - Enable/disable chat mentions
   - Link/unlink Discord account

## Environment Variables Required

Make sure these are set in your `.env` file for Discord linking:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
BASE_URL=http://localhost:3000
```

## Full Documentation

See `PROFILE_SETTINGS_COMPLETE.md` for comprehensive documentation of all features.
