const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendLog } = require('../../../utils');
const { sendDiscordLog } = require('../../../utils/discord-logger');
const { bannedUsers } = require('../../../routes/admin/config');

module.exports = {
    name: 'ban',
    description: 'Permanently ban a user',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, superAdmin, username FROM users WHERE id = ?', [socket.userId]);
        
        if (executor.perms < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        }

        const targetUsername = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!targetUsername) {
            return sendSystemMessage(socket, 'Usage: /ban <user> <reason>');
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

            if (target.banned) {
                return sendSystemMessage(socket, `@${target.username} is already banned.`);
            }

            await sql.query('UPDATE users SET banned = 1, tempBanUntil = NULL WHERE id = ?', [target.id]);
            
            // Add to bannedUsers cache
            bannedUsers.add(target.id);

            sendSystemMessage(socket, `✅ @${target.username} has been permanently banned. Reason: ${reason}`);
            sendLog('admin', `**${executor.username}** banned **${target.username}** (ID: \`${target.id}\`) - Reason: ${reason}`);
            
            // Force disconnect user
            io.to(target.id).emit('toast', 'error', `You have been banned. Reason: ${reason}`);
            io.in(target.id).disconnectSockets();

            // Discord log
            await sendDiscordLog('moderation', {
                command: '/ban',
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
                    'Type': 'Permanent Ban',
                    'Reason': reason
                },
                result: `${target.username} has been permanently banned`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error banning user.');
        }
    }
};
