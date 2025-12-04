import {createEffect, createSignal} from "solid-js";
import {authedAPI} from "../../util/api";

function Tile(props) {

    const [isProcessing, setIsProcessing] = createSignal(false)
    const [animate, setAnimate] = createSignal(null)
    const [pending, setPending] = createSignal(null)

    let mine = new Audio('/assets/sfx/mine.mp3')
    let tile0 = new Audio('/assets/sfx/tile0.mp3')
    let tile1 = new Audio('/assets/sfx/tile1.mp3')
    let tile2 = new Audio('/assets/sfx/tile2.mp3')

    createEffect(() => {
        if ((pending() || animate()) && !props?.game?.active) {
            setAnimate(false)
            setPending(false)
        }

        if (props?.game?.active && props?.random === props?.index && !isProcessing()) {
            clickTile(props?.index)
        }
    })

    async function clickTile(tile) {
        if (!props?.game || !props?.game.active || isProcessing() || props?.revealed.includes(tile)) return
        setIsProcessing(true)
        setAnimate(true)

        let res = await authedAPI('/mines/reveal', 'POST', JSON.stringify({ field: tile }) , true)
        if (!res.success) return setIsProcessing(false)

        setPending(res)
    }

    function handleMineClick(res) {
        try {
            console.log('[MINES] Reveal response:', res);
            
            // Check if this was an auto-cashout (all tiles revealed) by checking for minePositions
            if (res.success && res.payout && res.minePositions && !res.isMine) {
                props?.setRevealed([...props?.revealed, props?.index])
                return props?.cashoutGame(res)
            }

            if (!res.isMine) {
                console.log('[MINES] Updating revealed tiles:', res.revealedTiles, 'Multiplier:', res.multiplier);
                props?.setRevealed(res.revealedTiles || [])
                props?.setGame({
                    ...props?.game,
                    multiplier: res.multiplier,
                    currentPayout: res.currentPayout,
                    active: true,
                })

                if (props?.revealed.length < 8) {
                    tile0.play()
                } else if (props?.revealed.length < 16) {
                    tile1.play()
                } else {
                    tile2.play()
                }
            } else {
                props?.setGame({
                    ...props?.game,
                    active: false,
                })

                props?.setBombs(res.minePositions || [])
                props?.setRevealed(res.revealedTiles || [])

                mine.play()
            }

            setAnimate(null)
            setPending(null)
            setIsProcessing(false)
        } catch (e) {
            console.error('ERROR WITH MINES ', e)

            return
        }
    }

    function getTileState(tile) {
        let classNames = ''

        if (props?.bombs.includes(tile)) classNames += ' bomb'
        if (props?.revealed.includes(tile)) classNames += ' active'

        if (classNames.includes('active') && !classNames.includes('bomb'))
            return ' gem active'

        if (classNames === '' && props?.game && !props?.game.active)
            return ' gem'

        return classNames
    }

    return (
        <>
            <div
                className={'mine' + getTileState(props?.index) + (animate() ? ' animate' : '')}
                onClick={() => clickTile(props?.index)}
                onAnimationIteration={(e) => {
                    if (!pending()) return
                    handleMineClick(pending())
                }}
            >
                <img src='/assets/icons/minesgem.png' className='popin gem-img' alt=''/>
                <img src='/assets/icons/greensparkles.png' className='popin green-sparkles' alt=''/>

                <img src='/assets/icons/bomb.png' className='popin bomb-img' alt=''/>
                <img src='/assets/icons/purplesparkles.png' className='popin purple-sparkles' alt=''/>
            </div>

            <style jsx>{`
              .mine {
                aspect-ratio: 1;
                width: 100%;
                background: linear-gradient(135deg, #3E3771 0%, #3A3466 100%);
                
                border-radius: 10px;
                border-top: 3px solid #4D4686;
                border-left: 3px solid #4D4686;
                border-right: 3px solid #2D2852;
                border-bottom: 3px solid #2D2852;
                
                transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                
                display: flex;
                align-items: center;
                justify-content: center;
                
                position: relative;
                box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3),
                            inset 0px 1px 0px rgba(255, 255, 255, 0.05);
              }
              
              .mine::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 10px;
                padding: 1px;
                background: linear-gradient(135deg, rgba(173, 163, 239, 0.15), rgba(173, 163, 239, 0.02));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
              }
              
              .mine:hover {
                background: linear-gradient(135deg, #4D4686 0%, #463F7B 100%);
                transform: translateY(-3px);
                box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.4),
                            inset 0px 1px 0px rgba(255, 255, 255, 0.08);
              }
              
              .mine:hover::before {
                opacity: 1;
              }
              
              .mine:active {
                transform: translateY(-1px);
              }
              
              .mine.animate {
                animation: infinite pulseGlow .5s;
              }
              
              .mine.gem:not(.active), .mine.bomb:not(.active) {
                opacity: 0.4;
                filter: grayscale(0.3);
              }
              
              .mine.gem {
                border-radius: 10px;
                border: 2px solid #59E878;
                background: radial-gradient(139.03% 139.03% at 50% 50%, rgba(0, 255, 26, 0.55) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(0deg, rgba(11, 12, 11, 0.35) 0%, rgba(11, 12, 11, 0.35) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 2px 7px 0px rgba(0, 0, 0, 0.25) inset, 
                            0px 0px 32px 0px rgba(10, 182, 47, 0.65) inset,
                            0px 4px 20px rgba(89, 232, 120, 0.4);
                animation: gemAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              .mine.gem::before {
                background: linear-gradient(135deg, rgba(89, 232, 120, 0.3), rgba(89, 232, 120, 0.1));
                opacity: 1;
              }

              .mine.bomb {
                border-radius: 10px;
                border: 2px solid rgba(173, 4, 221, 0.5);
                background: linear-gradient(180deg, rgba(173, 4, 221, 0.25) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(0deg, rgba(18, 16, 36, 0.75) 0%, rgba(18, 16, 36, 0.75) 100%), 
                            linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 2px 7px 0px rgba(0, 0, 0, 0.25) inset, 
                            0px 0px 32px 0px rgba(66, 36, 207, 0.35) inset,
                            0px 4px 20px rgba(173, 4, 221, 0.3);
                animation: bombAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              .mine.bomb::before {
                background: linear-gradient(135deg, rgba(173, 4, 221, 0.3), rgba(173, 4, 221, 0.1));
                opacity: 1;
              }
              
              @keyframes gemAppear {
                0% {
                  transform: scale(0.7) rotate(-10deg);
                  opacity: 0;
                }
                50% {
                  transform: scale(1.05) rotate(5deg);
                }
                100% {
                  transform: scale(1) rotate(0deg);
                  opacity: 1;
                }
              }
              
              @keyframes bombAppear {
                0% {
                  transform: scale(0.5);
                  opacity: 0;
                }
                50% {
                  transform: scale(1.1);
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
              
              .popin {
                opacity: 0;
                transform: scale(0.6);
                transition: opacity .35s cubic-bezier(0.34, 1.56, 0.64, 1), 
                            transform .35s cubic-bezier(0.34, 1.56, 0.64, 1);

                position: absolute;
              }
              
              .gem-img {
                height: 100%;
                filter: drop-shadow(0px 4px 12px rgba(89, 232, 120, 0.6));
              }

              .bomb-img {
                height: 75%;
                filter: drop-shadow(0px 4px 12px rgba(173, 4, 221, 0.6));
              }
              
              .purple-sparkles {
                height: 105%;
                animation: sparkleRotate 4s linear infinite;
              }
              
              .green-sparkles {
                width: 95%;
                animation: sparkleRotate 4s linear infinite reverse;
              }
              
              @keyframes sparkleRotate {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              
              .gem .gem-img.popin, .gem .green-sparkles.popin, .bomb .bomb-img, .bomb .purple-sparkles.popin {
                opacity: 1;
                transform: scale(1);
              }

              @keyframes pulseGlow {
                0% {
                  transform: scale(1);
                  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3),
                              inset 0px 1px 0px rgba(255, 255, 255, 0.05);
                }
                50% {
                  transform: scale(1.08);
                  box-shadow: 0px 6px 20px rgba(173, 163, 239, 0.4),
                              inset 0px 1px 0px rgba(255, 255, 255, 0.1);
                }
                100% {
                  transform: scale(1);
                  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3),
                              inset 0px 1px 0px rgba(255, 255, 255, 0.05);
                }
              }
            `}</style>
        </>
    );
}

export default Tile;
