const axios = require('axios');

// Discord Webhook URL - Configure this in your .env file
// Create ONE webhook in your #command-logs channel and paste the URL here
const discordWebhook = process.env.DISCORD_WEBHOOK_COMMANDS;

/**
 * Send a detailed log to Discord
 * @param {string} channel - The log channel (admin, moderation, chat)
 * @param {object} data - Log data
 * @param {string} data.command - The command that was executed
 * @param {object} data.executor - User who executed the command
 * @param {string} data.executor.id - Executor user ID
 * @param {string} data.executor.username - Executor username
 * @param {number} data.executor.perms - Executor permission level
 * @param {object} [data.target] - Target user (if applicable)
 * @param {string} [data.target.id] - Target user ID
 * @param {string} [data.target.username] - Target username
 * @param {object} [data.details] - Additional command-specific details
 * @param {string} [data.result] - Result/success message
 */
async function sendDiscordLog(channel, data) {
    
    if (!discordWebhook) {
        console.log(`[WARNING] Discord webhook not configured. Set DISCORD_WEBHOOK_COMMANDS in .env`);
        return;
    }

    // Build embed color based on command type
    const colors = {
        admin: 0x3498db, // Blue
        moderation: 0xe74c3c, // Red
        chat: 0x95a5a6, // Gray
    };

    // Determine rank badge based on perms
    const getRankBadge = (perms) => {
        if (perms >= 10) return '👑 Admin';
        if (perms >= 8) return '⭐ Manager';
        if (perms >= 5) return '🛡️ Moderator';
        return '👤 User';
    };

    // Build the embed fields
    const fields = [];

    // Executor field with rank badge
    fields.push({
        name: '━━━━━━━━━━━━━━━━━━━━',
        value: `**👤 EXECUTOR**\n\`\`\`yaml\nUsername: ${data.executor.username}\nUser ID: ${data.executor.id}\nRank: ${getRankBadge(data.executor.perms)}\nPermission Level: ${data.executor.perms}\n\`\`\``,
        inline: false
    });

    // Target field if applicable
    if (data.target) {
        fields.push({
            name: '🎯 TARGET USER',
            value: `\`\`\`yaml\nUsername: ${data.target.username}\nUser ID: ${data.target.id}\n\`\`\``,
            inline: false
        });
    }

    // Add command-specific details
    if (data.details) {
        const detailsText = Object.entries(data.details)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        fields.push({
            name: '📋 COMMAND DETAILS',
            value: `\`\`\`yaml\n${detailsText}\n\`\`\``,
            inline: false
        });
    }

    if (data.result) {
        fields.push({
            name: '━━━━━━━━━━━━━━━━━━━━',
            value: `✅ **${data.result}**`,
            inline: false
        });
    }

    // Get command type label
    const commandTypeLabel = channel === 'admin' ? '🔐 ADMIN' : channel === 'moderation' ? '⚔️ MODERATION' : '💬 CHAT';

    // Build the embed
    const embed = {
        title: `\`${data.command}\``,
        description: `${commandTypeLabel} • Command executed by **${data.executor.username}**`,
        color: colors[channel] || 0x95a5a6,
        fields: fields,
        timestamp: new Date().toISOString(),
        footer: {
            text: `BloxRazon Command Logs • Executed at`,
            icon_url: 'https://cdn.discordapp.com/emojis/1234567890.png' // Optional: Add your site logo
        }
    };

    // Send to Discord
    try {
        await axios.post(discordWebhook, {
            embeds: [embed]
        });
    } catch (e) {
        console.error(`[ERROR] Failed to send Discord log:`, e.message);
    }
}

/**
 * Quick log helper for simple messages
 * @param {string} channel - The log channel (ignored, kept for compatibility)
 * @param {string} message - Plain text message
 */
async function sendSimpleDiscordLog(channel, message) {
    if (!discordWebhook) {
        console.log(`[WARNING] Discord webhook not configured. Set DISCORD_WEBHOOK_COMMANDS in .env`);
        return;
    }

    try {
        await axios.post(discordWebhook, {
            content: message
        });
    } catch (e) {
        console.error(`[ERROR] Failed to send Discord log:`, e.message);
    }
}

module.exports = {
    sendDiscordLog,
    sendSimpleDiscordLog
};
