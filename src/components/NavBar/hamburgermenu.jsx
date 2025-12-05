import {A} from "@solidjs/router";
import {createEffect, createSignal, Show} from "solid-js";

function HamburgerMenu(props) {
    const [casinoActive, setCasinoActive] = createSignal(true);
    const [promotionsExpanded, setPromotionsExpanded] = createSignal(false);

    return (
        <>
            {/* Overlay */}
            <div 
                class={'hamburger-overlay ' + (props.active ? 'active' : '')} 
                onClick={() => props.setActive(false)}
            />
            
            <div class={'hamburger-menu ' + (props.active ? 'active' : '')}>
                <div class='menu-header'>
                    <div class='logo-section'>
                        <img src='/assets/logo/bloxrazon.png' height='32' alt='BloxRazon'/>
                    </div>
                    <button class='close-btn' onClick={() => props.setActive(false)}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class='menu-content'>
                        <A href='/' class='menu-item nav-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='nav-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 10L10 3L17 10M4 9V17C4 17.2652 4.10536 17.5196 4.29289 17.7071C4.48043 17.8946 4.73478 18 5 18H8V14C8 13.7348 8.10536 13.4804 8.29289 13.2929C8.48043 13.1054 8.73478 13 9 13H11C11.2652 13 11.5196 13.1054 11.7071 13.2929C11.8946 13.4804 12 13.7348 12 14V18H15C15.2652 18 15.5196 17.8946 15.7071 17.7071C15.8946 17.5196 16 17.2652 16 17V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Home</span>
                            </div>
                        </A>

                        <A href='#' class='menu-item nav-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='nav-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Favourites</span>
                            </div>
                        </A>

                        <A href='#' class='menu-item nav-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='nav-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 2L3 14H10L9 22L19 10H12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Latest Releases</span>
                            </div>
                        </A>

                        <A href='#' class='menu-item nav-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='nav-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Recently Played</span>
                            </div>
                        </A>

                        <A href='#' class='menu-item nav-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='nav-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10L8 13L15 6M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Challenges</span>
                            </div>
                            <span class='challenge-badge'>32</span>
                        </A>

                        <A href='/leaderboard' class='menu-item lottery-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='lottery-icon'>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <span class='lottery-text'>SHFL Lottery</span>
                            </div>
                            <span class='days-badge'>6d</span>
                        </A>

                        <button class={'menu-item expandable ' + (promotionsExpanded() ? 'expanded' : '')} 
                                onClick={() => setPromotionsExpanded(!promotionsExpanded())}>
                            <div class='menu-item-left'>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H16C17.1 4 18 4.9 18 6V14C18 15.1 17.1 16 16 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 4V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 10H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Promotions</span>
                            </div>
                            <svg class='chevron' width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>

                        <div class={'submenu ' + (promotionsExpanded() ? 'expanded' : '')}>
                            <A href='#' class='submenu-item' onClick={() => props.setActive(false)}>
                                <span>Daily Bonus</span>
                            </A>
                            <A href='#' class='submenu-item' onClick={() => props.setActive(false)}>
                                <span>Weekly Bonus</span>
                            </A>
                        </div>

                    <div class='menu-divider'></div>

                    <div class='menu-section games-section'>
                        <div class='section-label'>GAMES</div>
                        
                        <A href='#' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>🎮</div>
                                <span>Originals</span>
                            </div>
                        </A>

                        <A href='/slots' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>🎰</div>
                                <span>Slots</span>
                            </div>
                        </A>

                        <A href='/mines' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>💣</div>
                                <span>Mines</span>
                            </div>
                        </A>

                        <A href='/battles' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>⚔️</div>
                                <span>Case Battles</span>
                            </div>
                        </A>

                        <A href='/slots' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>🎰</div>
                                <span>Slots</span>
                            </div>
                        </A>

                        <A href='/coinflip' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>🪙</div>
                                <span>Coinflip</span>
                            </div>
                        </A>

                        <A href='/roulette' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>🎡</div>
                                <span>Roulette</span>
                            </div>
                        </A>

                        <A href='/cases' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>📦</div>
                                <span>Cases</span>
                            </div>
                        </A>

                        <A href='/jackpot' class='menu-item game-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='game-icon'>💰</div>
                                <span>Jackpot</span>
                            </div>
                        </A>
                    </div>

                    <div class='menu-divider'></div>

                    <div class='menu-section legal-section'>
                        <div class='section-label'>LEGAL & SUPPORT</div>
                        
                        <A href='/docs/provably' class='menu-item legal-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='legal-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 12L11 14L15 10M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <span>Fairness</span>
                            </div>
                        </A>
                        
                        <A href='/docs/faq' class='menu-item legal-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='legal-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M10 14V10M10 7H10.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <span>FAQ</span>
                            </div>
                        </A>
                        
                        <A href='/docs/tos' class='menu-item legal-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='legal-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 2H13L17 6V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V4C3 3.46957 3.21071 2.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H7Z" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M13 2V6H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <span>Terms of Service</span>
                            </div>
                        </A>
                        
                        <A href='/docs/aml' class='menu-item legal-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='legal-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L8 18M17 6L15 8M5 12L3 14M19 6L13 12L11 10L5 16M3 6L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>AML Policy</span>
                            </div>
                        </A>
                        
                        <A href='/docs/privacy' class='menu-item legal-item' onClick={() => props.setActive(false)}>
                            <div class='menu-item-left'>
                                <div class='legal-icon'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2L3 6V9C3 13.5 6 17 10 18C14 17 17 13.5 17 9V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 10L9.5 11.5L12 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span>Privacy Policy</span>
                            </div>
                        </A>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hamburger-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 998;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .hamburger-overlay.active {
                    opacity: 1;
                    pointer-events: all;
                }

                .hamburger-menu {
                    position: fixed;
                    top: 60px;
                    left: 0;
                    width: 320px;
                    height: calc(100vh - 60px);
                    background: #1d2125;
                    border-right: 1px solid rgba(139, 92, 246, 0.15);
                    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.6);
                    z-index: 999;
                    transform: translateX(-100%);
                    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .hamburger-menu.active {
                    transform: translateX(0);
                }

                .menu-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px;
                    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
                    background: linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%);
                }

                .logo-section img {
                    filter: drop-shadow(0 2px 8px rgba(255, 190, 24, 0.3));
                }

                .close-btn {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    color: #ADA3EF;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                }

                .close-btn:hover {
                    background: rgba(139, 92, 246, 0.2);
                    border-color: rgba(139, 92, 246, 0.4);
                    color: #8B5CF6;
                    transform: rotate(90deg);
                }

                .menu-content {
                    flex: 1;
                    padding: 8px 0;
                    overflow-y: auto;
                }

                .menu-content::-webkit-scrollbar {
                    width: 6px;
                }

                .menu-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }

                .menu-content::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 3px;
                }

                .menu-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.5);
                }

                .menu-section {
                    padding: 8px 0;
                }

                .section-label {
                    padding: 12px 20px 8px;
                    color: rgba(173, 163, 239, 0.5);
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    margin: 1px 8px;
                    color: #ADA3EF;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    width: calc(100% - 16px);
                    text-align: left;
                    position: relative;
                }

                .menu-item:hover {
                    color: #FFFFFF;
                    background: linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
                    transform: translateX(3px);
                }

                .menu-item:active {
                    transform: translateX(1px) scale(0.98);
                }

                .menu-item-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .nav-icon {
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #8C87C1;
                    transition: all 0.2s;
                }
                
                .menu-item:hover .nav-icon {
                    color: #FFBE18;
                    transform: scale(1.1);
                }
                
                .nav-icon svg {
                    width: 18px;
                    height: 18px;
                }
                
                .challenge-badge {
                    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                }
                
                .lottery-item {
                    background: rgba(245, 158, 11, 0.08);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    margin: 8px 0;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.9);
                }
                
                .lottery-item:hover {
                    background: rgba(245, 158, 11, 0.15);
                    border-color: rgba(245, 158, 11, 0.4);
                    color: #FFFFFF;
                }
                
                .lottery-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #F59E0B;
                }
                
                .lottery-text {
                    color: inherit;
                    font-weight: 600;
                }
                
                .days-badge {
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22C55E;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                }
                
                .expandable {
                    color: rgba(255, 255, 255, 0.85);
                }
                
                .expandable:hover {
                    color: #FFFFFF;
                }
                
                .chevron {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0.5;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .expandable.expanded .chevron {
                    transform: rotate(180deg);
                }
                
                .submenu {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    margin: 4px 0;
                }
                
                .submenu.expanded {
                    max-height: 300px;
                    padding: 8px 0;
                    margin: 4px 0 8px 0;
                }
                
                .submenu-item {
                    display: block;
                    padding: 10px 20px 10px 52px;
                    color: rgba(255, 255, 255, 0.7);
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.2s;
                    position: relative;
                }
                
                .submenu-item::before {
                    content: '';
                    position: absolute;
                    left: 36px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                
                .submenu-item:hover {
                    color: #FFFFFF;
                    background: rgba(255, 255, 255, 0.05);
                    padding-left: 56px;
                }
                
                .submenu-item:hover::before {
                    background: #EF4444;
                    width: 6px;
                    height: 6px;
                    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
                }

                .menu-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.15) 50%, transparent 100%);
                    margin: 12px 0;
                }

                .games-section {
                    background: rgba(0, 0, 0, 0.2);
                    margin: 8px 12px;
                    padding: 8px 0;
                    border-radius: 8px;
                    border: 1px solid rgba(239, 68, 68, 0.1);
                }

                .games-section .section-label {
                    color: rgba(252, 163, 30, 0.5);
                }
                
                .games-section .menu-item {
                    color: rgba(255, 255, 255, 0.8);
                }

                .games-section .menu-item:hover {
                    color: #FFFFFF;
                    border-left-color: #FCA31E;
                    background: rgba(252, 163, 30, 0.08);
                }

                .game-icon {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    background: rgba(252, 163, 30, 0.1);
                    border-radius: 6px;
                    border: 1px solid rgba(252, 163, 30, 0.2);
                }

                .legal-section {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(252, 163, 30, 0.03) 100%);
                    margin: 8px 12px 12px;
                    padding: 8px 0;
                    border-radius: 8px;
                    border: 1px solid rgba(252, 163, 30, 0.15);
                }

                .legal-section .section-label {
                    color: rgba(252, 163, 30, 0.5);
                }

                .menu-item.legal-item {
                    color: rgba(255, 255, 255, 0.75);
                }

                .menu-item.legal-item:hover {
                    color: #FFFFFF;
                    background: rgba(252, 163, 30, 0.1);
                    border-left-color: #FCA31E;
                }

                .legal-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: rgba(252, 163, 30, 0.6);
                    transition: all 0.2s;
                }
                
                .menu-item.legal-item:hover .legal-icon {
                    color: #FCA31E;
                }

                .legal-icon svg {
                    width: 16px;
                    height: 16px;
                }
            `}</style>
        </>
    );
}

export default HamburgerMenu;
