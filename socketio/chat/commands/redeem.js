const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');

module.exports = {
    name: 'redeem',
    description: 'Redeem a promo code',
    async execute(socket, args) {

        const code = args[0]?.toUpperCase();

        if (!code) {
            return sendSystemMessage(socket, 'Usage: /redeem <code>');
        }

        try {
            // Find the promo code
            const [[promo]] = await sql.query(
                'SELECT id, amount, expiresAt FROM promoCodes WHERE code = ?',
                [code]
            );

            if (!promo) {
                return sendSystemMessage(socket, 'Invalid promo code.');
            }

            // Check if expired
            if (new Date(promo.expiresAt) < new Date()) {
                return sendSystemMessage(socket, 'This promo code has expired.');
            }

            // Check if already redeemed by this user
            const [[redeemed]] = await sql.query(
                'SELECT id FROM promoRedemptions WHERE userId = ? AND promoId = ?',
                [socket.userId, promo.id]
            );

            if (redeemed) {
                return sendSystemMessage(socket, 'You have already redeemed this promo code.');
            }

            // Redeem the code
            await sql.query('INSERT INTO promoRedemptions (userId, promoId) VALUES (?, ?)', [socket.userId, promo.id]);
            await sql.query('UPDATE users SET balance = balance + ? WHERE id = ?', [promo.amount, socket.userId]);

            // Get new balance
            const [[user]] = await sql.query('SELECT balance, username FROM users WHERE id = ?', [socket.userId]);

            sendSystemMessage(socket, `✅ Promo code redeemed! You received R$${promo.amount}`);
            
            // Update user balance
            emitBalance(socket.userId, 'set', user.balance);
            io.to(socket.userId).emit('toast', 'success', `Promo code redeemed: +R$${promo.amount}`);
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error redeeming promo code.');
        }
    }
};
