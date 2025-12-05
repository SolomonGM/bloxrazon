# Bot Migration Instructions

## What Was Fixed

1. **Bot names standardized**: All bots now use the format `[Name]BOT`
   - JeroldBOT
   - TimmyBOT
   - DanielBOT
   - RaymondBOT
   - EdwinBOT
   - CoinflipBOT

2. **Bot statistics removed**: Bots no longer appear in:
   - Live Bets (All Bets)
   - High Bets
   - Lucky Wins
   - Any bet history displays

3. **Bot avatar unified**: All bots now use `RazonBOT.png` as their profile picture

## Migration Required

To apply these changes to your existing bots in the database, run this command on your production server:

```bash
node database/rename-bots.js
```

This will:
- Rename `BotPlayer1` → `JeroldBOT`
- Rename `BotPlayer2` → `TimmyBOT`
- Rename `BotPlayer3` → `DanielBOT`
- Rename `BotPlayer4` → `RaymondBOT`
- Rename `BotPlayer5` → `EdwinBOT`
- Rename `CoinflipBot` → `CoinflipBOT`

## Important Notes

- Bots will continue to function in games (battles, coinflip)
- Bots will no longer clutter the public bet displays
- The RazonBOT.png file must exist at `public/assets/art/RazonBOT.png`
- All future bot interactions will automatically be hidden from stats

## Verification

After deployment, verify:
1. ✅ Bots don't appear in "LIVE BETS" on homepage
2. ✅ Bots have names ending in "BOT" in battles/coinflip
3. ✅ Bot avatars show the RazonBOT.png image
4. ✅ Real player stats are still displayed correctly
