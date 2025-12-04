import {useWebsocket} from "../contexts/socketprovider";
import {useUser} from "../contexts/usercontextprovider";
import {createEffect, createResource, createSignal, For, onCleanup} from "solid-js";
import {authedAPI, createNotification, fetchUser} from "../util/api";
import {Meta, Title} from "@solidjs/meta";
import {formatNumber} from "../util/numbers";
import Tile from "../components/Mines/tile";

function Mines(props) {

    const [ws] = useWebsocket()
    const [user, {setBalance}] = useUser()
    const [bet, setBet] = createSignal(100)
    const [mines, setMines] = createSignal(3)
    const [revealed, setRevealed] = createSignal([])
    const [bombs, setBombs] = createSignal([])
    const [game, { mutate: setGame }] = createResource(getActiveGame)

    const [isProcessing, setIsProcessing] = createSignal(false)
    const [random, setRandom] = createSignal(null)

    let cashoutSFX = new Audio('/assets/sfx/winorcashout.mp3')

    // Note: Balance updates are handled globally in App.jsx via socket listener

    async function getActiveGame() {
        let game = await authedAPI(`/mines`, 'GET', null)

        if (!game || !game.activeGame) return null
        game = game.activeGame

        setBet(game.amount)
        setRevealed(game.revealedTiles)
        setMines(game.minesCount)
        game.active = true
        return game
    }

    async function cashout() {
        console.log('[MINES FRONTEND] Cashout function called');
        
        console.log('[MINES FRONTEND] Calling /mines/cashout API');
        let res = await authedAPI('/mines/cashout', 'POST', null, true)
        
        console.log('[MINES FRONTEND] Cashout response:', res);
        
        if (res && res.success) {
            console.log('[MINES FRONTEND] Cashout successful, calling cashoutGame');
            cashoutGame(res)
        } else {
            console.log('[MINES FRONTEND] Cashout failed:', res);
            if (res && res.error) {
                createNotification('error', `Cashout failed: ${res.error}`);
            } else {
                createNotification('error', 'Cashout failed. Please try again.');
            }
        }
    }

    async function cashoutGame(res) {
        console.log('[MINES FRONTEND] cashoutGame called with:', res);
        setGame({
            ...game(),
            payout: res.payout,
            multiplier: res.multiplier,
            active: false,
        })
        setRevealed([...revealed()]) // Ensure revealed state is preserved for display
        cashoutSFX.play()
        setBombs(res.minePositions || [])
        createNotification('success', `You won R$${formatNumber(res.payout)} from your mines round!`)
        console.log('[MINES FRONTEND] Game state after cashout:', { active: false, payout: res.payout, revealed: revealed().length });
        
        // Balance will be updated via socket event from backend
        // Socket listener in App.jsx will handle the balance update
    }

    async function startGame() {
        console.log('[MINES FRONTEND] Starting new game...');
        setGame(null)
        setRevealed([])
        setBombs([])
        setRandom(null)
        
        // Validate mines count
        const mineCount = mines();
        if (!mineCount || mineCount < 1 || mineCount > 24) {
            createNotification('error', 'Please select between 1 and 24 mines');
            return;
        }

        try {
            let res = await authedAPI('/mines/start', 'POST', JSON.stringify({ amount: bet(), minesCount: mineCount }), true)

            console.log('[MINES FRONTEND] Start game response:', res);

            if (res && res.success) {
                setGame({
                    amount: bet(),
                    multiplier: 1,
                    currentPayout: bet(),
                    active: true,
                })
                console.log('[MINES FRONTEND] Game started successfully');
                createNotification('success', 'Successfully started a mines round.')
            } else {
                console.log('[MINES FRONTEND] Start game failed:', res);
                if (res && res.error) {
                    createNotification('error', `Failed to start: ${res.error}`);
                }
            }
        } catch (error) {
            console.error('[MINES FRONTEND] Start game error:', error);
            createNotification('error', 'Failed to start game. Please try again.');
        }
    }

    function randomTile() {
        let tile
        while (!tile || revealed().includes(tile)) {
            tile = Math.floor(Math.random() * 25)
        }
        setRandom(tile)
    }

    function changeBetAmount(amt) {
        let newAmt = Math.max(0, Math.min(props?.user?.balance, bet() + amt))
        if (isNaN(newAmt)) newAmt = 0
        newAmt = Math.floor(newAmt * 100) / 100
        setBet(newAmt)
    }

    return (
        <>
            <Title>BloxRazon | Mines</Title>
            <Meta name='title' content='Mines'></Meta>
            <Meta name='description' content='Play Mines On BloxRazon And Multiply Your Robux By 100x On The Best Roblox Gaming Platform'></Meta>

            <div class='mines-container fadein'>
                <div className='betting-container'>
                    <div className='betting-header'>
                        <p>BET INTERFACE</p>
                    </div>

                    <div className='inputs'>
                        <div className='input-wrapper'>
                            <div className='input-header'>
                                <p>BET AMOUNT</p>
                            </div>

                            <div className='input-container'>
                                <img src='/assets/icons/coin.svg' height='14' width='14' alt=''/>
                                <input type='number' value={bet()} onInput={(e) => setBet(e.target.valueAsNumber)}
                                       placeholder='0' disabled={game()?.active}/>

                                <button class='bevel-light modifier' onClick={() => changeBetAmount(-bet() / 2)} disabled={game()?.active}>
                                    1/2
                                </button>

                                <button className='bevel-light modifier' onClick={() => changeBetAmount(bet())} disabled={game()?.active}>
                                    2X
                                </button>

                                <button className='bevel-light modifier' onClick={() => setBet(props?.user?.balance || 0)} disabled={game()?.active}>
                                    MAX
                                </button>
                            </div>
                        </div>

                        <div className='input-wrapper'>
                            <div className='input-header'>
                                <p>AMOUNT OF MINES</p>
                            </div>

                            <div className='input-container select-container'>
                                <select value={mines()} onChange={(e) => setMines(parseInt(e.target.value))} class='mines-select' disabled={game()?.active}>
                                    <For each={Array.from({length: 24}, (_, i) => i + 1)}>{(num) => (
                                        <option value={num}>{num} {num === 1 ? 'Mine' : 'Mines'}</option>
                                    )}</For>
                                </select>
                                <svg class='dropdown-arrow' width='12' height='8' viewBox='0 0 12 8' fill='none'>
                                    <path d='M1 1L6 6L11 1' stroke='currentColor' stroke-width='2' stroke-linecap='round'/>
                                </svg>
                            </div>
                        </div>

                        {game()?.active && (
                            <div class='current-stats'>
                                <div class='current-cashout gold-bg'>
                                    <div class='coin-prefix'>
                                        <img src='/assets/icons/coin.svg' height='16' width='18' alt=''/>
                                    </div>
                                    <p>{formatNumber(game()?.currentPayout || 0)}</p>
                                </div>

                                <div class='current-multi gold-bg'>
                                    <p>{formatNumber(game()?.multiplier || 0)}x</p>
                                </div>
                            </div>
                        )}

                        <button 
                            className={'bevel-gold bet ' + (game()?.active ? 'active' : '')} 
                            onClick={async () => {
                                console.log('[MINES FRONTEND] Button clicked. Processing:', isProcessing(), 'Game active:', game()?.active, 'Revealed count:', revealed().length);
                                
                                if (isProcessing() || !props.user) {
                                    console.log('[MINES FRONTEND] Blocked - Processing or no user');
                                    return;
                                }
                                
                                if (game()?.active && revealed().length < 1) {
                                    console.log('[MINES FRONTEND] Blocked - Need at least 1 tile revealed');
                                    return; // Can't cashout without revealing at least 1 tile
                                }
                                
                                try {
                                    setIsProcessing(true)

                                    if (!game() || !game().active) {
                                        console.log('[MINES FRONTEND] Starting new game');
                                        await startGame()
                                    } else {
                                        console.log('[MINES FRONTEND] Calling cashout function');
                                        await cashout()
                                    }
                                } catch (error) {
                                    console.error('[MINES FRONTEND] Button handler error:', error);
                                    createNotification('error', 'An error occurred. Please try again.');
                                } finally {
                                    setIsProcessing(false)
                                }
                            }}
                            disabled={isProcessing() || (game()?.active && revealed().length < 1)}
                        >
                            {game()?.active ? 'CASHOUT' : 'PLACE BET'}
                        </button>

                        {game()?.active && (
                            <button className='bevel-light random' onClick={() => randomTile()}>
                                RANDOM TILE
                            </button>
                        )}
                    </div>
                </div>

                <div class='mines-content'>
                    <div className='mines-header'>
                        <img src='/assets/icons/mines.png' height='14' width='14' alt=''/>
                        <p>MINES</p>
                    </div>

                    {game() && !game().active && (
                        <div class={'summary ' + (game().payout ? 'win' : 'loss')}>
                            <p>{game()?.payout ? 'YOU WON' : 'YOU LOST'}</p>
                            <p class='multi'>{formatNumber(game()?.multiplier || 0)}x</p>
                            <p class='amount-won'><img src='/assets/icons/coin.svg'
                                                           height='18'/> {formatNumber(game()?.payout || -game()?.amount || 0)}</p>
                            <div class='bar' style={{margin: '16px 0'}}/>
                            <button class='try' onClick={() => startGame()}>{game()?.payout ? 'PLAY AGAIN' : 'TRY AGAIN'}</button>
                        </div>
                    )}

                    <div class='mines'>
                        <For each={Array.from(Array(25))}>{(mine, index) =>
                            <Tile index={index()} revealed={revealed()} bombs={bombs()}
                                  game={game()} setGame={setGame} setRevealed={setRevealed} setBombs={setBombs} random={random()}
                                  cashoutGame={cashoutGame}
                            />
                        }</For>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .mines-container {
                width: 100%;
                max-width: 1175px;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;

                display: flex;
                gap: 20px;
              }

              .mines-header {
                width: 100%;
                min-height: 80px;
                height: 80px;
                
                background: linear-gradient(135deg, #2B2455 0%, #1E1A3A 100%);
                box-shadow: 0px -2px 0px 0px #413972, 0px 2px 15px 0px rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(173, 163, 239, 0.1);

                display: flex;
                align-items: center;
                gap: 16px;
                padding: 0 32px;

                color: #FFF;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
                position: relative;
              }
              
              .mines-header::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 6px;
                height: 100%;
                background: linear-gradient(180deg, #59E878 0%, #29D64E 100%);
                box-shadow: 0px 0px 12px rgba(89, 232, 120, 0.6);
              }
              
              .mines-header img {
                width: 36px;
                height: 36px;
                filter: drop-shadow(0px 0px 12px rgba(89, 232, 120, 0.5));
              }

              .mines-content {
                width: 100%;
                max-width: 860px;

                height: 780px;
                max-height: 100%;
                
                border-radius: 20px;
                overflow: hidden;

                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;

                background: linear-gradient(238deg, #242043 0%, #251F4E 100%);
                box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.4), 
                            inset 0px 1px 0px rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(173, 163, 239, 0.1);
              }
              
              .summary {
                height: fit-content;
                position: absolute;
                z-index: 2;
                
                display: flex;
                flex-direction: column;
                align-items: center;

                width: 100%;
                max-width: 340px;
                padding: 28px 24px;
                
                top: 0; bottom: 0;
                margin: auto;
                
                color: #FFF;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;

                border-radius: 16px;
                border: 2px solid #FF5141;
                background: radial-gradient(139.03% 139.03% at 50% 50%, rgba(255, 81, 65, 0.55) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(0deg, rgba(11, 12, 11, 0.35) 0%, rgba(11, 12, 11, 0.35) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 2px 7px 0px rgba(0, 0, 0, 0.25) inset, 
                            0px 0px 40px 0px rgba(255, 81, 65, 0.65) inset,
                            0px 8px 24px rgba(255, 81, 65, 0.4);
                backdrop-filter: blur(10px);
                animation: summaryAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              @keyframes summaryAppear {
                from {
                  transform: scale(0.85);
                  opacity: 0;
                }
                to {
                  transform: scale(1);
                  opacity: 1;
                }
              }
              
              .summary.win {
                border: 2px solid #59E878;
                background: radial-gradient(139.03% 139.03% at 50% 50%, rgba(0, 255, 26, 0.55) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(0deg, rgba(11, 12, 11, 0.35) 0%, rgba(11, 12, 11, 0.35) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 2px 7px 0px rgba(0, 0, 0, 0.25) inset, 
                            0px 0px 40px 0px rgba(10, 182, 47, 0.65) inset,
                            0px 8px 24px rgba(89, 232, 120, 0.4);
              }
              
              .amount-won {
                color: #FFF;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 4px;
              }
              
              .bar {
                background: linear-gradient(90deg, rgba(217, 217, 217, 0.00) 0%, #FF5141 47.26%, rgba(217, 217, 217, 0.00) 95.02%); 
                height: 2px; 
                width: 100%;
                max-width: 240px;
                box-shadow: 0px 0px 8px rgba(255, 81, 65, 0.6);
              }
              
              .win .bar {
                background: linear-gradient(90deg, rgba(217, 217, 217, 0.00) 0%, #59E878 47.26%, rgba(217, 217, 217, 0.00) 95.02%);
                box-shadow: 0px 0px 8px rgba(89, 232, 120, 0.6);
              }
              
              .multi {
                font-size: 32px;
                text-shadow: 0px 2px 10px rgba(255, 81, 65, 0.5);
              }
              
              .win .multi {
                background: linear-gradient(213deg, #59E878 31.52%, #88FFA2 51.19%, #29D64E 64.47%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0px 2px 10px rgba(89, 232, 120, 0.5);
              }
              
              .loss .multi {
                color: #FF5141;
              }
              
              .try {
                border: unset;
                outline: unset;

                color: #FFF;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 16px;
                font-weight: 700;
                
                padding: 0 28px;
                
                border-radius: 8px;
                background: linear-gradient(180deg, #FF6B5E 0%, #FF5141 100%);
                box-shadow: 0px 2px 0px 0px #97352C, 
                            0px -2px 0px 0px #FF8A80,
                            0px 4px 16px rgba(255, 81, 65, 0.4);
                height: 44px;
                
                cursor: pointer;
                transition: all 0.2s;
              }
              
              .try:hover {
                transform: translateY(-2px);
                box-shadow: 0px 2px 0px 0px #97352C, 
                            0px -2px 0px 0px #FF8A80,
                            0px 6px 20px rgba(255, 81, 65, 0.5);
              }
              
              .try:active {
                transform: translateY(0px);
              }
              
              .win .try {
                color: #16412D;
                background: linear-gradient(180deg, #6AFF8E 0%, #59E878 100%);
                box-shadow: 0px 2px 0px 0px #2A883E, 
                            0px -2px 0px 0px #78FF95,
                            0px 4px 16px rgba(89, 232, 120, 0.4);
              }
              
              .win .try:hover {
                box-shadow: 0px 2px 0px 0px #2A883E, 
                            0px -2px 0px 0px #78FF95,
                            0px 6px 20px rgba(89, 232, 120, 0.5);
              }
              
              .mines {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-gap: 18px;
                padding: 32px;
                
                margin: auto 0;
                
                width: 100%;
                max-width: 680px;
                overflow: hidden;
              }

              .betting-container {
                min-width: 300px;
                width: 300px;
                
                height: 780px;
                max-height: 100%;

                display: flex;
                flex-direction: column;
                gap: 0;

                border-radius: 20px;
                background: linear-gradient(277deg, #242043 -69.8%, #251F4E 144.89%);
                box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.4),
                            inset 0px 1px 0px rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(173, 163, 239, 0.1);
                overflow: hidden;
              }
              
              .betting-header {
                width: 100%;
                height: 50px;

                color: #ADA3EF;
                font-size: 13px;
                font-weight: 700;
                line-height: 50px;
                text-align: center;
                letter-spacing: 1px;
                
                background: linear-gradient(135deg, #1E1A3A 0%, #16132A 100%);
                border-bottom: 1px solid rgba(173, 163, 239, 0.1);
                box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
              }

              .betting-options {
                display: flex;
                width: 100%;
              }

              .betting-option {
                outline: unset;
                border: unset;

                flex: 1 1 0;
                height: 43px;
                line-height: 43px;
                text-align: center;

                background: #413976;
                box-shadow: 0px 1px 0px 0px #1B1734, 0px -1px 0px 0px #5B509E;

                font-family: "Geogrotesque Wide", sans-serif;
                color: #ADA3EF;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
              }

              .betting-option.active {
                color: white;
                background: #1E1A3A;
                box-shadow: unset;
              }

              .inputs {
                display: flex;
                flex-direction: column;
                padding: 20px 14px;
                gap: 18px;
              }

              .input-wrapper {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
              }

              .input-header {
                width: 100%;
                height: 36px;
                background: linear-gradient(135deg, #413976 0%, #383063 100%);

                color: #ADA3EF;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.5px;

                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 12px;
                border-bottom: 1px solid rgba(173, 163, 239, 0.1);
              }

              .input-container {
                height: 48px;
                border-radius: 0px 0px 8px 8px;
                border: 1px solid #3E3771;
                background: linear-gradient(135deg, #1F1A3C 0%, #18142E 100%);

                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                position: relative;
              }
              
              .input-container::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 0px 0px 8px 8px;
                padding: 1px;
                background: linear-gradient(135deg, rgba(173, 163, 239, 0.1), rgba(173, 163, 239, 0.02));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
              }

              .modifier {
                height: 100%;
                min-width: 42px;
                color: #ADA3EF;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 12px;
                font-weight: 700;
                transition: all 0.2s;
              }
              
              .modifier:hover {
                color: #FFF;
                transform: translateY(-1px);
              }
              
              .modifier:active {
                transform: translateY(0);
              }

              input {
                width: 100%;
                height: 100%;
                border: unset;
                outline: unset;
                background: unset;
                color: white;

                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 15px;
                font-weight: 700;
              }
              
              input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
              
              .select-container {
                position: relative;
              }
              
              .mines-select {
                width: 100%;
                height: 100%;
                border: unset;
                outline: unset;
                background: unset;
                color: white;
                
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 15px;
                font-weight: 700;
                
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                cursor: pointer;
                padding-right: 30px;
              }
              
              .mines-select:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
              
              .mines-select option {
                background: #1F1A3C;
                color: white;
                padding: 14px 20px;
                font-size: 14px;
                font-weight: 600;
              }
              
              .mines-select option:hover {
                background: #2A2550;
                color: #FF5555;
              }
              
              .mines-select option:checked {
                background: #2A2550;
                color: #FF5555;
                font-weight: 700;
              }
              
              /* Custom scrollbar for the dropdown */
              .mines-select::-webkit-scrollbar {
                width: 8px;
              }
              
              .mines-select::-webkit-scrollbar-track {
                background: #12101F;
                border-radius: 4px;
                margin: 2px;
              }
              
              .mines-select::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #FF5555 0%, #CC4444 100%);
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.3);
              }
              
              .mines-select::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #FF6666 0%, #DD5555 100%);
              }
              
              .dropdown-arrow {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                color: #ADA3EF;
              }

              .bet, .random {
                height: 48px;
                transition: all .2s;
                font-weight: 700;
                border-radius: 8px;
              }
              
              button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
              }
              
              button:disabled:hover {
                transform: none !important;
              }
              
              .random {
                background: linear-gradient(135deg, #4A4181 0%, #413976 100%);
                box-shadow: 0px 3px 0px 0px #1B1734, 
                            0px -2px 0px 0px #5B509E,
                            0px 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(173, 163, 239, 0.1);
              }
              
              .random:hover {
                transform: translateY(-2px);
                box-shadow: 0px 3px 0px 0px #1B1734, 
                            0px -2px 0px 0px #5B509E,
                            0px 6px 16px rgba(0, 0, 0, 0.4);
              }
              
              .random:active {
                transform: translateY(0);
                box-shadow: 0px 1px 0px 0px #1B1734, 
                            0px -1px 0px 0px #5B509E;
              }

              .bet.active {
                outline: unset;
                box-shadow: 0px 4px 0px 0px #C87E0F,
                            0px -2px 0px 0px #FFD666,
                            0px 4px 20px rgba(252, 163, 30, 0.5);

                border-radius: 8px;
                border: 2px solid #FCA31E;
                background: linear-gradient(135deg, rgba(252, 163, 30, 0.35) 0%, rgba(252, 163, 30, 0.25) 100%);

                color: #FCA31E;
                text-shadow: 0px 2px 8px rgba(252, 163, 30, 0.5);
              }
              
              .bet.active:hover {
                transform: translateY(-2px);
                box-shadow: 0px 4px 0px 0px #C87E0F,
                            0px -2px 0px 0px #FFD666,
                            0px 6px 24px rgba(252, 163, 30, 0.6);
              }
              
              .bet.active:active {
                transform: translateY(0);
              }
              
              .current-stats {
                display: flex;
                min-height: 48px;
                gap: 10px;
              }
              
              .current-cashout {
                flex: 1;
                height: 100%;
                padding: 0 12px;
                
                display: flex;
                gap: 10px;
                align-items: center;

                color: #FFF;
                font-size: 15px;
                font-weight: 700;
              }
              
              .coin-prefix {
                border-radius: 8px;
                border: 1px solid #B17818;
                background: linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), 
                            linear-gradient(0deg, rgba(255, 190, 24, 0.35) 0%, rgba(255, 190, 24, 0.35) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 0px 12px rgba(255, 190, 24, 0.3),
                            inset 0px 1px 3px rgba(255, 190, 24, 0.2);
              
                height: 36px;
                width: 36px;
                
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .current-multi {
                height: 100%;
                padding: 0 16px;

                color: #FFF;
                font-size: 15px;
                font-weight: 700;
                line-height: 48px;
              }
              
              .gold-bg {
                border-radius: 8px;
                background: linear-gradient(180deg, rgba(177, 120, 24, 0.6), rgba(156, 99, 15, 0.4), rgba(126, 80, 12, 0.3), rgba(102, 65, 10, 0.4), rgba(177, 120, 24, 0.6), rgba(255, 220, 24, 0.6), rgba(255, 220, 24, 0.5));
                position: relative;
                z-index: 0;
                box-shadow: 0px 4px 16px rgba(255, 190, 24, 0.3);
              }
              
              .gold-bg:before {
                position: absolute;
                top: 1px;
                left: 1px;
                content: '';
                z-index: -1;

                border-radius: 8px;
                width: calc(100% - 2px);
                height: calc(100% - 2px);

                background: linear-gradient(0deg, rgba(255, 190, 24, 0.35) 0%, rgba(255, 190, 24, 0.35) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
              }
              
              .current-multi p {
                background: linear-gradient(53deg, #F90 54.58%, #F9AC39 69.11%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0px 2px 8px rgba(255, 153, 0, 0.4);
                filter: drop-shadow(0px 2px 8px rgba(255, 153, 0, 0.4));
              }

              @keyframes pulse {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.05);
                }
                100% {
                  transform: scale(1);
                }
              }

              @media only screen and (max-width: 1000px) {
                .mines-container {
                  padding-bottom: 90px;
                }
              }

              @media only screen and (max-width: 800px) {
                .mines-container {
                  flex-direction: column;
                }
                
                .betting-container {
                  width: 100%;
                  gap: 0;
                  height: fit-content;
                }
                
                .inputs {
                  padding: 16px 10px;
                }
              }

              @media only screen and (max-width: 600px) {
                .mines {
                  grid-gap: 12px;
                }
              }
            `}</style>
        </>
    );
}

export default Mines;
