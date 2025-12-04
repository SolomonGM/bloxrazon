# Admin Command System - Complete Guide

## Permission Hierarchy
- **Super Admin** (superAdmin = 1) - Cannot be modified, full access to everything
- **Admin** (perms = 10) - Can grant any rank, manage codes, update balances/XP
- **Manager** (perms = 8) - Can grant moderator rank, moderate users
- **Moderator** (perms = 5) - Can ban/mute/manage chat
- **User** (perms = 0) - Regular user

---

## User Commands

### `/redeem <code>`
Redeem a promo code created by admins.
- **Permission**: All users
- **Example**: `/redeem WELCOME100`
- **Features**: 
  - One-time redemption per user
  - Automatically checks expiration
  - Credits balance instantly

---

## Moderator Commands (perms >= 5)

### `/mute <user> <seconds>`
Temporarily mute a user from chat.
- **Permission**: Moderator+
- **Example**: `/mute john 3600` (mute for 1 hour)
- **Features**:
  - Cannot mute users with equal or higher permissions
  - Cannot mute super admins
  - Duration in seconds
  - **Discord Log**: Moderation channel

### `/unmute <user>`
Remove mute from a user.
- **Permission**: Moderator+
- **Example**: `/unmute john`
- **Discord Log**: Moderation channel

### `/ban <user> <reason>`
Permanently ban a user.
- **Permission**: Moderator+
- **Example**: `/ban john Cheating detected`
- **Features**:
  - Cannot ban users with equal or higher permissions
  - Cannot ban super admins
  - Logs to admin channel
  - Immediately disconnects user
  - **Discord Log**: Moderation channel

### `/unban <user>`
Remove permanent ban from a user.
- **Permission**: Moderator+
- **Example**: `/unban john`
- **Features**: Logs to admin channel
- **Discord Log**: Moderation channel

### `/tempban <user> <hours> <reason>`
Temporarily ban a user.
- **Permission**: Moderator+
- **Example**: `/tempban john 48 Spam in chat`
- **Features**:
  - Auto-unbans after duration expires
  - Cannot ban users with equal or higher permissions
  - Cannot ban super admins
  - Immediately disconnects user
  - **Discord Log**: Moderation channel

### `/clear`
Clear all messages in current channel.
- **Permission**: Moderator+
- **Example**: `/clear`
- **Discord Log**: Chat management channel

### `/delete <user> <amount>`
Delete a user's past X messages.
- **Permission**: Moderator+
- **Example**: `/delete john 5` (delete john's last 5 messages)
- **Discord Log**: Chat management channel

### `/lock`
Lock current channel (prevents regular users from sending messages).
- **Permission**: Moderator+
- **Example**: `/lock`
- **Discord Log**: Chat management channel

### `/unlock`
Unlock current channel.
- **Permission**: Moderator+
- **Example**: `/unlock`
- **Discord Log**: Chat management channel

---

## Admin Commands (perms >= 10)

### `/promocode <amount> <code> <hours>`
Create a promotional code.
- **Permission**: Admin only
- **Example**: `/promocode 500 LAUNCH24 48`
- **Creates**: R$500 code "LAUNCH24" valid for 48 hours
- **Features**:
  - One-time redemption per user
  - Auto-expires after time limit
  - Code stored in database with creator tracking
  - **Discord Log**: Admin channel

### `/removepromo <code>`
Delete a promotional code.
- **Permission**: Admin only
- **Example**: `/removepromo LAUNCH24`
- **Discord Log**: Admin channel

### `/permission <rank> <user>`
Grant permissions to a user.
- **Permission**: Admin+ (rank-dependent)
- **Ranks**: admin, manager, moderator, user
- **Examples**: 
  - `/permission admin mike` (requires admin perms)
  - `/permission moderator sarah` (requires manager+ perms)
- **Features**:
  - Cannot modify super admins
  - Cannot grant higher rank than your own
  - Updates role and perms fields
  - Notifies target user
  - **Discord Log**: Admin channel

### `/balanceupdate <user> <amount>`
Add or remove balance from a user.
- **Permission**: Admin only
- **Examples**:
  - `/balanceupdate john 1000` (add R$1000)
  - `/balanceupdate john -500` (remove R$500)
- **Features**:
  - Logs to admin channel
  - Notifies user
  - Updates balance in real-time
  - Cannot go below 0
  - **Discord Log**: Admin channel

### `/xp <user> <amount>`
Add or remove XP from a user.
- **Permission**: Admin only
- **Examples**:
  - `/xp john 5000` (add 5000 XP)
  - `/xp john -1000` (remove 1000 XP)
- **Features**:
  - Logs to admin channel
  - Notifies user
  - Updates XP in real-time
  - Cannot go below 0
  - **Discord Log**: Admin channel

---

## User Command Updates

### `/tip <user> <amount>`
- **Updated**: No minimum amount (but cannot be 0)
- **Example**: `/tip john 1` (now works!)

### `/rain <amount>`
- **Updated**: Minimum R$5 (was R$100)
- **Example**: `/rain 5` (now works!)

### `/flex`
- **Updated**: No minimum balance required, 5-minute cooldown (was R$100k min, 15min cooldown)
- **Example**: `/flex` (works with any balance!)

---

## Permission Silencing

Users attempting commands they don't have access to will be **silently ignored**:
- Regular users trying `/ban` → no message
- Moderators trying `/balanceupdate` → no message

This prevents command discovery and reduces chat spam.

---

## Discord Logging System

All successful admin and moderator commands are logged to Discord webhooks with detailed information:

### Log Channels
1. **#admin-commands** - Permission, balance, XP, promo codes
2. **#moderation-logs** - Bans, unbans, tempbans, mutes, unmutes
3. **#chat-management** - Clear, delete, lock, unlock

### Setup Required
Add to your `.env` file:
```env
DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_WEBHOOK_MODERATION=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_WEBHOOK_CHAT=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

See `DISCORD_LOGGING_SETUP.md` for complete setup instructions.

### Log Format
Each log contains:
- 👤 **Executor** (username, ID, permission level)
- 🎯 **Target** (if applicable)
- 📋 **Details** (command-specific info)
- ✅ **Result** (success message)
- ⏰ **Timestamp**

**Note**: Only successful commands are logged. Failed attempts are not logged.

---

## Permission Notes

1. **Super Admins**:
   - Set via database: `UPDATE users SET superAdmin = 1 WHERE username = 'username'`
   - Cannot be modified by any command
   - Can perform all actions regardless of permission checks

2. **Hierarchy Enforcement**:
   - Cannot mute/ban/modify users with equal or higher permissions
   - Super admins bypass all hierarchy checks
   - Admin rank can only be granted by admins
   - Manager rank can only be granted by admins
   - Moderator rank can be granted by managers or admins

3. **Permission Levels**:
   - 0 = Regular user
   - 5 = Moderator
   - 8 = Manager
   - 10 = Admin
   - 100 (effective) = Super Admin

---

## Database Tables

### `promoCodes`
- `id` (INT, PRIMARY KEY)
- `code` (VARCHAR 50, UNIQUE)
- `amount` (DECIMAL)
- `createdBy` (INT, FK to users)
- `expiresAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)

### `promoRedemptions`
- `id` (INT, PRIMARY KEY)
- `userId` (INT, FK to users)
- `promoId` (INT, FK to promoCodes)
- `redeemedAt` (TIMESTAMP)
- **UNIQUE**: (userId, promoId) - prevents duplicate redemptions

### `users` (new columns)
- `superAdmin` (BOOLEAN) - Cannot be modified via commands
- `tempBanUntil` (TIMESTAMP) - Auto-unban time for temporary bans

---

## Setup Complete

✅ All 13 admin/moderator commands created
✅ Permission hierarchy enforced
✅ Database tables created
✅ Super admin system active
✅ User "sully" marked as super admin
✅ /help command updated with role-based display
✅ Discord logging system implemented
✅ User command limits updated (rain R$5, no tip min, flex no min)
✅ /delete command updated to delete user's past X messages
✅ Moderators see only user + moderator commands in /help
✅ Permission silencing implemented (no invalid command spam)

**Current Super Admin**: sully
