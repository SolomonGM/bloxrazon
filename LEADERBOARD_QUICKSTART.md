# 🎯 CLASH LEADERBOARD - Quick Setup

## 🚀 Quick Start (3 Steps)

### 1. Update Database
Run the migration script:
```powershell
node database/update-leaderboard-schema.js
```

### 2. Start Server
The leaderboard system will automatically initialize when you start the server:
```powershell
npm start
```

### 3. Test
Visit `http://localhost:3000/leaderboard` or run:
```powershell
node test-leaderboard.js
```

## ✅ What Was Done

### Database Changes
- ✓ Fixed `leaderboards` table structure (id, type, createdAt, endedAt)
- ✓ Created `leaderboardUsers` table for tracking winners
- ✓ Added `leaderboardBan` column to users table
- ✓ Added 'leaderboard' to features table

### Backend Improvements
- ✓ Leaderboard caching already configured in app.js
- ✓ Automatic daily/weekly prize distribution
- ✓ Top 10 tracking with proper rewards
- ✓ Discord logging for winners

### Frontend Enhancements
- ✓ Renamed to "CLASH LEADERBOARD"
- ✓ Updated description: "showcases the top wagering users competing daily and weekly for amazing prizes! Climb the ranks and win $1,000+ IN WEEKLY REWARDS!"
- ✓ Modern UI with improved gradients, shadows, and hover effects
- ✓ Better banner styling with gold theme
- ✓ Enhanced podium animations (bronze → silver → gold)
- ✓ Confetti explosion on gold reveal (150+ particles)
- ✓ Victory sound effects
- ✓ Improved table layout with hover animations
- ✓ Better period selector buttons
- ✓ Fully responsive design for mobile
- ✓ Professional typography with Geogrotesque Wide font

### Animation Sequence
1. Page loads with 1s delay
2. "lets go gambling" audio plays
3. After 2.5s, podiums reveal:
   - Bronze appears (bounce effect)
   - Silver appears 1.5s later
   - Gold appears 1.5s later with:
     - 🎉 Confetti explosion
     - ✨ Screen flash
     - 🔊 Victory sound
     - 💫 Glow animation

## 🎁 Prize Structure

### Daily Leaderboard (24 hours)
- 🥇 1st: R$1,000
- 🥈 2nd: R$500
- 🥉 3rd: R$250
- 4th-10th: R$50 each

### Weekly Leaderboard (7 days)
- 🥇 1st: R$3,500
- 🥈 2nd: R$2,000
- 🥉 3rd: R$1,000
- 4th-10th: R$200 each

## 📊 How It Works

1. **Tracking**: Sums all completed bets (`bets.completed = 1`)
2. **Filtering**: Excludes banned users (`leaderboardBan = 0`) and non-users
3. **Ranking**: Top 10 by total wagered amount
4. **Caching**: Updates every 10 minutes
5. **Payout**: Automatic when period ends
6. **Logging**: Winners posted to Discord

## 🎨 UI Features

- **Banner**: Gold gradient with coin decorations
- **Timer**: Shows time remaining until reset
- **Period Toggle**: Switch between Daily/Weekly
- **Podiums**: Top 3 with medals and item rewards
- **Table**: Clean layout for positions 4-10
- **Responsive**: Mobile-friendly design
- **Animations**: Smooth transitions and effects

## 🔧 Admin Controls

### Enable/Disable
Check in admin panel or database:
```sql
SELECT * FROM features WHERE name = 'leaderboard';
```

### Ban User from Leaderboard
```sql
UPDATE users SET leaderboardBan = 1 WHERE id = ?;
```

### View Current Rankings
```sql
SELECT 
  SUM(bets.amount) as wagered,
  users.username
FROM bets
INNER JOIN users ON users.id = bets.userId
WHERE bets.completed = 1 
  AND users.leaderboardBan = 0
GROUP BY userId
ORDER BY wagered DESC
LIMIT 10;
```

## 📝 Files Modified

### Database
- `database/schema.sql` - Updated leaderboard tables
- `database/update-leaderboard-schema.js` - Migration script (NEW)

### Frontend
- `src/pages/leaderboard.jsx` - Complete UI overhaul

### Documentation
- `LEADERBOARD_SETUP.md` - Comprehensive guide (NEW)
- `LEADERBOARD_QUICKSTART.md` - This file (NEW)

### Testing
- `test-leaderboard.js` - Test script (NEW)

## 🐛 Troubleshooting

### No users showing?
- Ensure users have completed bets
- Check `leaderboardBan = 0`
- Verify `role = 'USER'`

### Prizes not paying?
- Check `enabledFeatures.leaderboard = true`
- Verify period has ended
- Check console logs

### UI not loading?
- Clear browser cache
- Check audio files exist in `/public/assets/sfx/`
- Check browser console for errors

## 📚 Full Documentation

See `LEADERBOARD_SETUP.md` for:
- Detailed configuration options
- API endpoints
- Maintenance tasks
- Advanced customization

## ✨ Summary

The leaderboard system is now **fully functional** with:
- ✅ Database properly configured
- ✅ Backend tracking and payouts working
- ✅ Modern, professional UI
- ✅ Smooth animations and effects
- ✅ Mobile responsive design
- ✅ Comprehensive documentation

Just run the migration script and start your server!
