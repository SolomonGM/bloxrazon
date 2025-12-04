# 🎲 COINFLIP - QUICK SETUP GUIDE

## 🚀 Get Coinflip Running in 3 Steps

### Step 1: Update Database (Required)

Run this command to add missing columns:
```bash
node database/update-coinflip-schema.js
```

**What it does:**
- Adds `ownerId` column
- Adds `startedAt` column
- Creates foreign key constraints

### Step 2: Verify Setup

Run verification to ensure everything is correct:
```bash
node database/verify-coinflip-setup.js
```

**You should see:**
```
✓ coinflips table exists
✓ id (int)
✓ ownerId (int)
✓ fire (int)
✓ ice (int)
✓ amount (decimal)
✓ winnerSide (enum)
✓ startedAt (timestamp)
... (and more)
```

### Step 3: Restart Server

```bash
# Backend
npm run dev

# Frontend (separate terminal)
cd client
npm run dev
```

---

## 🧪 Testing

### Quick Test (Manual):

1. Open browser to `http://localhost:5173/coinflips`
2. Click "CREATE NEW"
3. Choose fire/ice side
4. Set amount (e.g., 100 Robux)
5. Click CREATE
6. Open incognito/another account
7. Click JOIN on your game
8. Watch the animation!

### Automated Test:

Edit `test-coinflip-flow.js` and add your test tokens:
```javascript
const TEST_USERS = {
    user1: {
        token: 'YOUR_TEST_TOKEN_1',
        userId: 1
    },
    user2: {
        token: 'YOUR_TEST_TOKEN_2',
        userId: 2
    }
};
```

Then run:
```bash
node test-coinflip-flow.js
```

---

## 🔍 Troubleshooting

### Problem: "Column 'ownerId' doesn't exist"
**Solution**: Run `node database/update-coinflip-schema.js`

### Problem: "Column 'startedAt' doesn't exist"
**Solution**: Run `node database/update-coinflip-schema.js`

### Problem: "No bot available"
**Solution**: Create a bot user in database:
```sql
INSERT INTO users (username, role) VALUES ('CoinflipBot', 'BOT');
```

### Problem: "INSUFFICIENT_BALANCE"
**Solution**: Give test users balance:
```sql
UPDATE users SET balance = 10000 WHERE id = YOUR_USER_ID;
```

### Problem: "Feature disabled"
**Solution**: Enable in admin config:
```sql
UPDATE features SET enabled = 1 WHERE name = 'coinflip';
```

### Problem: Game doesn't start
**Solution**: 
- Check EOS blockchain connection
- Check server logs for errors
- Verify both users joined successfully

---

## 📊 Quick Reference

### Minimum Bet: 1 Robux (backend) / 50 Robux (UI shows)
### Maximum Bet: 20,000 Robux
### House Edge: 5% (winner gets 2x × 0.95)
### Game Duration: ~11 seconds animation
### Provably Fair: EOS Blockchain + HMAC-SHA256

### API Endpoints:
- `POST /coinflip/create` - Create game
- `POST /coinflip/:id/join` - Join game
- `POST /coinflip/:id/bot` - Call bot (owner only)

### Socket.io Events:
- `coinflip:subscribe` - Subscribe to updates
- `coinflips:push` - Receive games list
- `coinflip:join` - User joined
- `coinflip:commit` - EOS block set
- `coinflip:started` - Game completed

---

## ✅ Checklist

Before going live, verify:

- [ ] Database schema updated
- [ ] Verification script passes
- [ ] Can create a game
- [ ] Can join a game
- [ ] Bot join works
- [ ] Winner gets paid correctly
- [ ] Balance updates in real-time
- [ ] Animations play correctly
- [ ] Provably fair data shows
- [ ] Error handling works
- [ ] Feature toggle works
- [ ] Socket events working
- [ ] XP awards correctly

---

## 🎉 You're Done!

Coinflip is now ready for production!

For detailed documentation, see: `COINFLIP_COMPLETE.md`

For issues or questions, check the audit report in `COINFLIP_COMPLETE.md`
