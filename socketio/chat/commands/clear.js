const io = require('../../server');
const { sql } = require('../../../database');
const { sendSystemMessage, newMessage, channels } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'clear',
    description: 'Clear the current channel',
    async execute(socket) {

        const [[user]] = await sql.query('SELECT id, perms FROM users WHERE id = ?', [socket.userId]);
        if (user.perms < 5) return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');

        const [result] = await sql.query('INSERT INTO chatMessages(type, senderId, channelId) VALUES (?, ?, ?)', ['clear', user.id, socket.channel]);

        io.to(socket.channel).emit('chat:clear', { cleared: true });
        channels[socket.channel].messages = [];

        newMessage({
            id: result.insertId,
            type: 'system',
            content: 'Chat cleared.',
            createdAt: Date.now(),
            replyTo: null,
            user: null
        }, socket.channel)

        // Discord log
        const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
        await sendDiscordLog('chat', {
            command: '/clear',
            executor: {
                id: socket.userId,
                username: executorData.username,
                perms: executorData.perms
            },
            details: {
                'Channel': socket.channel
            },
            result: `Chat cleared in ${socket.channel} channel`
        });

    }
}