const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendLog } = require('../../../utils');
const { sendDiscordLog } = require('../../../utils/discord-logger');
const { bannedUsers } = require('../../../routes/admin/config');

module.exports = {
    name: 'tempban',
    description: 'Temporarily ban a user',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, superAdmin, username FROM users WHERE id = ?', [socket.userId]);
        
        if (executor.perms < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        }

        const targetUsername = args[0];
        const hours = parseInt(args[1]);
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!targetUsername || !hours || isNaN(hours) || hours <= 0) {
            return sendSystemMessage(socket, 'Usage: /tempban <user> <hours> <reason>');
        }

        try {
            const [[target]] = await sql.query('SELECT id, username, superAdmin, perms, banned FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);

            if (!target) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            if (target.superAdmin) {
                return sendSystemMessage(socket, 'Cannot ban super admin.');
            }

            if (target.perms >= executor.perms && !executor.superAdmin) {
                return sendSystemMessage(socket, 'Cannot ban users with equal or higher permissions.');
            }

            // Check if tempBanUntil column exists, if not create it
            try {
                await sql.query('SELECT tempBanUntil FROM users LIMIT 1');
            } catch (e) {
                await sql.query('ALTER TABLE users ADD COLUMN tempBanUntil TIMESTAMP NULL DEFAULT NULL');
            }

            const tempBanUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

            await sql.query('UPDATE users SET banned = 1, tempBanUntil = ? WHERE id = ?', [tempBanUntil, target.id]);
            
            // Add to bannedUsers cache
            bannedUsers.add(target.id);

            sendSystemMessage(socket, `✅ @${target.username} has been banned for ${hours} hours. Reason: ${reason}`);
            sendLog('admin', `**${executor.username}** temp-banned **${target.username}** (ID: \`${target.id}\`) for ${hours}h - Reason: ${reason}`);
            
            // Force disconnect user
            io.to(target.id).emit('toast', 'error', `You have been banned for ${hours} hours. Reason: ${reason}`);
            io.in(target.id).disconnectSockets();

            // Discord log
            await sendDiscordLog('moderation', {
                command: '/tempban',
                executor: {
                    id: socket.userId,
                    username: executor.username,
                    perms: executor.perms
                },
                target: {
                    id: target.id,
                    username: target.username
                },
                details: {
                    'Type': 'Temporary Ban',
                    'Duration': `${hours} hours`,
                    'Expires At': tempBanUntil.toISOString(),
                    'Reason': reason
                },
                result: `${target.username} has been banned for ${hours} hours`
            });

            // Set auto-unban
            setTimeout(async () => {
                try {
                    await sql.query('UPDATE users SET banned = 0, tempBanUntil = NULL WHERE id = ? AND tempBanUntil <= NOW()', [target.id]);
                    bannedUsers.delete(target.id);
                    sendLog('admin', `**${target.username}**'s temporary ban has expired.`);
                } catch (err) {
                    console.error('Error auto-unbanning:', err);
                }
            }, hours * 60 * 60 * 1000);

        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error banning user.');
        }
    }
};
