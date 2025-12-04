const io = require('../../server');
const { sql } = require('../../../database');
const { sendSystemMessage, channels } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'lock',
    description: 'Lock the current channel',
    async execute(socket) {

        const [[user]] = await sql.query('SELECT perms FROM users WHERE id = ?', [socket.userId]);
        if (user.perms < 5) return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');
        channels[socket.channel].locked = true;
        sendSystemMessage(io.to(socket.channel), 'Channel locked.');

        // Discord log
        const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
        await sendDiscordLog('chat', {
            command: '/lock',
            executor: {
                id: socket.userId,
                username: executorData.username,
                perms: executorData.perms
            },
            details: {
                'Channel': socket.channel
            },
            result: `${socket.channel} channel locked`
        });
        
    }
}