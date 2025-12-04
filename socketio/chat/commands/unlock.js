const io = require('../../server');
const { sql } = require('../../../database');
const { sendSystemMessage, channels } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'unlock',
    description: 'Unlock the current channel',
    async execute(socket) {

        const [[user]] = await sql.query('SELECT perms FROM users WHERE id = ?', [socket.userId]);
        if (user.perms < 5) return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        channels[socket.channel].locked = false;
        sendSystemMessage(io.to(socket.channel), 'Channel unlocked.');

        // Discord log
        const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
        await sendDiscordLog('chat', {
            command: '/unlock',
            executor: {
                id: socket.userId,
                username: executorData.username,
                perms: executorData.perms
            },
            details: {
                'Channel': socket.channel
            },
            result: `${socket.channel} channel unlocked`
        });

    }
}