const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const { sendLog } = require('../../../utils');
const { sendDiscordLog } = require('../../../utils/discord-logger');
const { bannedUsers } = require('../../../routes/admin/config');

module.exports = {
    name: 'unban',
    description: 'Unban a user',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, username FROM users WHERE id = ?', [socket.userId]);
        
        if (executor.perms < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        }

        const targetUsername = args[0];

        if (!targetUsername) {
            return sendSystemMessage(socket, 'Usage: /unban <user>');
        }

        try {
            const [[target]] = await sql.query('SELECT id, username, banned FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);

            if (!target) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            if (!target.banned) {
                return sendSystemMessage(socket, `@${target.username} is not banned.`);
            }

            await sql.query('UPDATE users SET banned = 0, tempBanUntil = NULL WHERE id = ?', [target.id]);
            
            // Remove from bannedUsers cache
            bannedUsers.delete(target.id);

            sendSystemMessage(socket, `✅ @${target.username} has been unbanned.`);
            sendLog('admin', `**${executor.username}** unbanned **${target.username}** (ID: \`${target.id}\`)`);

            // Discord log
            await sendDiscordLog('moderation', {
                command: '/unban',
                executor: {
                    id: socket.userId,
                    username: executor.username,
                    perms: executor.perms
                },
                target: {
                    id: target.id,
                    username: target.username
                },
                result: `${target.username} has been unbanned`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error unbanning user.');
        }
    }
};
