import {createEffect, createResource, createSignal, For} from "solid-js";
import {api} from "../../util/api";
import {useWebsocket} from "../../contexts/socketprovider";
import Avatar from "../Level/avatar";
import {getCents} from "../../util/balance";

const tempBets = [0,0,0,0,0,0,0,0]

const gameToImage = {
    'case': '/assets/icons/cases.svg',
    'battle': '/assets/icons/battles.svg',
    'roulette': '/assets/icons/roulette.svg',
    'crash': '/assets/icons/crash.svg',
    'coinflip': '/assets/icons/coinflip.svg',
    'jackpot': '/assets/icons/jackpot.svg',
    'slot': '/assets/icons/slot.svg',
    'mines': '/assets/icons/mines.svg'
}

function Bets(props) {

    let prevWs
    let hasEmittedMe = false
    const [ws] = useWebsocket()
    const [option, setOption] = createSignal('all')
    const [bets, setBets] = createSignal([])

    createEffect(() => {
        if (ws()?.connected && !prevWs?.connected) {
            ws().emit('bets:subscribe', 'all')
        }

        if (ws()) {
            ws().on('bets', (type, bets) => {
                if (type !== option()) {
                    ws().emit('bets:unsubscribe', option())
                    setBets([])
                }

                setOption(type)
                setBets((b) => [...bets, ...b].slice(0, 10))
            })
        }

        prevWs = ws()
    })

    createEffect(() => {
        if (!hasEmittedMe && props.user && ws()) {
            ws().emit('bets:subscribe', 'me')
            hasEmittedMe = true
        }
    })

    function changeBetChannel(channel) {
        ws().emit('bets:subscribe', channel)
    }

    return (
        <>
            <div class='bets-container'>
                <div class='bets-header'>
                    <svg class='bets-icon' width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#bets-gradient)"/>
                        <defs>
                            <linearGradient id="bets-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#A78BFA"/>
                                <stop offset="1" stop-color="#8B5CF6"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <h2>LIVE <span>BETS</span></h2>
                </div>

                <div class='bets-options'>
                    {props?.user && (
                        <button class={'option ' + (option() === 'me' ? 'active' : '')} onClick={() => changeBetChannel('me')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                            </svg>
                            MY BETS
                        </button>
                    )}

                    <button class={'option ' + (option() === 'all' ? 'active' : '')} onClick={() => changeBetChannel('all')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                            <path d="M2 17L12 22L22 17V11L12 16L2 11V17Z" fill="currentColor"/>
                        </svg>
                        ALL BETS
                    </button>
                    <button class={'option ' + (option() === 'high' ? 'active' : '')} onClick={() => changeBetChannel('high')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 19H22L12 2Z" fill="currentColor"/>
                        </svg>
                        HIGH BETS
                    </button>
                    <button class={'option ' + (option() === 'lucky' ? 'active' : '')} onClick={() => changeBetChannel('lucky')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/>
                        </svg>
                        LUCKY WINS
                    </button>
                </div>

                <table class='bets-table' cellSpacing={0}>
                    <thead class='bets-header-row'>
                        <tr>
                            <th>GAME</th>
                            <th>USER</th>
                            <th class='large'>TIME</th>
                            <th class='large'>WAGER AMOUNT</th>
                            <th class='large'>MULTIPLIER</th>
                            <th>PAYOUT</th>
                        </tr>
                    </thead>

                    <tbody>
                        <For each={bets()}>{(bet, index) => (
                            <tr class='bet'>
                                <td>
                                    <div class='image-data white caps'>
                                        <img src={gameToImage[bet.game]} alt='' height='17'/>
                                        {bet.game}
                                    </div>
                                </td>

                                <td>
                                    <div class='image-data user'>
                                        <Avatar id={bet?.user?.id} xp={bet?.user?.xp || 0} height={30}/>
                                        {bet?.user?.username || 'Anonymous'}
                                    </div>
                                </td>

                                <td class='large'>{new Date(bet?.createdAt).toLocaleTimeString()}</td>

                                <td class='large'>
                                    <div class='image-data white'>
                                        <img src='/assets/icons/coin.svg' alt='' height='17'/>
                                        <p>{Math.floor(bet?.amount || 0)}<span class='cents'>.{getCents(bet?.amount || 0)}</span></p>
                                    </div>
                                </td>

                                <td class={'large ' + ((bet?.payout / bet?.amount) > 1 ? 'green' : '')}>
                                    {(bet?.payout / bet?.amount).toFixed(2)}x
                                </td>

                                <td>
                                    <div class={'image-data ' + ((bet?.payout / bet?.amount) > 1 ? 'gold' : 'lum')}>
                                        <img src='/assets/icons/coin.svg' alt='' height='17'/>
                                        {(bet?.payout / bet?.amount > 1) ? '+' : ''} <p>{Math.floor(bet?.payout || 0)}<span class='cents'>.{getCents(bet?.payout || 0)}</span></p>
                                    </div>
                                </td>
                            </tr>
                        )}</For>
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .bets-container {
                  width: 100%;
                  margin-top: 40px;
                }

                .bets-header {
                  display: flex;
                  align-items: center;
                  gap: 15px;
                  margin-bottom: 20px;
                  padding: 18px 25px;
                  border-radius: 12px;
                  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
                  border: 1px solid rgba(139, 92, 246, 0.2);
                }

                .bets-icon {
                  filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4));
                }

                .bets-header h2 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: 800;
                  color: #FFF;
                  letter-spacing: 1px;
                }

                .bets-header h2 span {
                  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
              
                .bets-options {
                  width: 100%;
                  display: flex;
                  gap: 12px;
                  justify-content: center;
                  margin-bottom: 20px;
                  flex-wrap: wrap;
                }
                
                .option {
                  height: 44px;
                  padding: 0 24px;
                  border-radius: 10px;
                  background: linear-gradient(135deg, rgba(42, 35, 82, 0.6) 0%, rgba(35, 31, 67, 0.6) 100%);
                  border: 1px solid rgba(138, 129, 205, 0.2);
                  color: #ADA3EF;
                  font-family: Geogrotesque Wide, sans-serif;
                  font-size: 13px;
                  font-weight: 700;
                  cursor: pointer;
                  outline: none;
                  transition: all 0.3s ease;
                  position: relative;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  letter-spacing: 0.5px;
                }

                .option svg {
                  opacity: 0.7;
                  transition: opacity 0.3s ease;
                }

                .option:hover svg {
                  opacity: 1;
                }

                .option::before {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0%;
                  height: 2px;
                  background: linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%);
                  transition: width 0.3s ease;
                }

                .option:hover {
                  border-color: rgba(139, 92, 246, 0.4);
                  background: linear-gradient(135deg, rgba(42, 35, 82, 0.8) 0%, rgba(35, 31, 67, 0.8) 100%);
                  transform: translateY(-2px);
                }

                .option:hover::before {
                  width: 80%;
                }
                
                .option.active {
                  color: #FFF;
                  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%);
                  border-color: rgba(139, 92, 246, 0.6);
                  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                  transform: translateY(-2px);
                }

                .option.active svg {
                  opacity: 1;
                  filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.5));
                }

                .option.active::before {
                  width: 100%;
                  height: 3px;
                  background: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%);
                  box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
                }

                .bets-table {
                  width: 100%;
                  border-radius: 12px;
                  overflow: hidden;
                  border: 1px solid rgba(138, 116, 249, 0.15);
                  background: linear-gradient(135deg, rgba(26, 24, 37, 0.8) 0%, rgba(37, 33, 57, 0.6) 100%);
                  backdrop-filter: blur(10px);
                }
                
                .bets-header-row {
                  width: 100%;
                  height: 50px;
                  background: linear-gradient(135deg, rgba(42, 35, 82, 0.8) 0%, rgba(35, 31, 67, 0.8) 100%);
                  border-bottom: 2px solid rgba(139, 92, 246, 0.3);
                  color: #ADA3EF;
                  font-size: 12px;
                  font-family: Geogrotesque Wide;
                  font-weight: 700;
                  text-align: left;
                  letter-spacing: 0.8px;
                }

                .bets-header-row th {
                  padding: 0 20px;
                  text-transform: uppercase;
                }
                
                .bet {
                  background: rgba(29, 24, 62, 0.3);
                  height: 56px;
                  color: #ADA3EF;
                  font-size: 13px;
                  font-family: Geogrotesque Wide;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  border-bottom: 1px solid rgba(62, 55, 113, 0.2);
                }

                .bet:hover {
                  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
                  border-color: rgba(139, 92, 246, 0.3);
                  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
                }
                
                .bet:nth-child(2n - 1) {
                  background: rgba(37, 33, 67, 0.3);
                }

                .bet:nth-child(2n - 1):hover {
                  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.06) 100%);
                }

                .bet td {
                  padding: 0 20px;
                }
                
                .image-data {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                
                .lum {
                  mix-blend-mode: luminosity;
                  color: #9693C0;

                }
                
                .caps {
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                
                .user {
                  gap: 12px;
                }

                .user:hover {
                  color: #8B5CF6;
                  cursor: pointer;
                }
                
                td:first-child, th:first-child {
                  padding: 0 0 0 30px;
                }
                
                .cents {
                  color: #A7A7A7;
                  font-weight: 500;
                }
                
                .gold .cents {
                  color: #9A6C26;
                }

                .green {
                  color: #59E878;
                  font-weight: 700;
                }

                .white {
                  color: #FFF;
                  font-weight: 600;
                }

                @media only screen and (max-width: 850px) {
                  .large {
                    display: none;
                  }

                  .bets-options {
                    gap: 8px;
                  }

                  .option {
                    padding: 0 16px;
                    font-size: 11px;
                    height: 40px;
                  }

                  .bets-header {
                    padding: 15px 20px;
                  }

                  .bets-header h2 {
                    font-size: 20px;
                  }
                }
            `}</style>
        </>
    );
}

export default Bets;
