import Games from "./games";
import {A, useSearchParams} from "@solidjs/router";
import {createEffect, createSignal} from "solid-js";
import Level from "../Level/level";
import Circularprogress from "../Level/circularprogress";
import {progressToNextLevel} from "../../resources/levels";
import BottomNavBar from "./mobilenav";
import UserDropdown from "./userdropdown";
import {addDropdown, logout} from "../../util/api";
import {useWebsocket} from "../../contexts/socketprovider";
import Countup from "../Countup/countup";
import Notifications from "./notifications";
import HamburgerMenu from "./hamburgermenu";

function NavBar(props) {

    const [searchParams, setSearchParams] = useSearchParams()
    const [userDropdown, setUserDropdown] = createSignal(false)
    const [balanceDropdown, setBalanceDropdown] = createSignal(false)
    const [hamburgerOpen, setHamburgerOpen] = createSignal(false)
    const [wagered, setWagered] = createSignal(0)
    const [ws] = useWebsocket()

    addDropdown(setUserDropdown)

    createEffect(() => {
        if (ws() && ws().connected) {
            ws().on('totalWagered', (amt) => setWagered(amt))
        }
    })

    return (
        <>
            <HamburgerMenu active={hamburgerOpen()} setActive={setHamburgerOpen} user={props.user}/>
            
            <div class='navbar-container'>
                <div class='main-navbar'>
                    <div class='content between'>
                        <div class='left-section'>
                            <button class='hamburger-btn' onClick={() => setHamburgerOpen(!hamburgerOpen())}>
                                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="20" height="2" rx="1" fill="currentColor"/>
                                    <rect y="7" width="20" height="2" rx="1" fill="currentColor"/>
                                    <rect y="14" width="20" height="2" rx="1" fill="currentColor"/>
                                </svg>
                            </button>

                            <div class='links'>
                                <button class='bevel-gold home'>
                                    <A href='/' class='gamemode-link'></A>
                                </button>
                            </div>

                            <div class='logo-wrapper'>
                                <img src='/assets/logo/bloxrazon.png' alt='BloxRazon' height='35'/>
                                <A href='/' class='gamemode-link'></A>
                            </div>
                        </div>

                        {props.user && (
                            <div class='balance-container'>
                                <div class='balance-hover'>
                                    <div className='robux'>
                                        <img className='coin' src='/assets/icons/coin.svg' height='18'/>
                                        <p>
                                            <Countup end={props?.user?.balance} gray={true}/>
                                        </p>
                                    </div>

                                    <p className='fiat'>
                                        <span class='gold'>$ </span><Countup end={props?.user?.balance / 1000 * 3.5}
                                                                             gray={true}/>
                                    </p>
                                </div>

                                <button class='deposit-button' onClick={() => setBalanceDropdown(!balanceDropdown())}>
                                    <img src='/assets/icons/wallet.svg' alt='Market'/>
                                </button>

                                <div class={'deposit-dropdown ' + (balanceDropdown() ? 'active' : '')}>
                                    <div class='decoration-arrow'/>
                                    <div class='dropdown-links'>
                                        <A href='/deposit' class='user-dropdown-link gold'
                                           onClick={() => setBalanceDropdown(false)}>
                                            <img src='/assets/icons/coin.svg' height='16'/>
                                            Deposit
                                        </A>
                                        <A href='/withdraw' class='user-dropdown-link'
                                           onClick={() => setBalanceDropdown(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11"
                                                 viewBox="0 0 14 11" fill="none">
                                                <path
                                                    d="M14 3.79815C14.0003 3.85957 13.9886 3.92045 13.9654 3.97731C13.9421 4.03417 13.9079 4.08588 13.8647 4.12949L11.0647 6.92948C11.0211 6.97273 10.9693 7.00695 10.9125 7.03018C10.8556 7.0534 10.7947 7.06517 10.7333 7.06482C10.6727 7.06556 10.6124 7.05446 10.556 7.03215C10.47 6.99684 10.3966 6.93667 10.345 6.85935C10.2935 6.78203 10.2662 6.69108 10.2667 6.59815V5.19815H6.06667C5.9429 5.19815 5.8242 5.14899 5.73668 5.06147C5.64917 4.97395 5.6 4.85525 5.6 4.73149V2.86482C5.6 2.74105 5.64917 2.62236 5.73668 2.53484C5.8242 2.44732 5.9429 2.39816 6.06667 2.39816H10.2667V0.998157C10.267 0.905863 10.2948 0.815756 10.3464 0.739231C10.398 0.662705 10.4711 0.603198 10.5565 0.568232C10.6419 0.533267 10.7358 0.524415 10.8263 0.542795C10.9167 0.561174 10.9997 0.605961 11.0647 0.671491L13.8647 3.47149C13.9509 3.55841 13.9995 3.67573 14 3.79815ZM7.93333 6.13148H3.73334V4.73149C3.73288 4.63935 3.70516 4.54942 3.65367 4.47302C3.60218 4.39661 3.52923 4.33716 3.444 4.30215C3.35902 4.26642 3.26535 4.25665 3.17482 4.27409C3.0843 4.29153 3.00096 4.3354 2.93534 4.40015L0.135341 7.20015C0.0920897 7.24376 0.0578713 7.29547 0.0346478 7.35233C0.0114244 7.40918 -0.000347283 7.47007 7.79999e-06 7.53148C-0.000347283 7.5929 0.0114244 7.65378 0.0346478 7.71064C0.0578713 7.7675 0.0920897 7.81921 0.135341 7.86282L2.93534 10.6628C2.97894 10.7061 3.03066 10.7403 3.08751 10.7635C3.14437 10.7867 3.20525 10.7985 3.26667 10.7981C3.32789 10.7997 3.38862 10.7869 3.444 10.7608C3.52923 10.7258 3.60218 10.6664 3.65367 10.5899C3.70516 10.5135 3.73288 10.4236 3.73334 10.3315V8.93148H7.93333C8.0571 8.93148 8.1758 8.88231 8.26332 8.7948C8.35083 8.70728 8.4 8.58858 8.4 8.46482V6.59815C8.4 6.47438 8.35083 6.35568 8.26332 6.26817C8.1758 6.18065 8.0571 6.13148 7.93333 6.13148Z"
                                                    fill="#ADA3EF"/>
                                            </svg>
                                            Withdraw
                                        </A>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div class='user-container'>
                            {props.user ? (
                                <>
                    <button class={'rakeback-button ' + (props.rakeback ? 'active' : '')} onClick={() => props.setRakeback(!props.rakeback)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 12V22H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22 7H2V12H22V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 22V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>                                    <Notifications/>

                                    <button class={'chat-button ' + (props.chat ? 'active' : '')} 
                                            onClick={() => props.setChat(!props.chat)}>
                                        <svg width="18" height="18" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <g>
                                                    <path d="M15.1785 0H1.82142C0.815477 0 0 0.815478 0 1.82142V11.5357C0 12.5416 0.815477 13.3571 1.82142 13.3571H3.97678L3.64651 16.326C3.60969 16.6593 3.85003 16.9593 4.18333 16.9961C4.35544 17.0151 4.52748 16.9597 4.65619 16.8439L8.53094 13.3571H15.1785C16.1845 13.3571 16.9999 12.5416 16.9999 11.5357V1.82142C16.9999 0.815478 16.1845 0 15.1785 0Z" fill="currentColor"/>
                                                </g>
                                            </g>
                                        </svg>
                                    </button>

                                    <div class='user-dropdown-minified'>
                                        <Circularprogress progress={progressToNextLevel(props?.user?.xp || 0)}>
                                            <div class='avatar'>
                                                <img
                                                    src={`${import.meta.env.VITE_SERVER_URL}/user/${props.user?.id}/img`}
                                                    width='31' height='31'/>
                                            </div>
                                        </Circularprogress>
                                    </div>

                                    <div class={'user-dropdown-wrapper ' + (userDropdown() ? 'active' : '')}
                                         onClick={(e) => {
                                             setUserDropdown(!userDropdown())
                                             e.stopPropagation()
                                         }}>
                                        <div class='avatar-wrapper'>
                                            <Circularprogress progress={progressToNextLevel(props?.user?.xp || 0)}>
                                                <div class='avatar'>
                                                    <img
                                                        src={`${import.meta.env.VITE_SERVER_URL}/user/${props.user?.id}/img`}
                                                        width='31' height='31'/>
                                                </div>
                                            </Circularprogress>
                                        </div>

                                        <svg class='arrow' width="7" height="5" viewBox="0 0 7 5" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M3.50001 0.994671C3.62547 0.994671 3.7509 1.04269 3.84655 1.13852L6.8564 4.15579C7.04787 4.34773 7.04787 4.65892 6.8564 4.85078C6.66501 5.04263 6.5 4.99467 6.16316 4.99467L3.50001 4.99467L1 4.99467C0.5 4.99467 0.335042 5.04254 0.14367 4.85068C-0.0478893 4.65883 -0.0478893 4.34764 0.14367 4.1557L3.15347 1.13843C3.24916 1.04258 3.3746 0.994671 3.50001 0.994671Z"
                                                fill="#9489DB"/>
                                        </svg>

                                        <UserDropdown user={props?.user} active={userDropdown()}
                                                      setActive={setUserDropdown}/>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button class='bevel-gray login' onClick={() => setSearchParams({modal: 'login'})}>LOGIN</button>
                                    <button class='bevel-gold register' onClick={() => setSearchParams({modal: 'login', signup: 'true'})}>REGISTER</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div class='bar'/>

                <BottomNavBar chat={props.chat} setChat={props.setChat}/>
            </div>

            <style jsx>{`
              .navbar-container {
                width: 100%;
                height: fit-content;
                z-index: 3;
                position: sticky;
                top: 0;
                font-family: 'Inter', 'Geogrotesque Wide', sans-serif;
                background: #1d2125;
              }

              .main-navbar {
                width: 100%;
                height: 70px;
                background: #1d2125;
                box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                padding: 0 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              }

              .content {
                width: 100%;
                max-width: 1400px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                gap: 20px;
              }

              .content.between {
                justify-content: space-between;
              }

              .left-section {
                display: flex;
                align-items: center;
                gap: 20px;
              }

              .hamburger-btn {
                background: transparent;
                border: none;
                color: #9A90D1;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                border-radius: 6px;
              }

              .hamburger-btn:hover {
                color: white;
                background: rgba(255, 255, 255, 0.05);
              }

              .balance-container {
                height: 45px;
                min-width: 160px;
                padding: 0 0 0 15px;
                gap: 10px;
                font-variant-numeric: tabular-nums;
                align-items: center;
                display: flex;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(20, 20, 26, 0.8);
                box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                font-weight: 700;
                font-size: 14px;
                color: white;
              }

              .balance-container > * {
                position: relative;
              }

              .balance-hover {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                width: 100%;
                cursor: pointer;
              }

              .balance-hover:hover .robux {
                opacity: 0;
              }

              .balance-hover:hover .fiat {
                opacity: 1;
              }

              .robux {
                display: flex;
                gap: 8px;
              }

              .fiat, .robux {
                transition: opacity .3s;
              }

              .fiat {
                position: absolute;
                opacity: 0;
              }

              .cents {
                color: #A7A7A7;
              }

              .deposit-button {
                outline: unset;
                border: unset;
                height: 41px;
                width: 40px;
                min-width: 40px;
                border-radius: 6px;
                background: rgba(154, 144, 209, 0.15);
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
              }

              .deposit-button:hover {
                background: rgba(154, 144, 209, 0.25);
              }

              .deposit-dropdown {
                position: absolute !important;
                top: 64px;
                right: 0;
                width: 100%;
                max-width: 180px;
                max-height: 0px;
                overflow: hidden;
                transition: max-height .3s;
              }

              .deposit-dropdown.active {
                max-height: 100px;
              }

              .decoration-arrow {
                width: 13px;
                height: 9px;
                top: 3px;
                background: linear-gradient(135deg, rgba(26, 26, 30, 0.98) 0%, rgba(30, 27, 44, 0.98) 100%);
                position: absolute;
                right: 0;
                border-left: 1px solid rgba(252, 163, 30, 0.3);
                border-right: 1px solid rgba(252, 163, 30, 0.3);
                border-top: 1px solid rgba(252, 163, 30, 0.3);
                clip-path: polygon(0% 100%, 100% 0%, 100% 100%);
              }

              .dropdown-links {
                width: 100%;
                background: linear-gradient(135deg, rgba(26, 26, 30, 0.98) 0%, rgba(30, 27, 44, 0.98) 100%);
                border: 1px solid rgba(252, 163, 30, 0.2);
                margin-top: 10px;
                padding: 10px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                box-shadow: 0 8px 32px rgba(252, 163, 30, 0.15);
              }

              .user-container {
                display: flex;
                gap: 10px;
                height: 100%;
                align-items: center;
              }

              .chat-button {
                outline: unset;
                border: unset;
                width: 43px;
                height: 43px;
                border-radius: 8px;
                background: rgba(154, 144, 209, 0.1);
                border: 1px solid rgba(154, 144, 209, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                color: #9A90D1;
              }

              .chat-button:hover {
                background: rgba(154, 144, 209, 0.15);
                border-color: rgba(154, 144, 209, 0.3);
              }

              .chat-button.active {
                background: rgba(239, 68, 68, 0.25);
                border-color: rgba(239, 68, 68, 0.5);
                color: #EF4444;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
              }

              .rakeback-button {
                outline: unset;
                border: unset;
                width: 43px;
                height: 43px;
                border-radius: 8px;
                background: rgba(154, 144, 209, 0.1);
                border: 1px solid rgba(154, 144, 209, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                color: #9A90D1;
              }

              .rakeback-button:hover {
                background: rgba(154, 144, 209, 0.15);
                border-color: rgba(154, 144, 209, 0.3);
              }

              .rakeback-button.active {
                background: rgba(239, 68, 68, 0.25);
                border-color: rgba(239, 68, 68, 0.5);
                color: #EF4444;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
              }

              .user-dropdown-wrapper {
                display: flex;
                align-items: center;
                height: 43px;
                position: relative;
                gap: 8px;
                font-weight: 600;
                font-size: 14px;
                color: #ADA3EF;
                cursor: pointer;
                padding: 0 12px;
                border-radius: 8px;
                transition: background 0.2s;
              }

              .user-dropdown-wrapper:hover {
                background: rgba(255, 255, 255, 0.03);
              }

              .avatar-wrapper {
                background: rgba(42, 43, 53, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                aspect-ratio: 1;
              }

              .user-dropdown-wrapper.active svg {
                transform: rotate(180deg);
              }

              .avatar {
                position: relative;
                height: 35px;
                width: 35px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
              }

              .avatar img {
                position: relative;
                z-index: 1;
                border-radius: 6px;
              }

              .avatar:before {
                width: 31px;
                height: 31px;
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                background: #2A2B35;
                z-index: 1;
                border-radius: 6px;
              }

              .home {
                border: unset;
                outline: unset;
                padding: unset;
                position: relative;
                height: 43px;
                width: 43px;
                background-image: url('/assets/icons/house.svg');
                background-repeat: no-repeat;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;
              }

              .home:hover {
                transform: translateY(-2px);
              }

              .login, .register {
                border: unset;
                outline: unset;
                padding: 0 20px;
                height: 40px;
                font-weight: 700;
                font-size: 13px;
                color: white;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;
              }

              .login:hover, .register:hover {
                transform: translateY(-1px);
              }

              .links {
                display: flex;
                align-items: center;
                gap: 12px;
              }

              .logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
              }

              .site-logo {
                display: flex;
                align-items: center;
                height: 40px;
                min-width: 180px;
              }

              .logo-image {
                height: 35px;
                width: auto;
                object-fit: contain;
                filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
              }

              .rakeback-button {
                outline: unset;
                border: unset;
                width: 43px;
                height: 43px;
                border-radius: 8px;
                border: 1px solid rgba(154, 144, 209, 0.2);
                background: rgba(154, 144, 209, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                color: #9A90D1;
              }

              .rakeback-button:hover {
                background: rgba(154, 144, 209, 0.15);
                border-color: rgba(154, 144, 209, 0.3);
              }

              .rakeback-button.active {
                background: rgba(239, 68, 68, 0.25);
                border-color: rgba(239, 68, 68, 0.5);
                color: #EF4444;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
              }

              .extralinks {
                display: flex;
                margin-left: auto;
                gap: 20px;
                align-items: center;
              }

              .main-links, .secondary-links {
                display: flex;
                gap: 16px;
                align-items: center;
              }

              .divider {
                width: 1px;
                height: 16px;
                background: rgba(154, 144, 209, 0.15);
              }

              .link {
                font-weight: 600;
                font-size: 12px;
                color: rgba(154, 144, 209, 0.5);
                transition: all 0.2s;
                text-decoration: none;
                letter-spacing: 0.3px;
              }

              .affiliates {
                background: linear-gradient(135deg, #E53E3E 0%, #FC8181 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              .link:hover {
                color: white;
              }

              .logout {
                color: rgba(154, 144, 209, 0.5);
                cursor: pointer;
              }

              .logout:hover {
                color: rgba(154, 144, 209, 0.8);
              }

              .leaderboard {
                background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              .bar {
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, rgba(229, 62, 62, 0.3) 0%, rgba(252, 129, 129, 0.1) 100%);
              }

              .logo-wrapper {
                display: flex;
                position: relative;
                align-items: center;
              }

              .user-dropdown-minified {
                display: none;
              }

              @media only screen and (max-width: 1000px) {
                .links, .user-dropdown-wrapper, .hamburger-btn {
                  display: none;
                }

                .logo-wrapper, .user-dropdown-minified {
                  display: block;
                }

                .balance-container {
                  height: 35px;
                  font-size: 10px;
                  left: unset;
                  position: relative;
                  transform: unset;
                }

                .deposit-button {
                  height: 31px;
                  font-size: 10px;
                }

                .coin {
                  height: 15px;
                }
              }

              @media only screen and (max-width: 375px) {
                .logo-wrapper {
                  display: none;
                }
              }
            `}</style>
        </>
    );
}

export default NavBar;
