# Discord Logging System Setup Guide

## Overview
This system logs all successful admin and moderator command executions to Discord webhooks with detailed information including executor, target, command details, and results.

---

## Discord Server Channel Structure

Create a category called **📊 ADMIN LOGS** with the following channels:

### 1. `#admin-commands`
**Purpose:** Logs all admin-level commands (perms >= 10)
- `/permission` - Permission changes
- `/balanceupdate` - Balance modifications
- `/xp` - XP modifications
- `/promocode` - Promo code creation
- `/removepromo` - Promo code deletion

**Color:** Blue (0x3498db)

### 2. `#moderation-logs`
**Purpose:** Logs all moderation actions (perms >= 5)
- `/ban` - Permanent bans
- `/unban` - Ban removals
- `/tempban` - Temporary bans
- `/mute` - User mutes
- `/unmute` - User unmutes

**Color:** Red (0xe74c3c)

### 3. `#chat-management`
**Purpose:** Logs chat management commands (perms >= 5)
- `/clear` - Channel clears
- `/delete` - Message deletions
- `/lock` - Channel locks
- `/unlock` - Channel unlocks

**Color:** Gray (0x95a5a6)

---

## Webhook Setup

### Step 1: Create Webhooks in Discord

For each channel:
1. Click the **⚙️ Settings** icon next to the channel name
2. Navigate to **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Name the webhook (e.g., "Admin Command Logger")
5. Optional: Upload a custom avatar
6. Click **Copy Webhook URL**
7. Save this URL for the next step

### Step 2: Configure Environment Variables

Add the following to your `.env` file:

```env
# Discord Webhook URLs for logging
DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/YOUR_ADMIN_WEBHOOK_URL
DISCORD_WEBHOOK_MODERATION=https://discord.com/api/webhooks/YOUR_MODERATION_WEBHOOK_URL
DISCORD_WEBHOOK_CHAT=https://discord.com/api/webhooks/YOUR_CHAT_WEBHOOK_URL
```

Replace the placeholder URLs with your actual webhook URLs from Step 1.

---

## Log Format

Each log contains:

### Embed Structure
```
🔧 [Command Name]

👤 Executor
Username (ID: 123456)
Perms: 10

🎯 Target (if applicable)
Username (ID: 789012)

📋 Details
Key: Value pairs specific to the command

✅ Result
Success message describing the action
```

### Example Log: `/permission moderator john`
```
🔧 /permission

👤 Executor
sully (ID: 1)
Perms: 10

🎯 Target
john (ID: 42)

📋 Details
New Rank: moderator
New Perms: 5
Previous Perms: 0

✅ Result
Successfully updated john to moderator

⏰ Command executed at
2025-11-19T10:30:45.123Z
```

---

## Command Logging Details

### Admin Commands

**`/permission <rank> <user>`**
- Executor info (id, username, perms)
- Target info (id, username)
- New rank, new perms, previous perms
- Result message

**`/balanceupdate <user> <amount>`**
- Executor info
- Target info
- Amount (with + or - prefix)
- Previous balance, new balance
- Result message

**`/xp <user> <amount>`**
- Executor info
- Target info
- Amount (with + or - prefix)
- Previous XP, new XP
- Result message

**`/promocode <amount> <code> <hours>`**
- Executor info
- Code, amount, duration in hours
- Expiration timestamp
- Result message

**`/removepromo <code>`**
- Executor info
- Code that was deleted
- Result message

### Moderation Commands

**`/ban <user> <reason>`**
- Executor info
- Target info
- Ban type (Permanent)
- Reason
- Result message

**`/unban <user>`**
- Executor info
- Target info
- Result message

**`/tempban <user> <hours> <reason>`**
- Executor info
- Target info
- Ban type (Temporary)
- Duration in hours
- Expiration timestamp
- Reason
- Result message

**`/mute <user> <seconds>`**
- Executor info
- Target info
- Duration in seconds
- Expiration timestamp
- Result message

**`/unmute <user>`**
- Executor info
- Target info
- Result message

### Chat Management Commands

**`/clear`**
- Executor info
- Channel name
- Result message

**`/delete <user> <amount>`**
- Executor info
- Target info
- Channel name
- Messages deleted count
- Requested amount
- Result message

**`/lock`**
- Executor info
- Channel name
- Result message

**`/unlock`**
- Executor info
- Channel name
- Result message

---

## Important Notes

1. **Only Successful Commands Are Logged**
   - Failed attempts (insufficient permissions, invalid targets, etc.) are NOT logged
   - Users trying commands they don't have access to won't generate logs

2. **Permission Silencing**
   - Users attempting moderator commands without perms: silently ignored
   - Moderators attempting admin commands: silently ignored
   - No "invalid command" messages sent to chat

3. **Webhook Requirements**
   - Webhooks must be created in Discord first
   - Environment variables must be set in `.env`
   - If webhook is not configured, a warning is logged to console but doesn't break functionality

4. **Testing**
   - Test webhooks using a simple message first
   - Execute a command and verify it appears in the correct Discord channel
   - Check console for any webhook errors

---

## Troubleshooting

**Logs not appearing in Discord:**
- Verify webhook URLs are correct in `.env`
- Check webhook hasn't been deleted in Discord
- Ensure server has internet access
- Check console for webhook errors

**Wrong channel receiving logs:**
- Verify you're using the correct webhook URL for each category
- Check the command is mapped to the correct channel in `discord-logger.js`

**Missing information in logs:**
- Ensure database queries are returning expected data
- Check console for SQL errors
- Verify all fields are being passed to `sendDiscordLog()`

---

## Future Enhancements

Potential additions to the logging system:
- User report channel for failed admin command attempts
- Audit log for manual database changes
- Daily summary reports
- Suspicious activity alerts
- Integration with Discord bot for admin commands
- Search functionality across logs

---

## File Locations

- **Logger Module:** `utils/discord-logger.js`
- **Commands:** `socketio/chat/commands/*.js`
- **Setup Guide:** This file (`DISCORD_LOGGING_SETUP.md`)

---

## Security Considerations

1. **Webhook Protection**
   - Never commit webhook URLs to Git
   - Store in `.env` file (add to `.gitignore`)
   - Rotate webhooks if compromised

2. **Log Privacy**
   - Contains user IDs and usernames
   - Restrict Discord channel access to trusted staff
   - Consider data retention policies

3. **Rate Limiting**
   - Discord webhooks have rate limits (30 requests per 60 seconds)
   - Current implementation doesn't queue
   - Consider adding rate limit handling for high-volume sites

---

## Support

For issues or questions:
1. Check console logs for errors
2. Verify `.env` configuration
3. Test webhooks with simple messages
4. Review command execution flow
