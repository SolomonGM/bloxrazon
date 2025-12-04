import {createSignal, For} from "solid-js";
import {A} from "@solidjs/router";
import GameTag from "./gametag";

function GamesList() {

    const gamemodes = [
        {
            icon: '/assets/icons/battles.svg',
            title: 'CASE BATTLES',
            type: 'PVP',
            image: '/assets/gamemodes/battles.png',
            link: '/battles',
            description: 'Battle against other players'
        },
        {
            icon: '/assets/icons/slot.svg',
            title: 'SLOTS',
            type: 'PROVIDER',
            image: '/assets/gamemodes/slots.png',
            link: '/slots',
            description: 'Spin the reels for big wins'
        },
        {
            icon: '/assets/icons/mines.svg',
            title: 'MINES',
            type: 'HOUSE',
            image: '/assets/gamemodes/mines.png',
            link: '/mines',
            description: 'Avoid the mines, win big'
        },
        {
            icon: '/assets/icons/roulette.svg',
            title: 'ROULETTE',
            type: 'HOUSE',
            image: '/assets/gamemodes/roulette.png',
            link: '/roulette',
            description: 'Classic casino roulette'
        },
        {
            icon: '/assets/icons/coinflip.svg',
            title: 'COINFLIP',
            type: 'PVP',
            image: '/assets/gamemodes/coinflip.png',
            link: '/coinflip',
            description: 'Flip coins, double or nothing'
        },
        {
            icon: '/assets/icons/cases.svg',
            title: 'CASES',
            type: 'PVP',
            image: '/assets/gamemodes/cases.png',
            link: '/cases',
            description: 'Open cases for rewards'
        },
        {
            icon: '/assets/icons/jackpot.svg',
            title: 'JACKPOT',
            type: 'PVP',
            image: '/assets/gamemodes/jackpot.png',
            link: '/jackpot',
            description: 'Win the grand jackpot'
        },
    ];

    return (
        <>
            <div class='games'>
                <div class='games-header'>
                    <svg class='cube' width="22" height="25" viewBox="0 0 19 22" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 6.7481V10.7158L3.62116 12.8067V8.6235L0.013838 6.5412C0.00470492 6.60928 0 6.67839 0 6.7481Z" fill="url(#cube-gradient)"/>
                        <path d="M4.80713 13.4916L8.43192 15.5845V11.4006L4.80713 9.30817V13.4916Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M9.02488 6.18939L5.40063 8.28126L9.02488 10.3734L12.6491 8.28126L9.02488 6.18939Z" fill="url(#cube-gradient)"/>
                        <path d="M9.61792 15.5845L13.2427 13.4916V9.30817L9.61792 11.4006V15.5845Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M18.036 6.5412L14.4287 8.6235V12.8067L18.0499 10.7158V6.7481C18.0499 6.67839 18.0452 6.60928 18.036 6.5412Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M17.2701 5.39649C16.4397 4.91667 15.1589 4.17685 13.8357 3.41272L10.2114 5.50462L13.8356 7.59649L17.4443 5.5134C17.3893 5.47086 17.3312 5.43168 17.2701 5.39649Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M12.6493 2.72784C11.5729 2.1064 10.5499 1.51596 9.80559 1.0867C9.56485 0.947928 9.29485 0.87854 9.02485 0.87854C8.75481 0.87854 8.48477 0.947928 8.24391 1.08678C7.516 1.50742 6.49013 2.09968 5.40112 2.72828L9.02481 4.81987L12.6493 2.72784Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M4.21534 3.41302C2.91307 4.16474 1.64005 4.89962 0.780915 5.39608C0.719593 5.43143 0.661355 5.47073 0.606201 5.51343L4.21478 7.59648L7.83899 5.50461L4.21534 3.41302Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M0 15.3681C0 15.9246 0.298939 16.4424 0.780105 16.7198L0.780698 16.7202C1.50846 17.1407 2.53322 17.7323 3.62116 18.3603V14.1763L0 12.0854V15.3681Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M4.80713 19.045C6.11047 19.7973 7.38482 20.533 8.24464 21.0298C8.30536 21.0648 8.36795 21.0953 8.43192 21.1215V16.9542L4.80713 14.8611V19.045Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M9.61792 21.1214C9.68209 21.0952 9.74487 21.0646 9.80576 21.0295C10.6859 20.5219 11.9557 19.7889 13.2427 19.0458V14.8611L9.61792 16.9542V21.1214Z" fill="url(#cube-gradient)"/>
                        <path
                            d="M14.4287 18.3609C15.5338 17.7227 16.5641 17.1276 17.2692 16.7201C17.751 16.4424 18.0499 15.9245 18.0499 15.3681V12.0853L14.4288 14.1762V18.3609H14.4287Z" fill="url(#cube-gradient)"/>
                        <defs>
                            <linearGradient id="cube-gradient" x1="9" y1="0" x2="9" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#FCA31E"/>
                                <stop offset="1" stop-color="#F59518"/>
                            </linearGradient>
                        </defs>
                    </svg>

                    <div class='header-text'>
                        <h2>FEATURED <span>GAMES</span></h2>
                        <p>Choose your game and start winning</p>
                    </div>
                </div>

                <div class='games-grid'>
                    <For each={gamemodes}>{(game) =>
                        <A href={game.link} class='game-card'>
                            {game.tag && (
                                <div class={'game-badge ' + game.tag}>
                                    {game.tag}
                                </div>
                            )}
                            <div className='game-thumbnail'
                                 style={{'background-image': `url(${game?.image})`}}>
                                <div class='game-overlay'>
                                    <svg class='play-btn' width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.1)" />
                                        <circle cx="20" cy="20" r="18" stroke="white" stroke-width="2" />
                                        <path d="M16 12L28 20L16 28V12Z" fill="white"/>
                                    </svg>
                                </div>
                            </div>
                            <div className='game-info'>
                                <div class='game-header-info'>
                                    <img src={game.icon} alt='' height='20'/>
                                    <h3>{game.title}</h3>
                                </div>
                                <p class='game-description'>{game.description}</p>
                                <div class='game-type-badge'>{game.type}</div>
                            </div>
                        </A>
                    }</For>
                </div>
            </div>

            <style jsx>{`
              .games {
                width: 100%;
                margin-top: 40px;
              }

              .games-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                padding: 25px;
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(252, 163, 30, 0.1) 0%, rgba(138, 116, 249, 0.05) 100%);
                border: 1px solid rgba(252, 163, 30, 0.2);
              }

              .cube {
                filter: drop-shadow(0 4px 8px rgba(252, 163, 30, 0.4));
              }

              .header-text h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                color: #FFF;
                letter-spacing: 1px;
              }

              .header-text h2 span {
                background: linear-gradient(135deg, #FCA31E 0%, #F59518 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              .header-text p {
                margin: 5px 0 0 0;
                font-size: 14px;
                color: #ADA3EF;
                font-weight: 600;
              }

              .games-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
              }

              .game-card {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                background: linear-gradient(135deg, #1A1825 0%, #252139 100%);
                border: 1px solid rgba(138, 116, 249, 0.15);
                transition: all .3s ease;
                cursor: pointer;
                text-decoration: none;
                display: flex;
                flex-direction: column;
              }

              .game-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(252, 163, 30, 0.15) 0%, transparent 70%);
                opacity: 0;
                transition: opacity .5s ease;
                pointer-events: none;
              }

              .game-card:hover::before {
                opacity: 1;
              }

              .game-card:hover {
                transform: translateY(-10px);
                border-color: rgba(252, 163, 30, 0.6);
                box-shadow: 0 15px 50px rgba(252, 163, 30, 0.3), 0 5px 20px rgba(138, 116, 249, 0.2);
              }

              .game-badge {
                position: absolute;
                top: 12px;
                right: 12px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                z-index: 2;
              }

              .game-badge.hot {
                background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
              }

              .game-badge.new {
                background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.5);
              }

              .game-thumbnail {
                width: 100%;
                height: 180px;
                background-size: cover;
                background-position: center;
                position: relative;
                transition: all .3s ease;
              }

              .game-card:hover .game-thumbnail {
                transform: scale(1.06);
              }

              .game-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(252, 163, 30, 0.1) 0%, rgba(0,0,0,0.8) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all .3s ease;
              }

              .game-card:hover .game-overlay {
                opacity: 1;
              }

              .play-btn {
                transform: scale(0.7);
                transition: all .3s ease;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
              }

              .game-card:hover .play-btn {
                transform: scale(1.1);
                filter: drop-shadow(0 6px 15px rgba(252, 163, 30, 0.6));
              }

              .game-info {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex: 1;
              }

              .game-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
              }

              .game-header-info h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 800;
                color: #FFF;
                letter-spacing: 0.5px;
                transition: color .3s ease;
              }

              .game-card:hover .game-header-info h3 {
                color: #FCA31E;
              }

              .game-description {
                margin: 0;
                font-size: 13px;
                color: #ADA3EF;
                font-weight: 600;
                flex: 1;
              }

              .game-type-badge {
                display: inline-block;
                padding: 6px 14px;
                border-radius: 20px;
                background: rgba(138, 116, 249, 0.15);
                border: 1px solid rgba(138, 116, 249, 0.3);
                color: #ADA3EF;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                width: fit-content;
                transition: all .3s;
              }

              .game-card:hover .game-type-badge {
                background: rgba(252, 163, 30, 0.2);
                border-color: rgba(252, 163, 30, 0.5);
                color: #FCA31E;
              }

              @media only screen and (max-width: 768px) {
                .games-grid {
                  grid-template-columns: 1fr;
                }

                .games-header {
                  flex-direction: column;
                  text-align: center;
                  padding: 20px;
                }

                .header-text h2 {
                  font-size: 24px;
                }
              }
            `}</style>
        </>
    );
}

export default GamesList;
