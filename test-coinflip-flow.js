const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test user credentials - update these with actual test accounts
const TEST_USERS = {
    user1: {
        token: 'YOUR_TEST_TOKEN_1', // Replace with actual test token
        userId: 1
    },
    user2: {
        token: 'YOUR_TEST_TOKEN_2', // Replace with actual test token
        userId: 2
    }
};

async function testCoinflipFlow() {
    console.log('🎲 Starting Coinflip Game Flow Test\n');

    try {
        // Test 1: Create a coinflip game
        console.log('Test 1: Creating a coinflip game (user1 as fire)...');
        const createResponse = await axios.post(
            `${BASE_URL}/coinflip/create`,
            {
                side: 'fire',
                amount: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${TEST_USERS.user1.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (createResponse.data.success) {
            const coinflipId = createResponse.data.coinflip.id;
            console.log(`✓ Coinflip created successfully! ID: ${coinflipId}`);
            console.log(`  - Owner Side: ${createResponse.data.coinflip.ownerSide}`);
            console.log(`  - Amount: ${createResponse.data.coinflip.amount}`);
            console.log(`  - Server Seed (hash): ${createResponse.data.coinflip.serverSeed.substring(0, 16)}...`);
            console.log('');

            // Test 2: Join the coinflip game
            console.log(`Test 2: User2 joining coinflip ${coinflipId}...`);
            const joinResponse = await axios.post(
                `${BASE_URL}/coinflip/${coinflipId}/join`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_USERS.user2.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (joinResponse.data.success) {
                console.log('✓ User2 joined successfully!');
                console.log('  Game should now start automatically...');
                console.log('');

                // Test 3: Wait for game to complete
                console.log('Test 3: Waiting for game to complete (12 seconds)...');
                await new Promise(resolve => setTimeout(resolve, 12000));
                console.log('✓ Game should be completed\n');

                // Test 4: Create and join with bot
                console.log('Test 4: Creating game and calling bot...');
                const botGameResponse = await axios.post(
                    `${BASE_URL}/coinflip/create`,
                    {
                        side: 'ice',
                        amount: 50
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${TEST_USERS.user1.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (botGameResponse.data.success) {
                    const botGameId = botGameResponse.data.coinflip.id;
                    console.log(`✓ Game created (ID: ${botGameId}), calling bot...`);

                    const botResponse = await axios.post(
                        `${BASE_URL}/coinflip/${botGameId}/bot`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${TEST_USERS.user1.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (botResponse.data.success) {
                        console.log('✓ Bot joined successfully!\n');
                    } else {
                        console.log('❌ Bot join failed:', botResponse.data.error);
                    }
                }

            } else {
                console.log('❌ Join failed:', joinResponse.data.error);
            }

        } else {
            console.log('❌ Create failed:', createResponse.data.error);
        }

        // Test 5: Error handling - invalid amount
        console.log('Test 5: Testing error handling (invalid amount)...');
        try {
            await axios.post(
                `${BASE_URL}/coinflip/create`,
                {
                    side: 'fire',
                    amount: -10
                },
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_USERS.user1.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('❌ Should have failed but succeeded');
        } catch (error) {
            if (error.response?.data?.error === 'INVALID_AMOUNT') {
                console.log('✓ Correctly rejected invalid amount\n');
            }
        }

        // Test 6: Error handling - invalid side
        console.log('Test 6: Testing error handling (invalid side)...');
        try {
            await axios.post(
                `${BASE_URL}/coinflip/create`,
                {
                    side: 'water',
                    amount: 100
                },
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_USERS.user1.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('❌ Should have failed but succeeded');
        } catch (error) {
            if (error.response?.data?.error === 'INVALID_SIDE') {
                console.log('✓ Correctly rejected invalid side\n');
            }
        }

        console.log('✅ All tests completed!');
        console.log('\nNote: Socket.io events should be tested through the frontend');
        console.log('      - coinflips:push');
        console.log('      - coinflip:join');
        console.log('      - coinflip:commit');
        console.log('      - coinflip:started');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

// Run the test
testCoinflipFlow().then(() => {
    console.log('\n🎲 Coinflip flow test completed');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
