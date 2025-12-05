const axios = require('axios');
const { getAgent, getProxy } = require('../proxies');
const { items } = require('./items');
const { formatConsoleError } = require('..');

// const assetTypes = {
//     '8': 'Hat',
//     '18': 'Face',
//     '19': 'Gear',
//     '41': 'HairAccesory',
//     '42': 'FaceAccesory',
//     '43': 'NeckAccesory',
//     '44': 'ShoulderAccesory',
//     '45': 'FrontAccesory',
//     '46': 'BackAccesory',
//     '47': 'WaistAccesory',
//     '67': 'JacketAccesory',
//     '68': 'SweatherAccesory',
//     '72': 'DressSkirtAccesory'
// };

// let cachedUsers = {};

async function getCurrentUser(cookie, proxy) {

    // if (cachedUsers[cookie] && cachedUsers[cookie].cachedAt > Date.now() - 60000) return cachedUsers[cookie];

    try {

        const opts = {
            url: 'https://users.roblox.com/v1/users/authenticated',
            method: 'GET',
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie};`,
                'Accept': 'application/json',
            }
        };
    
        if (proxy) opts.httpsAgent = getAgent(proxy);
    
        const session = await axios(opts);
    
        // The new endpoint returns: {id, name, displayName}
        const userData = session.data;
        
        if (!userData || !userData.id) {
            return null;
        }
        
        // Fetch avatar thumbnail from batch API
        let thumbnailUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userData.id}&width=150&height=150&format=png`;
        
        try {
            const thumbOpts = {
                url: 'https://thumbnails.roblox.com/v1/users/avatar-headshot',
                method: 'GET',
                params: {
                    userIds: userData.id,
                    size: '150x150',
                    format: 'Png',
                    isCircular: false
                }
            };
            
            if (proxy) thumbOpts.httpsAgent = getAgent(proxy);
            
            const thumbResponse = await axios(thumbOpts);
            if (thumbResponse.data && thumbResponse.data.data && thumbResponse.data.data[0]) {
                thumbnailUrl = thumbResponse.data.data[0].imageUrl || thumbnailUrl;
            }
        } catch (thumbError) {
            console.log('Failed to fetch thumbnail, using fallback URL');
        }
        
        const user = {
            UserID: userData.id,
            UserName: userData.name,
            ThumbnailUrl: thumbnailUrl,
            RobuxBalance: 0 // Will need separate call to get robux
        };
        
        // if (user) cachedUsers[cookie] = { ...user, cachedAt: Date.now() };
    
        return user;

    } catch (e) {
        console.error(`Error getting current user:`, formatConsoleError(e));
        return false;
    }

}

const cachedInventories = {};

async function getInventory(userId, robloxInstance = axios) {

    const inventory = [];
    let cursor = '';

    while (true) {

        const page = await getInventoryPage(userId, cursor, robloxInstance);
        if (!page) return false;

        if (!page.data) break;
        
        page.data.forEach(e => {

            const item = items[e.assetId];
            if (!item) return;

            inventory.push({
                id: e.assetId,
                userAssetId: e.userAssetId,
                serialNumber: e.serialNumber,
                isOnHold: e.isOnHold,
                ...item
            });

        })
    
        if (!page.nextPageCursor) break;
        cursor = page.nextPageCursor;

    }

    return inventory;

}

async function getInventoryPage(userId, cursor, robloxInstance) {

    if (cachedInventories[userId] && cachedInventories[userId][cursor]) return cachedInventories[userId][cursor];
    if (!cachedInventories[userId]) cachedInventories[userId] = {};

    const opts = {
        url: `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles`,
        params: {
            limit: 100,
            cursor: cursor,
            sortOrder: 'Asc'
        }
    }

    try {
        const { data: page } = await robloxInstance(opts);
        cachedInventories[userId][cursor] = page;
        cachedInventories[userId].cachedAt = Date.now();
    
        return page;
    } catch (e) {
        console.error(`Error getting inventory page:`, formatConsoleError(e));
        return false;
    }

}

setInterval(() => {
    const now = Date.now();

    for (const [userId, inventory] of Object.entries(cachedInventories)) {
        if (inventory.cachedAt < now - 60000) {
            delete cachedInventories[userId];
        }
    }
}, 60000);

async function getThumbnails(body, retry = 0) {

    const proxy = getProxy(false, 'thumbnails');
    const agent = getAgent(proxy);

    try {

        const { data } = await axios({
            url: "https://thumbnails.roblox.com/v1/batch",
            method: "POST",
            httpsAgent: agent,
            data: body
        });

        
        return data;

    } catch (e) {
            
        if (retry < 4 && e.response?.status == 429) {
            return getThumbnails(body, retry + 1);
        }

        // console.error(e);
        return false;

    }

}

module.exports = {
    getCurrentUser,
    getInventory,
    cachedInventories,
    getThumbnails
}