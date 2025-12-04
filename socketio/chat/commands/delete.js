const io = require('../../server');
const { sql } = require('../../../database');
const { sendSystemMessage, channels } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'delete',
    description: 'Delete a user\'s past messages',
    async execute(socket, args) {

        const [[user]] = await sql.query('SELECT id, perms FROM users WHERE id = ?', [socket.userId]);
        if (user.perms < 5) return sendSystemMessage(socket, 'Insufficient permissions. Moderator+ only.');

        const targetUsername = args[0];
        const amount = parseInt(args[1]);

        if (!targetUsername || !amount || isNaN(amount) || amount < 1) {
            return sendSystemMessage(socket, 'Usage: /delete <user> <amount>');
        }

        try {
            const [[targetUser]] = await sql.query('SELECT id, username FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);
            
            if (!targetUser) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            const channel = socket.channel;
            const channelMessages = channels[channel].messages;
            
            // Find messages from target user
            const userMessages = channelMessages
                .filter(msg => msg.user && msg.user.id === targetUser.id)
                .slice(-amount); // Get last X messages
            
            if (userMessages.length === 0) {
                return sendSystemMessage(socket, `No messages found from @${targetUser.username} in this channel.`);
            }

            const messageIds = userMessages.map(msg => msg.id);
            
            // Delete from database
            await sql.query('UPDATE chatMessages SET deletedAt = NOW() WHERE id IN (?)', [messageIds]);
            
            // Remove from channel
            channels[channel].messages = channelMessages.filter(msg => !messageIds.includes(msg.id));

            // Emit deletion to clients
            messageIds.forEach(id => io.to(channel).emit('chat:deleteMessage', id));

            sendSystemMessage(socket, `✅ Deleted ${userMessages.length} message(s) from @${targetUser.username}`);

            // Discord log
            const [[executorData]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
            await sendDiscordLog('chat', {
                command: '/delete',
                executor: {
                    id: socket.userId,
                    username: executorData.username,
                    perms: executorData.perms
                },
                target: {
                    id: targetUser.id,
                    username: targetUser.username
                },
                details: {
                    'Channel': channel,
                    'Messages Deleted': userMessages.length,
                    'Requested Amount': amount
                },
                result: `Deleted ${userMessages.length} message(s) from ${targetUser.username}`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error deleting messages.');
        }

    }
}