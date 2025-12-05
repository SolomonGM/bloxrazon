import {A} from "@solidjs/router";
import {createSignal, Show} from "solid-js";

function NavSidebar(props) {
    const [gamesExpanded, setGamesExpanded] = createSignal(false);

    return (
        <>
            <div class={'nav-sidebar ' + (props.active ? 'expanded' : 'collapsed')}>
                <div class='sidebar-content'>
                    {/* Home */}
                    <A href='/' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12L12 3L21 12M5 10V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H10V16C10 15.7348 10.1054 15.4804 10.2929 15.2929C10.4804 15.1054 10.7348 15 11 15H13C13.2652 15 13.5196 15.1054 13.7071 15.2929C13.8946 15.4804 14 15.7348 14 16V21H18C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Home</span>
                        </Show>
                    </A>

                    {/* Slots */}
                    <A href='/slots' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                                <path d="M9 3V21M15 3V21M3 9H21M3 15H21" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Slots</span>
                        </Show>
                    </A>

                    {/* Roulette */}
                    <A href='/roulette' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                <path d="M12 3V7M12 17V21M21 12H17M7 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Roulette</span>
                        </Show>
                    </A>

                    {/* Jackpot */}
                    <A href='/jackpot' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Jackpot</span>
                        </Show>
                    </A>

                    {/* Blackjack */}
                    <A href='/blackjack' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="7" height="10" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="13" y="4" width="7" height="10" rx="1" stroke="currentColor" stroke-width="2"/>
                                <path d="M7.5 7V11M16.5 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Blackjack</span>
                        </Show>
                    </A>

                    {/* Crash */}
                    <A href='/crash' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M4 8L12 12M12 12L20 8M12 12V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Crash</span>
                        </Show>
                    </A>

                    {/* Cases */}
                    <A href='/cases' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 7H21M3 7L6 3H18L21 7M3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Cases</span>
                        </Show>
                    </A>

                    {/* Battles */}
                    <A href='/battles' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Case Battles</span>
                        </Show>
                    </A>

                    {/* Coinflip */}
                    <A href='/coinflip' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 3C7.03 3 3 7.03 3 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Coinflip</span>
                        </Show>
                    </A>

                    {/* Mines */}
                    <A href='/mines' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                <path d="M12 2V6M12 18V22M22 12H18M6 12H2M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Mines</span>
                        </Show>
                    </A>

                    <div class='sidebar-divider'></div>

                    {/* Leaderboard */}
                    <A href='/leaderboard' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 21V13M16 21V9M12 21V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Leaderboard</span>
                        </Show>
                    </A>

                    {/* Profile */}
                    <Show when={props.user}>
                        <A href='/profile' class='sidebar-item' activeClass='active'>
                            <div class='icon-wrapper'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <Show when={props.active}>
                                <span class='label'>Profile</span>
                            </Show>
                        </A>
                    </Show>

                    {/* Affiliates */}
                    <A href='/affiliates' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Affiliates</span>
                        </Show>
                    </A>

                    <div class='sidebar-divider'></div>

                    {/* FAQ */}
                    <A href='/docs/faq' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>FAQ</span>
                        </Show>
                    </A>

                    {/* Provably Fair */}
                    <A href='/docs/provably' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Provably Fair</span>
                        </Show>
                    </A>

                    {/* Terms of Service */}
                    <A href='/docs/tos' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Terms of Service</span>
                        </Show>
                    </A>

                    {/* Privacy Policy */}
                    <A href='/docs/privacy' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>Privacy Policy</span>
                        </Show>
                    </A>

                    {/* AML */}
                    <A href='/docs/aml' class='sidebar-item' activeClass='active'>
                        <div class='icon-wrapper'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <Show when={props.active}>
                            <span class='label'>AML</span>
                        </Show>
                    </A>
                </div>
            </div>

            <style jsx>{`
              .nav-sidebar {
                position: fixed;
                left: 0;
                top: 60px;
                height: calc(100vh - 60px);
                background: #1e1b2e;
                border-right: 1px solid rgba(67, 56, 120, 0.3);
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 100;
                overflow-y: auto;
                overflow-x: hidden;
              }

              .nav-sidebar.collapsed {
                width: 60px;
              }

              .nav-sidebar.expanded {
                width: 280px;
              }

              .nav-sidebar::-webkit-scrollbar {
                width: 6px;
              }

              .nav-sidebar::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.3);
              }

              .nav-sidebar::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.4);
                border-radius: 3px;
              }

              .nav-sidebar::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.6);
              }

              .sidebar-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: 12px 6px;
              }

              .sidebar-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 16px;
                border-radius: 6px;
                color: #8C87C1;
                text-decoration: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                white-space: nowrap;
                position: relative;
                font-family: 'Geogrotesque Wide', sans-serif;
                font-size: 14px;
                font-weight: 500;
              }

              .nav-sidebar.collapsed .sidebar-item {
                justify-content: center;
                padding: 14px 8px;
              }

              .sidebar-item:hover {
                background: linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
                color: #ADA3EF;
                transform: translateX(2px);
              }

              .sidebar-item.active {
                background: linear-gradient(90deg, rgba(255, 190, 24, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                color: #FFBE18;
                border-left: 3px solid #FCA31E;
                padding-left: 13px;
              }

              .nav-sidebar.collapsed .sidebar-item.active {
                border-left: none;
                border-bottom: 3px solid #FCA31E;
                padding: 14px 8px 11px;
              }

              .icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: 24px;
                height: 24px;
              }

              .icon-wrapper svg {
                width: 20px;
                height: 20px;
              }

              .label {
                font-family: 'Geogrotesque Wide', sans-serif;
                font-weight: 600;
                font-size: 13px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              }

              .sidebar-divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%);
                margin: 10px 12px;
              }

              .nav-sidebar.collapsed .sidebar-divider {
                margin: 10px 8px;
              }

              @media (max-width: 768px) {
                .nav-sidebar {
                  transform: translateX(-100%);
                  box-shadow: none;
                }
                
                .nav-sidebar.expanded {
                  transform: translateX(0);
                  width: 280px;
                  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.5);
                }
                
                .nav-sidebar.collapsed {
                  transform: translateX(-100%);
                }
              }
            `}</style>
        </>
    );
}

export default NavSidebar;
