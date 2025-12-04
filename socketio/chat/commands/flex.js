const { doTransaction } = require('../../../database');
const { sendSystemMessage, newMessage } = require('../functions');

module.exports = {
    name: 'flex',
    description: 'Flex your balance',
    async execute(socket) {

        try {

            await doTransaction(async (connection, commit) => {

                const [[user]] = await connection.query('SELECT id, username, role, xp, balance FROM users WHERE id = ? FOR UPDATE', [socket.userId]);
    
                const [[lastFlex]] = await connection.query('SELECT createdAt FROM chatMessages WHERE senderId = ? AND type = ? ORDER BY id DESC LIMIT 1 FOR UPDATE', [user.id, 'flex']);
                if (lastFlex && lastFlex.createdAt > Date.now() - 60000 * 5) return sendSystemMessage(socket, 'You can only flex once every 5 minutes.');
    
                const flexMessage = `${user.username} has R$${user.balance}`;
                const [result] = await connection.query('INSERT INTO chatMessages(type, senderId, content, channelId) VALUES (?, ?, ?, ?)', ['flex', user.id, flexMessage, socket.channel]);
                await commit();

                newMessage({
                    id: result.insertId,
                    content: flexMessage,
                    type: 'flex',
                    createdAt: Date.now(),
                    replyTo: null,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        xp: user.xp
                    }
                }, socket.channel)

            });
        
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'An error occurred.');
        }
        
    }
}