const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'mute',
    description: 'Mute a user',
    async execute(socket, args) {

        const [[user]] = await sql.query('SELECT id, perms, superAdmin FROM users WHERE id = ?', [socket.userId]);
        
        if (user.perms < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        }

        let toId = args[0];
        if (!toId || toId.length > 32 || toId.length < 3 || !/^[A-Za-z0-9_]*$/.test(toId)) {
            return sendSystemMessage(socket, 'Invalid username.');
        }

        const [[toUser]] = await sql.query('SELECT id, username, perms, superAdmin FROM users WHERE username = ? OR id = ? LIMIT 1', [toId, toId]);
        if (!toUser) return sendSystemMessage(socket, 'User not found.');

        if (toUser.id == user.id) return sendSystemMessage(socket, 'You can\'t mute yourself.');
        
        if (toUser.superAdmin) {
            return sendSystemMessage(socket, 'Cannot mute super admin.');
        }
        
        if (toUser.perms >= user.perms && !user.superAdmin) {
            return sendSystemMessage(socket, 'Cannot mute users with equal or higher permissions.');
        }

        let duration = parseInt(args[1]);
        if (!duration || isNaN(duration) || !Number.isInteger(duration) || duration < 1 || duration > 315400000) {
            return sendSystemMessage(socket, 'Invalid duration in seconds.');
        }
        
        await sql.query('UPDATE users SET mutedUntil = ? WHERE id = ?', [new Date(Date.now() + duration * 1000), toUser.id]);

        sendSystemMessage(socket, `✅ You muted @${toUser.username} for ${duration} seconds.`);
        sendSystemMessage(io.to(toUser.id), `You were muted for ${duration} seconds.`);

        // Discord log
        const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
        await sendDiscordLog('moderation', {
            command: '/mute',
            executor: {
                id: socket.userId,
                username: executorData.username,
                perms: executorData.perms
            },
            target: {
                id: toUser.id,
                username: toUser.username
            },
            details: {
                'Duration': `${duration} seconds`,
                'Expires At': new Date(Date.now() + duration * 1000).toISOString()
            },
            result: `${toUser.username} has been muted for ${duration} seconds`
        });
        
    }
}