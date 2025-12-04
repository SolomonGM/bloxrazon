# 🚀 Quick Setup Guide - Discord Logging

## 1. Create Discord Channel (1 minute)

In your Discord server, create **one channel**:

```
#command-logs
```

That's it! All admin, moderation, and chat commands will log here.

## 2. Create Webhook (2 minutes)

1. Click ⚙️ next to **#command-logs** channel name
2. Go to **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Name it "Command Logger"
5. Click **Copy Webhook URL**
6. Save URL for next step

## 3. Configure .env File (30 seconds)

Add **ONE line** to your `.env` file:

```env
DISCORD_WEBHOOK_COMMANDS=YOUR_WEBHOOK_URL_HERE
```

**Replace** `YOUR_WEBHOOK_URL_HERE` with the webhook URL from step 2.

## 4. Restart Server (30 seconds)

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
node app.js
```

## 5. Test It! (1 minute)

Execute any admin/mod command:
```
/permission moderator testuser
```

Check your Discord `#command-logs` channel for the log!

---

## ✅ That's It!

Your Discord logging is now active. All successful admin and moderator commands will be logged here.

---

## What Gets Logged?

### All in #command-logs

**Admin Commands** (Blue):
- Permission changes
- Balance updates
- XP updates
- Promo code management

**Moderation Commands** (Red):
- Bans/unbans
- Temp bans
- Mutes/unmutes

**Chat Management** (Gray):
- Chat clears
- Message deletions
- Channel locks/unlocks

*Color-coded embeds make it easy to see command types at a glance!*

---

## Troubleshooting

**Logs not appearing?**
1. Check webhook URL is correct in `.env`
2. Verify webhook still exists in Discord
3. Look for "[WARNING]" in server console
4. Make sure you restarted the server after adding to `.env`

**Wrong channel?**
- The webhook URL determines the channel
- When you create a webhook in `#command-logs`, messages go there automatically
- If you want a different channel, create a new webhook in that channel

---

## Optional: Test Webhook First

Before integrating, test your webhook:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message from BloxClash"}'
```

If you see "Test message from BloxClash" in Discord, webhook is working!

---

## Command Changes Recap

**New Limits:**
- `/rain` - Now **R$5** minimum (was R$100)
- `/tip` - **No minimum** (was R$5)
- `/flex` - **No minimum**, **5min** cooldown (was R$100k min, 15min)

**New Syntax:**
- `/delete` - Now `/delete <user> <amount>` (was `/delete <messageId>`)

**New Behavior:**
- Users trying mod/admin commands → **silent** (no error)
- Mods trying admin commands → **silent** (no error)
- `/help` for mods → **only shows relevant commands**

---

## Files Changed

✅ 19 command files updated with Discord logging
✅ 3 documentation files created
✅ 1 new logging module added

**Server Status:** ✅ Running on port 3000

---

## Need Help?

Check these files:
- `DISCORD_LOGGING_SETUP.md` - Full setup guide
- `ADMIN_COMMANDS.md` - Command reference
- `IMPLEMENTATION_SUMMARY.md` - Complete change log
