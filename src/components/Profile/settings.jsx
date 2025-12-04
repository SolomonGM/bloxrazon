import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Switch from "../Toggle/switch";
import Loader from "../Loader/loader";

function Settings(props) {

    let slider
    const [mentions, setMentions] = createSignal(localStorage.getItem('mentions') === 'true')
    const [discord, { mutate }] = createResource(fetchDiscord)
    const [linked, setLinked] = createSignal(false)
    const [sound, setSound] = createSignal(localStorage.getItem('sound') || 100)
    const [user, { mutateUser }] = useUser()
    
    // Roblox link state
    const [robloxData, setRobloxData] = createSignal(null)
    const [robloxLoading, setRobloxLoading] = createSignal(true)
    const [showRefreshModal, setShowRefreshModal] = createSignal(false)
    const [refreshCookie, setRefreshCookie] = createSignal('')

    createEffect(() => {
        if (!localStorage.getItem('sound')) {
            localStorage.setItem('sound', 100)
            setSound(100)
        }

        if (localStorage.getItem('mentions') === undefined) {
            localStorage.setItem('mentions', true)
        }

        if (sound()) {
            createTrail()
        }

        // Fetch Roblox link status
        fetchRobloxStatus()
    })

    async function fetchRobloxStatus() {
        try {
            const res = await authedAPI('/user/roblox/status', 'GET', null)
            setRobloxData(res)
        } catch (error) {
            console.error('Failed to fetch Roblox status:', error)
        } finally {
            setRobloxLoading(false)
        }
    }

    async function fetchDiscord() {
        try {
            let discord = await authedAPI(`/discord`, 'GET', null)
            if (discord.status === 'LINKED') setLinked(true)
            return mutate(discord)
        } catch (e) {
            console.log(e)
            return mutate(null)
        }
    }

    function createTrail() {
        let value = (slider.value - 0) / 100 * 100
        slider.style.background = 'linear-gradient(to right, #5F5CA6 0%, #5F5CA6 ' + value + '%, #2B284E ' + value + '%, #2B284E 100%)'
    }

    return (
        <>
            <div class='settings-container fadein'>
                <div class='table-header'>
                    <div class='table-column'>
                        <p>SETTING</p>
                    </div>

                    <div class='table-column'>
                        <p>ACTION</p>
                    </div>
                </div>

                <div class='table-data'>
                    <div class='table-column'>
                        <p>SOUND</p>
                    </div>

                    <div class='table-column'>
                        <input ref={slider} type='range' className='range' value={sound()}
                               onInput={(e) => {
                                   setSound(e.target.valueAsNumber)
                                   localStorage.setItem('sound', sound())
                               }}
                        />
                    </div>
                </div>

                <div class='table-data'>
                    <div class='table-column'>
                        <p>ANONYMOUS MODE</p>
                    </div>

                    <div class='table-column'>
                        <Switch dark={true} active={user()?.anon} toggle={async () => {
                            let res = await authedAPI('/user/anon', 'POST', JSON.stringify({
                                enable: !user()?.anon
                            }))

                            if (res.success) {
                                mutateUser({...user(), anon: !user()?.anon})
                            }
                        }}/>
                    </div>
                </div>

                <div class='table-data'>
                    <div class='table-column'>
                        <p>CHAT MENTIONS</p>
                    </div>

                    <div class='table-column'>
                        <Switch dark={true} active={mentions()} toggle={async () => {
                            setMentions(!mentions())
                            localStorage.setItem('mentions', mentions())
                        }}/>
                    </div>
                </div>

                <div class='table-data'>
                    <div class='table-column'>
                        <p>LINK DISCORD</p>
                    </div>

                    <Show when={!discord.loading} fallback={<Loader type='small'/>}>
                        <button className={linked() ? 'unlink' : 'bevel-gold link'} onClick={async () => {
                            if (linked()) {
                                let res = await authedAPI('/discord/unlink', 'POST', null, true)
                                if (res.status === 'NOT_LINKED' || res.status === 'UNLINKED' || res.success) {
                                    createNotification('success', 'Successfully unlinked your discord')
                                    setLinked(false)
                                }

                                return
                            }

                            let res = await authedAPI('/discord/link', 'POST', null, true)
                            if (res.error) {
                                createNotification('error', res.error || 'Discord linking is not available')
                                return
                            }
                            if (res.url) {
                                let popupWindow = window.open(res.url, 'popUpWindow', 'height=700,width=500,left=100,top=100,resizable=yes,scrollbar=yes')
                                window.addEventListener("message", function (event) {
                                    if (event.data.type === "discord") {
                                        popupWindow.close();
                                        setLinked(true)
                                    }
                                }, false)
                            }
                        }}>{linked() ? 'UNLINK' : 'LINK'}</button>
                    </Show>
                </div>

                <div class='table-data'>
                    <div class='table-column'>
                        <p>LINK ROBLOX</p>
                    </div>

                    <Show when={!robloxLoading()} fallback={<Loader type='small'/>}>
                        <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
                            <Show when={robloxData()?.linked}>
                                <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'margin-right': '10px' }}>
                                    <img 
                                        src={robloxData()?.robloxAvatarUrl} 
                                        alt="Roblox Avatar" 
                                        style={{ width: '32px', height: '32px', 'border-radius': '50%', border: '2px solid #FFD700' }}
                                    />
                                    <span style={{ color: '#FFD700', 'font-weight': 'bold' }}>
                                        {robloxData()?.robloxUsername}
                                    </span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13 8L8 3L3 8" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 3V13" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </div>
                            </Show>
                            
                            <Show when={robloxData()?.linked}>
                                <button class='bevel' style={{ padding: '8px 16px', 'font-size': '14px', 'margin-right': '8px' }} onClick={() => {
                                    setShowRefreshModal(true)
                                    setRefreshCookie('')
                                }}>REFRESH COOKIE</button>
                            </Show>

                            <button 
                                className={robloxData()?.linked ? 'unlink' : 'bevel-gold link'} 
                                onClick={async () => {
                                    if (robloxData()?.linked) {
                                        // Unlink
                                        const res = await authedAPI('/user/roblox/unlink', 'POST', null, true)
                                        if (res.success) {
                                            createNotification('success', 'Successfully unlinked your Roblox account')
                                            setRobloxData({ linked: false })
                                        }
                                    } else {
                                        createNotification('error', 'Roblox linking is required during registration')
                                    }
                                }}
                            >
                                {robloxData()?.linked ? 'UNLINK' : 'LINK'}
                            </button>
                        </div>
                    </Show>
                </div>
            </div>

            {/* Refresh Cookie Modal */}
            <Show when={showRefreshModal()}>
                <div class='modal-backdrop' onClick={() => setShowRefreshModal(false)}>
                    <div class='refresh-modal' onClick={(e) => e.stopPropagation()}>
                        <div class='modal-header'>
                            <h2>Refresh Roblox Cookie</h2>
                            <button class='close-btn' onClick={() => setShowRefreshModal(false)}>×</button>
                        </div>
                        
                        <div class='modal-body'>
                            <p class='modal-description'>
                                Enter your new .ROBLOSECURITY cookie to refresh your account access.
                                The cookie must belong to the same Roblox account: <span class='highlight'>{robloxData()?.robloxUsername}</span>
                            </p>
                            
                            <div class='cookie-input-wrapper'>
                                <label>New Cookie</label>
                                <input 
                                    type='text' 
                                    class='cookie-input'
                                    placeholder='_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you...'
                                    value={refreshCookie()}
                                    onInput={(e) => setRefreshCookie(e.target.value)}
                                />
                            </div>

                            <div class='modal-actions'>
                                <button class='bevel-gold' onClick={async () => {
                                    if (!refreshCookie()) {
                                        createNotification('error', 'Please enter your cookie')
                                        return
                                    }

                                    const res = await authedAPI('/user/roblox/refresh', 'POST', JSON.stringify({
                                        cookie: refreshCookie()
                                    }), true)

                                    if (res.success) {
                                        createNotification('success', res.message || 'Cookie refreshed successfully!')
                                        setRobloxData({
                                            linked: true,
                                            robloxId: robloxData().robloxId,
                                            robloxUsername: res.robloxUsername,
                                            robloxAvatarUrl: res.robloxAvatarUrl
                                        })
                                        setShowRefreshModal(false)
                                        setRefreshCookie('')
                                    } else if (res.error) {
                                        createNotification('error', res.error)
                                    }
                                }}>REFRESH</button>
                                
                                <button class='bevel' onClick={() => {
                                    setShowRefreshModal(false)
                                    setRefreshCookie('')
                                }}>CANCEL</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>

            <style jsx>{`
              .settings-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;
              }

              .bar {
                width: 100%;
                height: 1px;
                min-height: 1px;
                background: #5A5499;
              }
              
              .table-header {
                margin-bottom: 20px;
              }

              .table-header, .table-data {
                display: flex;
                justify-content: space-between;
              }

              .table-data {
                height: 55px;
                background: rgba(90, 84, 153, 0.35);
                padding: 0 20px;

                display: flex;
                align-items: center;

                color: #ADA3EF;
                font-size: 14px;
                font-weight: 600;
              }
              
              .table-data:nth-of-type(2n) {
                background: rgba(90, 84, 153, 0.15);
              }

              .table-column {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1 1 0;
                text-transform: uppercase;
              }

              .table-column:nth-of-type(2n) {
                justify-content: flex-end;
              }

              .table-header p {
                background: rgba(90, 84, 153, 0.35);
                height: 25px;
                line-height: 25px;
                padding: 0 15px;
                border-radius: 2px;

                color: #ADA3EF;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
              }

              .range {
                -webkit-appearance: none;
                appearance: none;

                border-radius: 25px;
                background: #2B284E;
                max-width: 190px;
                height: 9px;

                //margin-right: auto;
              }

              .range::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 15px;
                height: 15px;
                background: white;
                cursor: pointer;
                border-radius: 50%;
              }

              .range::-moz-range-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 15px;
                height: 15px;
                background: white;
                cursor: pointer;
                border-radius: 50%;
              }
              
              .link {
                width: 70px;
                height: 25px;
              }
              
              .unlink {
                width: 70px;
                height: 25px;

                outline: unset;
                border: unset;
                
                cursor: pointer;

                color: #FFF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 12px;
                font-weight: 700;
                
                border-radius: 3px;
                background: #E85959;
                box-shadow: 0px 1px 0px 0px #AF2525, 0px -1px 0px 0px #FF7A7A;
              }
              
              @media only screen and (max-width: 1000px) {
                .settings-container {
                  padding-bottom: 90px;
                }
              }

              .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
              }

              .refresh-modal {
                background: #1E1B3C;
                border-radius: 8px;
                border: 2px solid #5A5499;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
              }

              .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                border-bottom: 1px solid #5A5499;
              }

              .modal-header h2 {
                color: #FFD700;
                font-size: 20px;
                font-weight: 700;
                margin: 0;
              }

              .close-btn {
                background: transparent;
                border: none;
                color: #ADA3EF;
                font-size: 32px;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .close-btn:hover {
                color: #FFD700;
              }

              .modal-body {
                padding: 25px;
              }

              .modal-description {
                color: #ADA3EF;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 20px;
              }

              .highlight {
                color: #FFD700;
                font-weight: 700;
              }

              .cookie-input-wrapper {
                margin-bottom: 25px;
              }

              .cookie-input-wrapper label {
                display: block;
                color: #ADA3EF;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                margin-bottom: 8px;
              }

              .cookie-input {
                width: 100%;
                padding: 12px;
                background: rgba(90, 84, 153, 0.2);
                border: 1px solid #5A5499;
                border-radius: 4px;
                color: #fff;
                font-size: 14px;
                font-family: monospace;
                box-sizing: border-box;
              }

              .cookie-input:focus {
                outline: none;
                border-color: #FFD700;
              }

              .modal-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
              }

              .modal-actions button {
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 700;
              }
            `}</style>
        </>
    );
}

export default Settings;
