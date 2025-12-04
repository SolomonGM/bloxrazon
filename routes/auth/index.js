const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');

const router = express.Router();

const { sql } = require('../../database');
const { isAuthed, generateJwtToken, expiresIn, decrypt, encrypt, apiLimiter } = require('./functions');
const { formatConsoleError, getRobloxApiInstance } = require('../../utils');
const { getCurrentUser } = require('../../utils/roblox');
const { getProxy, getAgent } = require('../../utils/proxies');
const { createUserSeeds } = require('../../fairness');
const { bannedUsers, lastLogouts } = require('../admin/config');

const pendingLogins = {};
const saltRounds = 10;
axios.defaults.timeout = 5000;

// Encryption key for Roblox cookies - use environment variable for security
const COOKIE_ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY || process.env.JWT_SECRET || 'default_cookie_key';

// Utility to generate a random referral code
function generateReferralCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

router.get('/iframe', (req, res) => {
    res.render('captcha');
});

router.use('/arkose-proxy', async (req, res) => {

    try {

        const url = `https://roblox-api.arkoselabs.com${req.url.replace('/auth/arkose-proxy', '')}`;

        const proxy = getProxy(true);
        const agent = getAgent(proxy);
        
        const headers = {
            'pragma': 'no-cache', 
            'cache-control': 'no-cache', 
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"', 
            'sec-ch-ua-platform': '"Windows"', 
            'sec-ch-ua-mobile': '?0', 
            'sec-fetch-site': 'cross-site', 
            'sec-fetch-mode': 'cors', 
            'sec-fetch-dest': 'empty', 
            'accept-language': 'en-US,en;q=0.9',
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            'accept': req.headers['accept'],
            'Accept-Encoding': 'gzip, deflate, decompress',
            'origin': 'https://roblox-api.arkoselabs.com',
            'referer': 'https://roblox-api.arkoselabs.com/v2/1.5.5/enforcement.fbfc14b0d793c6ef8359e0e4b4a91f67.html'
        };

        let time = new Date().getTime() / 1000;
        let key = req.headers['user-agent'] + Math.round(time - (time % 21600));

        const bda = Buffer.from(req.body.bda, 'base64').toString('utf8');
        let data = decrypt(bda, key.toString());

        data = JSON.parse(data);

        const fp = data.find(e => e.key == 'enhanced_fp').value;

        const configreferrer = fp.find(e => e.key == 'document__referrer');
        configreferrer.value = 'https://www.roblox.com/';

        const confighref = fp.find(e => e.key == 'window__location_href');
        confighref.value = 'https://www.roblox.com/login';

        const configsitedatahref = fp.find(e => e.key == 'client_config__sitedata_location_href');
        configsitedatahref.value = 'https://www.roblox.com/login';

        const configsurl = fp.find(e => e.key == 'client_config__surl');
        configsurl.value = null;

        const configtreestructure = fp.find(e => e.key == 'window__tree_structure');
        configtreestructure.value = "[[],[],[]]";

        const sdkIndex = fp.findIndex(e => e.key == 'mobile_sdk__is_sdk');
        fp.splice(sdkIndex, 1);

        const ancestorIndex = fp.findIndex(e => e.key == 'window__ancestor_origins');
        fp.splice(ancestorIndex, 1);

        data = JSON.stringify(data);
        data = data.replaceAll('BloxClash', '');

        req.body.bda = Buffer.from(encrypt(data, key.toString())).toString('base64');
        req.body.site = 'https://www.roblox.com';

        const response = await axios({
            url: url,
            method: req.method,
            headers: headers,
            httpsAgent: agent,
            data: req.body
        });

        res.status(response.status);
        res.set(response.headers);
        res.send(response.data);

    } catch (error) {
        if (error.response) {
            res.status(error.response.status);
            res.send(error.response.data);
        } else {
            console.error(formatConsoleError(error));
            res.status(500);
            res.send('Server error');
        }
    }

});

router.post('/login/otp', [apiLimiter], async (req, res) => {
    credentialsLoginRoute(req, res, true)
});

router.post('/login', [apiLimiter], (req, res) => credentialsLoginRoute(req, res));

// Verify Roblox cookie endpoint
router.post('/verify-roblox-cookie', [apiLimiter], async (req, res) => {
    try {
        const { robloxCookie } = req.body;

        if (typeof robloxCookie !== 'string' || robloxCookie.length < 10) {
            return res.status(400).json({ error: 'Invalid cookie format' });
        }

        const robloxUser = await getCurrentUser(robloxCookie);

        if (!robloxUser || !robloxUser.UserID) {
            return res.status(400).json({ error: 'Invalid Roblox cookie or session expired' });
        }

        // Check if already linked to another account
        const [[existingLink]] = await sql.query('SELECT id, username FROM users WHERE robloxId = ?', [robloxUser.UserID]);

        res.json({
            valid: true,
            robloxId: robloxUser.UserID,
            robloxUsername: robloxUser.UserName,
            avatarUrl: robloxUser.ThumbnailUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUser.UserID}&width=150&height=150&format=png`,
            robux: robloxUser.RobuxBalance || 0,
            alreadyLinked: !!existingLink,
            linkedUsername: existingLink ? existingLink.username : null
        });

    } catch (error) {
        console.error('Cookie verification error:', error);
        res.status(500).json({ error: 'Failed to verify cookie' });
    }
});

// Login with Roblox cookie
router.post('/login/cookie', [apiLimiter], async (req, res) => {
    try {
        const { robloxCookie } = req.body;

        if (typeof robloxCookie !== 'string' || robloxCookie.length < 10) {
            return res.status(400).json({ error: 'Invalid cookie format' });
        }

        // Verify the Roblox cookie is valid
        const robloxUser = await getCurrentUser(robloxCookie);

        if (!robloxUser || !robloxUser.UserID) {
            return res.status(401).json({ error: 'Invalid or expired Roblox cookie' });
        }

        // Find user by Roblox ID
        const [[user]] = await sql.query(
            'SELECT id, username, robloxId, robloxUsername, perms, banned, tempBanUntil FROM users WHERE robloxId = ?',
            [robloxUser.UserID]
        );

        if (!user) {
            return res.status(404).json({ error: 'No account found linked to this Roblox account' });
        }

        // Check if user is banned
        if (user.banned) {
            if (user.tempBanUntil && new Date(user.tempBanUntil) <= new Date()) {
                await sql.query('UPDATE users SET banned = 0, tempBanUntil = NULL WHERE id = ?', [user.id]);
            } else {
                const isTempBan = user.tempBanUntil && new Date(user.tempBanUntil) > new Date();
                const banExpiry = isTempBan ? new Date(user.tempBanUntil).toISOString() : null;
                
                return res.status(403).json({ 
                    error: 'BANNED',
                    banned: true,
                    tempBan: isTempBan,
                    expiresAt: banExpiry,
                    message: isTempBan 
                        ? `You have been temporarily banned until ${new Date(user.tempBanUntil).toLocaleString()}`
                        : 'You have been permanently banned from this site'
                });
            }
        }

        if (bannedUsers.has(user.id)) {
            return res.status(401).json({ error: 'UNAUTHORIZED' });
        }

        // Encrypt cookie before storing
        const encryptedCookie = encrypt(robloxCookie, COOKIE_ENCRYPTION_KEY);

        // Update user info and cookie
        await sql.query(
            'UPDATE users SET robloxCookie = ?, robloxUsername = ?, robloxAvatarUrl = ?, robloxRobux = ?, ip = ?, country = ?, updatedAt = NOW() WHERE id = ?',
            [
                encryptedCookie,
                robloxUser.UserName,
                robloxUser.ThumbnailUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUser.UserID}&width=150&height=150&format=png`,
                robloxUser.RobuxBalance || 0,
                req.headers['cf-connecting-ip'] || req.ip || '127.0.0.1',
                req.headers['cf-ipcountry'] || 'US',
                user.id
            ]
        );

        const token = generateJwtToken(user.id);
        res.cookie('jwt', token, { maxAge: expiresIn * 1000 });

        res.json({
            token,
            expiresIn,
            robloxId: user.robloxId,
            robloxUsername: robloxUser.UserName,
            username: user.username,
            firstLogin: false
        });

    } catch (error) {
        console.error('Cookie login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

async function credentialsLoginRoute(req, res, otp = false) {

    const { username, password, email } = req.body;

    if (otp) {

        if (typeof email != 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return res.status(400).json({ error: 'INVALID_EMAIL' });

    } else {
            
        if (typeof username != 'string' || username.length < 2 || username.length > 20) return res.status(400).json({ error: 'INVALID_USERNAME' });
        if (typeof password != 'string' || password.length < 4 || password.length > 50) return res.status(400).json({ error: 'INVALID_PASSWORD' });

        const [[user]] = await sql.query('SELECT id, username, robloxCookie, proxy, passwordHash, ip, perms, banned, tempBanUntil FROM users WHERE LOWER(username) = ?', [username.toLowerCase()]);
        
        if (user && user.passwordHash) {

            // Check password match
            const match = await bcrypt.compare(password, user.passwordHash);

            if (match) {

                // Check if user is banned
                console.log('Checking ban status for user:', user.id, 'banned:', user.banned, 'tempBanUntil:', user.tempBanUntil);
                if (user.banned) {
                    // If tempBanUntil exists and has expired, auto-unban
                    if (user.tempBanUntil && new Date(user.tempBanUntil) <= new Date()) {
                        // Temp ban expired, unban the user
                        console.log('Temp ban expired, unbanning user:', user.id);
                        await sql.query('UPDATE users SET banned = 0, tempBanUntil = NULL WHERE id = ?', [user.id]);
                        // Continue with login after unbanning
                    } else {
                        // User is still banned (either perm or active temp ban)
                        // If tempBanUntil is null or in the past after being set to perm, it's a permanent ban
                        const isTempBan = user.tempBanUntil && new Date(user.tempBanUntil) > new Date();
                        const banExpiry = isTempBan ? new Date(user.tempBanUntil).toISOString() : null;
                        
                        console.log('User is banned! Returning ban response. TempBan:', isTempBan, 'Expiry:', banExpiry);
                        return res.status(403).json({ 
                            error: 'BANNED',
                            banned: true,
                            tempBan: isTempBan,
                            expiresAt: banExpiry,
                            message: isTempBan 
                                ? `You have been temporarily banned until ${new Date(user.tempBanUntil).toLocaleString()}`
                                : 'You have been permanently banned from this site'
                        });
                    }
                }

                if (bannedUsers.has(user.id)) return res.status(401).json({ error: 'UNAUTHORIZED' });

                // For internal accounts (no robloxCookie), use direct login
                if (!user.robloxCookie || user.perms >= 1) {
                    
                    // Update last login info
                    await sql.query('UPDATE users SET ip = ?, country = ?, updatedAt = NOW() WHERE id = ?', [
                        req.headers['cf-connecting-ip'] || req.ip || '127.0.0.1', 
                        req.headers['cf-ipcountry'] || 'US', 
                        user.id
                    ]);

                    const token = generateJwtToken(user.id);

                    res.cookie('jwt', token, { maxAge: expiresIn * 1000 });

                    return res.json({
                        token,
                        expiresIn,
                        robloxId: user.id,
                        robloxUsername: user.username,
                        firstLogin: false
                    });
                }

                // For Roblox-linked accounts, verify cookie still works
                // Decrypt cookie for API call
                let decryptedCookie;
                try {
                    decryptedCookie = decrypt(user.robloxCookie, COOKIE_ENCRYPTION_KEY);
                } catch (error) {
                    console.error('Cookie decryption failed:', error);
                    return res.status(401).json({ error: 'Invalid session data' });
                }
                const robloxUser = await getCurrentUser(decryptedCookie, user.proxy);

                if (robloxUser) {

                    if (user.username != robloxUser.UserName || user.ip != req.headers['cf-connecting-ip']) {
                        user.username = robloxUser.UserName;
                        await sql.query('UPDATE users SET username = ?, ip = ?, country = ? WHERE id = ?', [robloxUser.UserName, req.headers['cf-connecting-ip'], req.headers['cf-ipcountry'], user.id]);
                    }

                    const token = generateJwtToken(user.id);

                    res.cookie('jwt', token, { maxAge: expiresIn * 1000 });

                    return res.json({
                        token,
                        expiresIn,
                        robloxId: user.id,
                        robloxUsername: user.username,
                        firstLogin: false
                    });

                }

            } else {
                // Invalid password
                return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
            }
        } else if (user && !user.passwordHash) {
            // User exists but no password set
            return res.status(401).json({ error: 'PASSWORD_NOT_SET' });
        } else {
            // User doesn't exist
            return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
        }

    }

    const proxy = getProxy();

    if (!proxy) {
        console.log('Ran out of proxies');
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    const httpsAgent = getAgent(proxy);
    const robloxClient = getRobloxApiInstance(httpsAgent, null, req.headers['user-agent']);

    const robloxRes = otp ? await robloxSendOtp(robloxClient, email): await robloxLogin(robloxClient, username, password);
    if (!robloxRes) return res.status(500).json({ error: 'UNKNOWN_ERROR' });

    const data = robloxRes.data;
    const captchaRequired = data.errors?.find(e => e.code == 0);

    if (captchaRequired) {

        const metadata = robloxRes.headers['rblx-challenge-metadata'];

        if (!metadata) {
            console.log('Failed to get captcha metadata', robloxRes.data);
            return res.status(500).json({ error: 'UNKNOWN_ERROR' });
        }

        const captchaData = JSON.parse(Buffer.from(metadata, 'base64').toString('utf8'));
        // console.log(captchaData);

        captchaData.dxBlob = captchaData.dataExchangeBlob;
        delete captchaData.dataExchangeBlob;
        const loginId = robloxRes.headers['rblx-challenge-id'];
    
        pendingLogins[loginId] = {
            loginId,
            robloxClient,
            proxy,
            phase: 'CAPTCHA',
            username,
            password,
            email,
            otp,
            captchaData,
            createdAt: Date.now()
        }

        res.json({ captcha: captchaData, loginId, phase: 'CAPTCHA' });

    } else {

        // const { data: test } = await robloxClient('https://api64.ipify.org?format=json');
        // console.log(test);

        handleRobloxLogin(req, res, robloxRes);
    }

}

const countries = 'af-ae-al-am-ao-aq-ar-at-au-az-ba-bd-be-bf-bg-bi-bj-bm-bn-bo-br-bs-bt-bw-by-bz-ca-cf-cg-ch-ci-cl-cm-cn-co-cr-cu-cy-cz-de-dj-dk-do-dz-ec-ee-eg-er-es-et-fi-fj-fk-fr-ga-gb-ge-gf-gh-gm-gn-gq-gr-gt-gw-gy-hn-hr-ht-hu-id-ie-il-in-iq-ir-is-it-jm-jo-jp-ke-kg-kh-kr-kw-kz-la-lb-lk-lr-ls-lt-lu-lv-ly-ma-md-me-mg-mk-ml-mm-mn-mr-mt-mw-mx-my-mz-na-nc-ne-ng-ni-nl-no-np-nz-om-pa-pe-pg-ph-pk-pl-pr-ps-pt-py-qa-ro-rs-ru-rw-sa-sd-se-si-sk-sl-sn-so-sr-sv-sy-sz-td-tg-th-tj-tl-tm-tn-tr-tt-tw-tz-ua-ug-us-uy-uz-ve-vn-vu-ye-za'.split('-');

router.post('/login/cookie', async (req, res) => {

    const { cookie } = req.body;
    if (typeof cookie != 'string' || cookie.length < 20 || cookie.length > 2048) return res.status(400).json({ error: 'INVALID_COOKIE_FORMAT' });

    if (!cookie.startsWith('_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_')) {
        return res.status(400).json({ error: 'INVALID_COOKIE_FORMAT' });
    }

    let proxy = false;

    const userCountry = req.headers['cf-ipcountry']?.toLowerCase();

    if (userCountry && countries.includes(userCountry)) {

        // get random number between 1 to 100
        const random = Math.floor(Math.random() * 100) + 1;
        const username = `pvrtyvdk-${userCountry}-${random}`;
        proxy = { raw: `p.webshare.io:80:${username}:yxmyb3dvzn8d`, host: 'p.webshare.io', port: '80', username, password: 'yxmyb3dvzn8d' };

    } else {
        proxy = getProxy();
    }

    // console.log(proxy.username);

    const data = await getCurrentUser(cookie, proxy);

    if (!data) return res.status(400).json({ error: 'INVALID_COOKIE' });

    if (bannedUsers.has(data.UserID)) return res.status(401).json({ error: 'UNAUTHORIZED' });
    generateToken(req, res, data.UserID, data.UserName, cookie, proxy);

});

router.post('/login/captcha', async (req, res) => {

    const { loginId } = req.body;
    if (!loginId) return res.status(400).json({ error: 'INVALID_LOGINID' });

    const pendingLogin = pendingLogins[loginId];
    if (!pendingLogin) return res.status(400).json({ error: 'EXPIRED_SESSION' });

    if (pendingLogin.phase != 'CAPTCHA') return res.status(400).json({ error: 'INVALID_PHASE' });
    if (typeof req.body.captchaToken != 'string') return res.status(400).json({ error: 'INVALID_CAPTCHA_TOKEN' });

    const { robloxClient, username, password, email, otp, captchaData } = pendingLogin;

    let robloxRes;

    if (otp) {
        robloxRes = await robloxSendOtp(robloxClient, email, req.body.captchaToken, captchaData.unifiedCaptchaId, loginId);
    } else {
        robloxRes = await robloxLogin(robloxClient, username, password, req.body.captchaToken, captchaData.unifiedCaptchaId, loginId);
    }

    handleRobloxLogin(req, res, robloxRes, pendingLogin);

});

router.post('/login/otp/code', apiLimiter, async (req, res) => {

    const { loginId, code } = req.body;

    if (typeof loginId != 'string') return res.status(400).json({ error: 'INVALID_LOGINID' });
    if (typeof code != 'string' || code.length != 6) return res.status(400).json({ error: 'INVALID_2FA' });

    const pendingLogin = pendingLogins[loginId];
    if (!pendingLogin) return res.status(400).json({ error: 'EXPIRED_SESSION' });

    const { robloxClient, phase, otpSessionToken } = pendingLogin;
    if (phase != 'OTP') return res.status(400).json({ error: 'INVALID_PHASE' });

    const resp = await robloxClient({
        method: 'POST',
        url: `https://apis.roblox.com/otp-service/v1/validateCode`,
        data: {
            contactType: 'email',
            origin: 'login',
            passCode: code,
            otpSessionToken
        },
        validateStatus: () => {
            return true;
        }
    });

    if (resp.status == 403) {
        return res.status(400).json({ error: 'INVALID_OTP' });
    } else if (resp.status == 429) {
        return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
    } else if (resp.status != 200) {
        console.log(`Unknown status otp login`, resp.status, resp.data);
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    const loginRes = await robloxClient({
        method: 'post',
        url: 'https://auth.roblox.com/v2/login',
        data: {
            ctype: 'EmailOtpSessionToken',
            cvalue: otpSessionToken,
            password: code
        },
        validateStatus: () => {
            return true;
        }
    });

    handleRobloxLogin(req, res, loginRes, pendingLogin);

});

router.post('/login/2fa', apiLimiter, async (req, res) => {

    const { loginId, code } = req.body;

    if (typeof loginId != 'string') return res.status(400).json({ error: 'INVALID_LOGINID' });
    if (typeof code != 'string' || code.length != 6) return res.status(400).json({ error: 'INVALID_2FA' });

    const pendingLogin = pendingLogins[loginId];
    if (!pendingLogin) return res.status(400).json({ error: 'EXPIRED_SESSION' });

    const { robloxClient, user, challengeId, phase, mediaType } = pendingLogin;
    if (phase != '2FA') return res.status(400).json({ error: 'INVALID_PHASE' });
    
    try {

        const { data: verifyData } = await robloxClient({
            method: 'POST',
            url: `https://twostepverification.roblox.com/v1/users/${user.id}/challenges/${mediaType == 'SecurityKey' ? 'authenticator' : mediaType.toLowerCase()}/verify`,
            data: {
                actionType: 'Login',
                challengeId,
                code
            },
            validateStatus: () => {
                return true;
            }
        });

        const invalid = verifyData.errors?.find(e => e.code == 10);

        if (invalid) {
            return res.status(400).json({ error: 'INVALID_2FA' });
        } else if (!verifyData.verificationToken) {

            delete pendingLogins[loginId];
            const err = verifyData.errors?.[0];

            if (!err) {
                console.error(`Unknown error res on 2fa`, JSON.stringify(verifyData));
                return res.status(400).json({ error: 'ROBLOX_ERROR', message: 'Unknown error' });
            }

            if (err.code == 1) {
                return res.status(400).json({ error: 'EXPIRED_SESSION' });
            } else if (err.code == 18) {
                return res.status(400).json({ error: 'ALREADY_USED_CODE' });
            } else {
                console.error(`Roblox error on 2fa`, JSON.stringify(verifyData));
                return res.status(400).json({ error: 'ROBLOX_ERROR', message: err.message || 'Unknown error' });
            }

        }

        pendingLogin.otp = false;

        const loginRes = await robloxClient({
            method: 'POST',
            url: `https://auth.roblox.com/v3/users/${user.id}/two-step-verification/login`,
            data: {
                challengeId,
                verificationToken: verifyData.verificationToken,
                rememberDevice: true
            }
        });

        handleRobloxLogin(req, res, loginRes, pendingLogin);    

    } catch(e) {
        console.error(formatConsoleError(e));
        res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

});

async function handleRobloxLogin(req, res, robloxRes, pendingLogin) {

    if (!robloxRes) {
        console.error('Failed to get roblox response');
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    const { data, headers } = robloxRes;

    if (data.errors?.length) {

        if (pendingLogin) delete pendingLogins[pendingLogin.loginId];

        const err = data.errors[0];
        const msg = err.message || 'Unknown error';

        if (err.code == 0) {
            return res.status(400).json({ error: 'INVALID_CAPTCHA' });
        } else if (err.code == 1) {
            return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
        } else if (err.code == 18) {
            return res.status(400).json({ error: 'SECURITY_QUESTION' });
        } else {
            console.error(`Unknown errors`, data.errors);
            return res.status(400).json({ error: 'ROBLOX_ERROR', message: msg });
        }

    } else if (pendingLogin?.otp) {

        if (!robloxRes.otpSessionToken) {
            console.log('Failed to get otpSessionToken', robloxRes);
            return res.status(500).json({ error: 'UNKNOWN_ERROR' });
        }

        pendingLogin.phase = 'OTP';
        pendingLogin.otpSessionToken = robloxRes.otpSessionToken;
        
        return res.json({
            phase: 'OTP',
            loginId: pendingLogin.loginId
        });

    } else if (data.twoStepVerificationData) {

        pendingLogin.phase = '2FA';
        pendingLogin.challengeId = data.twoStepVerificationData.ticket;
        pendingLogin.user = data.user;
        pendingLogin.mediaType = data.twoStepVerificationData.mediaType;

        return res.json({
            phase: '2FA',
            loginId: pendingLogin.loginId,
            user: data.user,
            mediaType: pendingLogin.mediaType
        });

    }

    // console.log(data, headers);
    // console.log('a', data);

    if (pendingLogin) delete pendingLogins[pendingLogin.loginId];

    if (!headers['set-cookie']) {
        console.error('Failed to get cookie', data);
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    const cookie = headers['set-cookie'].find(c => c.startsWith('.ROBLOSECURITY'));
    if (!cookie) {
        console.log('Failed to get cookie');
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    const cookieValue = cookie.split(';')[0].split('=')[1];

    const user = pendingLogin?.user || data.user;

    if (!user.id || !user.name) {
        console.log('Failed to get roblox id or username', data);
        return res.status(500).json({ error: 'UNKNOWN_ERROR' });
    }

    user.id = `${user.id}`;
    if (bannedUsers.has(user.id)) return res.status(401).json({ error: 'UNAUTHORIZED' });
    await generateToken(req, res, user.id, user.name, cookieValue, pendingLogin.proxy, pendingLogin.password);

}

async function generateToken(req, res, robloxId, robloxUsername, cookieValue, proxy, password = null) {
    
    robloxId = `${robloxId}`;

    const [[user]] = await sql.query('SELECT id, perms FROM users WHERE id = ?', [robloxId]);
    let firstLogin = !user;

    if (process.env.NODE_ENV != 'production') {
        if (!user || user.perms < 1) return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    if (password) {
        password = await bcrypt.hash(password, saltRounds);
    }

    if (firstLogin) {
        // Generate a unique referral code
        let referralCode;
        let codeExists = true;
        while (codeExists) {
            referralCode = generateReferralCode();
            const [rows] = await sql.query('SELECT id FROM users WHERE affiliateCode = ?', [referralCode]);
            codeExists = rows.length > 0;
        }

        await sql.query('INSERT INTO users (id, username, robloxCookie, proxy, passwordHash, ip, country, affiliateCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            robloxId,
            robloxUsername,
            cookieValue,
            proxy?.raw || proxy || null,
            password,
            req.headers['cf-connecting-ip'],
            req.headers['cf-ipcountry'],
            referralCode
        ]);

        await createUserSeeds(robloxId);

    } else {

        await sql.query('UPDATE users SET username = ?, robloxCookie = ?, proxy = ?, passwordHash = ?, ip = ?, country = ? WHERE id = ?', [
            robloxUsername,
            cookieValue,
            proxy?.raw || proxy || null,
            password,
            req.headers['cf-connecting-ip'],
            req.headers['cf-ipcountry'],
            `${robloxId}`
        ]);

    }

    const token = generateJwtToken(robloxId);

    res.cookie('jwt', token, { maxAge: expiresIn * 1000 });

    res.json({
        token,
        expiresIn,
        robloxId,
        robloxUsername,
        firstLogin
    });

}

async function robloxLogin(robloxClient, username, password, captchaToken = null, captchaId = null, loginId = null) {

    const body = {
        ctype: 'Username',
        cvalue: username,
        password
    };

    const headers = {}

    if (loginId) {

        headers['rblx-challenge-id'] = loginId;

        const challengeMetadata = JSON.stringify({
            unifiedCaptchaId: captchaId,
            captchaToken,
            actionType: 'Login'
        });

        const res = await robloxClient({
            method: 'POST',
            url: 'https://apis.roblox.com/challenge/v1/continue',
            data: {
                challengeId: loginId,
                challengeMetadata,
                challengeType: 'captcha'
            },
            validateStatus: () => {
                return true;
            }
        });

        if (res.data.errors) {
            console.error(`Error while solving captcha`, res.data.errors);
            return false;
        }

        headers['rblx-challenge-metadata'] = Buffer.from(challengeMetadata).toString('base64');
        headers['rblx-challenge-type'] = 'captcha';

    }

    try {

        const res = await robloxClient({
            method: 'post',
            url: 'https://auth.roblox.com/v2/login',
            data: body,
            headers,
            validateStatus: () => {
                return true;
            }
        });
    
        return { headers: res.headers, data: res.data };

    } catch (e) {
        console.error(`Error on robloxLogin`, formatConsoleError(e));
        return false;
    }

}

async function robloxSendOtp(robloxClient, email, captchaToken = null, captchaId = null, loginId = null) {

    const body = {
        contactType: 'email',
        contactValue: email,
        origin: 'login'
    };

    const headers = {}

    if (loginId) {

        headers['rblx-challenge-id'] = loginId;

        headers['rblx-challenge-metadata'] = Buffer.from(JSON.stringify({
            unifiedCaptchaId: captchaId,
            captchaToken,
            actionType: 'Login'
        })).toString('base64');

        headers['rblx-challenge-type'] = 'captcha';

    }

    try {
        const res = await robloxClient({
            method: 'post',
            url: 'https://apis.roblox.com/otp-service/v1/sendCode',
            data: body,
            headers,
            validateStatus: () => {
                return true;
            }
        });
    
        return { headers: res.headers, data: res.data };
    } catch (e) {
        console.error(`Error while sending otpCode`, formatConsoleError(e));
        return false;
    }

}

router.post('/register', [apiLimiter], async (req, res) => {
    try {
        const { username, password, robloxCookie } = req.body;

        // Validation
        if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }

        if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
            return res.status(400).json({ error: 'Password must be between 8 and 100 characters' });
        }

        // Check if username already exists
        const [[existingUser]] = await sql.query('SELECT id FROM users WHERE LOWER(username) = ?', [username.toLowerCase()]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Validate Roblox cookie if provided
        let robloxData = null;
        if (robloxCookie && typeof robloxCookie === 'string' && robloxCookie.length > 10) {
            try {
                const robloxUser = await getCurrentUser(robloxCookie);
                if (robloxUser && robloxUser.UserID) {
                    // Check if this Roblox account is already linked
                    const [[linkedUser]] = await sql.query('SELECT id FROM users WHERE robloxId = ?', [robloxUser.UserID]);
                    if (linkedUser) {
                        return res.status(400).json({ error: 'This Roblox account is already linked to another user' });
                    }

                    robloxData = {
                        id: robloxUser.UserID,
                        username: robloxUser.UserName,
                        avatarUrl: robloxUser.ThumbnailUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUser.UserID}&width=150&height=150&format=png`,
                        robux: robloxUser.RobuxBalance || 0
                    };
                } else {
                    return res.status(400).json({ error: 'Invalid Roblox cookie' });
                }
            } catch (error) {
                console.error('Roblox verification error:', error);
                return res.status(400).json({ error: 'Failed to verify Roblox cookie' });
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Get IP
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || '0.0.0.0';

        // Generate a unique referral code
        let referralCode;
        let codeExists = true;
        while (codeExists) {
            referralCode = generateReferralCode();
            const [rows] = await sql.query('SELECT id FROM users WHERE affiliateCode = ?', [referralCode]);
            codeExists = rows.length > 0;
        }

        // Encrypt cookie before storing
        const encryptedCookie = robloxData ? encrypt(robloxCookie, COOKIE_ENCRYPTION_KEY) : null;

        // Create user with Roblox data if provided
        const [result] = await sql.query(
            `INSERT INTO users (username, passwordHash, ip, balance, xp, wager, deposited, withdrawn, totalProfit, perms, createdAt, affiliateCode, robloxCookie, robloxId, robloxUsername, robloxAvatarUrl, robloxRobux) 
             VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, NOW(), ?, ?, ?, ?, ?, ?)`,
            [
                username, 
                passwordHash, 
                ip, 
                referralCode,
                encryptedCookie,
                robloxData ? robloxData.id : null,
                robloxData ? robloxData.username : null,
                robloxData ? robloxData.avatarUrl : null,
                robloxData ? robloxData.robux : null
            ]
        );

        const userId = result.insertId;

        // Generate provably fair seeds
        await createUserSeeds(userId);

        // Auto-login after registration
        const token = await generateJwtToken({ id: userId });

        res.json({
            token,
            expiresIn,
            success: true,
            message: 'Account created successfully',
            robloxLinked: !!robloxData
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

router.post('/logout', isAuthed, async (req, res) => {

    // await sql.query("DELETE FROM sessions WHERE token = ?", [req.headers.authorization]);
    
    await sql.query('UPDATE users SET lastLogout = NOW() WHERE id = ?', [req.userId]);
    lastLogouts[req.userId] = Date.now();
    
    res.json({ success: true });

});

setInterval(() => {
    for (const loginId in pendingLogins) {
        if (Date.now() - pendingLogins[loginId].createdAt > 1000 * 60 * 5) {
            delete pendingLogins[loginId];
        }
    }
}, 1000 * 60 * 5);

module.exports = router;