import {createEffect, createSignal, onCleanup} from "solid-js";
import {addDropdown, authedAPI, createNotification} from "../../util/api";
import Countup from "../Countup/countup";
import {useRain} from "../../contexts/raincontext";
import {useUser} from "../../contexts/usercontextprovider";

function TipRain(props) {

    const [active, setActive] = createSignal(false)
    const [code, setCode] = createSignal('')
    const [rain, userRain, time] = useRain()
    const [user] = useUser()

    function formatTimeLeft() {
        const totalSeconds = Math.floor(time() / 1000)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    addDropdown(setActive)

    return (
        <>
            <div class='tip-rain' onClick={(e) => e.stopPropagation()}>
                <img src='/assets/icons/coin.svg' alt='' width='19'/>
                <p class='rain-amount'>
                    <Countup end={rain()?.amount || 0} gray={true}/>
                </p>

                <button class='bevel-gold' onClick={() => {
                    if (!user()) {
                        return createNotification('error', 'Please log in first')
                    }
                    
                    setActive(!active())
                }}>
                    CLAIM PROMOCODE
                </button>

                <div class={'dropdown ' + (active() ? 'active' : '')}>
                    <div class='decoration-arrow'/>
                    <div class='dropdown-container'>
                        <div class='header'>
                            <p>REDEEM PROMOCODE</p>

                            <div class='timer'>
                                <img src='/assets/icons/timer.svg' height='12'/>
                                <p>{formatTimeLeft()}</p>
                            </div>
                        </div>

                        <div class='input-wrapper'>
                            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M12 2L2 7L12 12L22 7L12 2Z' fill='#FFD700'/>
                                <path d='M2 17L12 22L22 17V11L12 16L2 11V17Z' fill='#FFD700'/>
                            </svg>
                            <input 
                                type='text' 
                                placeholder='Enter promo code' 
                                value={code()} 
                                onInput={(e) => setCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        <button class='bevel-gold tip' onClick={async () => {
                            if (!user()) {
                                return createNotification('error', 'Please log in first')
                            }
                            
                            if (!code() || code().length < 1) {
                                return createNotification('error', 'Please enter a promo code')
                            }
                            
                            let res = await authedAPI('/user/promo', 'POST', JSON.stringify({
                                code: code()
                            }), true)
                            
                            if (res && res.success) {
                                createNotification('success', `Successfully redeemed promocode ${code()}!`)
                                setCode('')
                                setActive(false)
                            }
                        }}>REDEEM</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .tip-rain {
                width: 100%;
                min-height: 48px;

                background: linear-gradient(135deg, #1A0E33 0%, #2A1850 50%, #1A0E33 100%);
                border-radius: 8px;
                border: 1px solid rgba(252, 163, 30, 0.3);
                box-shadow: 0 4px 16px rgba(252, 163, 30, 0.1), inset 0 1px 0 rgba(255, 220, 24, 0.1);
                
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 12px;

                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 14px;
                color: #FFFFFF;

                position: relative;
                overflow: hidden;
              }
              
              .tip-rain::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 220, 24, 0.1), transparent);
                animation: shine 3s infinite;
              }
              
              @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
              }

              .tip-rain button {
                outline: unset;
                border: unset;
                
                height: 36px;
                padding: 0 20px;

                background: linear-gradient(135deg, #FCA31E 0%, #FFB347 100%);
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(252, 163, 30, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);

                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 12px;
                color: #1A0E33;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                margin-left: auto;
                cursor: pointer;
                transition: all 0.2s ease;
              }
              
              .tip-rain button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(252, 163, 30, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                background: linear-gradient(135deg, #FFB347 0%, #FFC870 100%);
              }
              
              .tip-rain button:active {
                transform: translateY(0);
              }
              
              .rain-amount {
                margin-top: -2px;
                font-size: 16px;
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
              }
              
              .tip-rain img {
                filter: drop-shadow(0 2px 4px rgba(252, 163, 30, 0.4));
              }
              
              .dropdown {
                position: absolute;
                width: calc(100% - 4px);

                border-radius: 8px;

                top: 56px;
                left: 2px;
                
                max-height: 0;
                z-index: 10;
                transition: max-height .3s ease;
                overflow: hidden;
              }
              
              .dropdown.active {
                max-height: 180px;
              }

              .decoration-arrow {
                width: 16px;
                height: 10px;

                top: -9px;
                background: linear-gradient(135deg, #1A0E33 0%, #2A1850 100%);
                position: absolute;
                right: 80px;

                border-left: 1px solid rgba(252, 163, 30, 0.3);
                border-right: 1px solid rgba(252, 163, 30, 0.3);
                border-top: 1px solid rgba(252, 163, 30, 0.3);

                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
              }
              
              .dropdown-container {
                color: #FFB347;
                padding: 16px;
                
                background: linear-gradient(135deg, #1A0E33 0%, #2A1850 50%, #1A0E33 100%);
                border: 1px solid rgba(252, 163, 30, 0.3);
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                
                display: flex;
                flex-direction: column;
                gap: 12px;
              }
              
              .header {
                display: flex;
                width: 100%;
                align-items: center;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.5px;
              }
              
              .timer {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-left: auto;
                color: #FFD700;
                background: rgba(255, 215, 0, 0.1);
                padding: 4px 10px;
                border-radius: 6px;
                border: 1px solid rgba(255, 215, 0, 0.2);
                font-size: 13px;
              }
              
              .timer img {
                filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
              }
              
              .input-wrapper {
                width: 100%;
                height: 40px;

                background: rgba(28, 20, 56, 0.6);
                border: 1px solid rgba(138, 129, 205, 0.2);
                
                padding: 0px 12px;
                
                display: flex;
                align-items: center;
                gap: 10px;

                border-radius: 8px;
                transition: all 0.2s ease;
              }
              
              .input-wrapper:focus-within {
                border-color: rgba(252, 163, 30, 0.5);
                box-shadow: 0 0 12px rgba(252, 163, 30, 0.2);
              }
              
              .input-wrapper input {
                background: unset;
                border: unset;
                outline: unset;
                
                height: 100%;
                width: 100%;
                
                color: white;
                font-family: 'Geogrotesque Wide';
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
              }
              
              input::placeholder {
                color: rgba(173, 163, 239, 0.4);
              }
              
              .tip {
                outline: unset;
                border: unset;
                height: 38px;
                width: 100%;
                
                background: linear-gradient(135deg, #FCA31E 0%, #FFB347 100%);
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(252, 163, 30, 0.3);
                
                font-size: 13px;
                font-weight: 700;
                color: #1A0E33;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                cursor: pointer;
                transition: all 0.2s ease;
              }
              
              .tip:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(252, 163, 30, 0.5);
                background: linear-gradient(135deg, #FFB347 0%, #FFC870 100%);
              }
              
              .tip:active {
                transform: translateY(0);
              }
            `}</style>
        </>
    );
}

export default TipRain;
