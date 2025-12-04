const { sql } = require('../../../database');
const io = require('../../server');
const { sendSystemMessage } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',
    async execute(socket, args) {

        const [[user]] = await sql.query('SELECT id, perms, superAdmin FROM users WHERE id = ?', [socket.userId]);
        
        if (user.perms < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        }

        let toId = args[0];
        if (!toId || toId.length > 32 || toId.length < 3 || !/^[A-Za-z0-9]*$/.test(toId)) {
            return sendSystemMessage(socket, 'Invalid username.');
        }

        const [[toUser]] = await sql.query('SELECT id, username, perms, superAdmin FROM users WHERE username = ? OR id = ? LIMIT 1', [toId, toId]);
        if (!toUser) return sendSystemMessage(socket, 'User not found.');

        if (toUser.id == user.id) return sendSystemMessage(socket, 'You can\'t unmute yourself.');
        
        if (toUser.perms >= user.perms && !user.superAdmin) {
            return sendSystemMessage(socket, 'Cannot unmute users with equal or higher permissions.');
        }

        await sql.query('UPDATE users SET mutedUntil = ? WHERE id = ?', [null, toUser.id]);

        sendSystemMessage(socket, `✅ You unmuted @${toUser.username}.`);
        sendSystemMessage(io.to(toUser.id), `You were unmuted.`);

        // Discord log
        const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
        await sendDiscordLog('moderation', {
            command: '/unmute',
            executor: {
                id: socket.userId,
                username: executorData.username,
                perms: executorData.perms
            },
            target: {
                id: toUser.id,
                username: toUser.username
            },
            result: `${toUser.username} has been unmuted`
        });
        
    }
}