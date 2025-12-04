import {createEffect, createResource, createSignal, For, onCleanup, Show} from "solid-js";
import {useWebsocket} from "../contexts/socketprovider";
import {useUser} from "../contexts/usercontextprovider";
import Avatar from "../components/Level/avatar";
import {getCents} from "../util/balance";
import {api} from "../util/api";
import Loader from "../components/Loader/loader";
import {Meta, Title} from "@solidjs/meta";

function Leaderboard(props) {


    const [period, setPeriod] = createSignal('daily')
    const [placements, setPlacements] = createSignal([])
    const [leaderboard, {mutate}] = createResource(() => period(), fetchLB)
    const [time, setTime] = createSignal(0)
    
    let audioEnabled = false;
    let confettiAudio;
    
    // Enable confetti audio on first user interaction
    createEffect(() => {
      const enableAudio = () => {
        if (!audioEnabled) {
          audioEnabled = true;
          confettiAudio = new Audio('/assets/sfx/winorcashout.mp3');
          confettiAudio.volume = 0.5;
          confettiAudio.load();
        }
      };
      
      if (typeof window !== 'undefined') {
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
        onCleanup(() => {
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('keydown', enableAudio);
        });
      }
    });
    
    function playConfettiSFX() {
      try {
        if (confettiAudio && audioEnabled) {
          confettiAudio.currentTime = 0;
          confettiAudio.play().catch(err => console.log('Confetti audio failed:', err));
        } else {
          // Fallback if audio wasn't preloaded
          const audio = new Audio('/assets/sfx/winorcashout.mp3');
          audio.volume = 0.5;
          audio.play().catch(err => console.log('Confetti audio failed:', err));
        }
      } catch (err) {
        console.log('Audio playback error:', err);
      }
    }

    // Podium reveal animation state
    const [showBronze, setShowBronze] = createSignal(false);
    const [showSilver, setShowSilver] = createSignal(false);
    const [showGold, setShowGold] = createSignal(false);
    const [showConfetti, setShowConfetti] = createSignal(false);
    const [showFlash, setShowFlash] = createSignal(false);

    let confettiCanvasRef;

    // Animate podiums - audio plays first, then bronze 1 second later
    createEffect(() => {
      // Play intro audio immediately
      const audio = new Audio('/assets/sfx/lets go gambling.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.log('Intro audio failed:', err));
      
      // Bronze appears 1 second after audio starts
      const bronzeTimeout = setTimeout(() => {
        setShowBronze(true);
        const silverTimeout = setTimeout(() => {
          setShowSilver(true);
          const goldTimeout = setTimeout(() => {
            setShowGold(true);
            setShowConfetti(true);
            setShowFlash(true);
            playConfettiSFX();
            
            // Initialize professional canvas confetti
            if (confettiCanvasRef) {
              initCanvasConfetti(confettiCanvasRef);
            }
            
            setTimeout(() => setShowFlash(false), 600);
          }, 1500); // gold 1.5s after silver
          onCleanup(() => clearTimeout(goldTimeout));
        }, 1500); // silver 1.5s after bronze
        onCleanup(() => clearTimeout(silverTimeout));
      }, 1000); // bronze 1 second after audio
      onCleanup(() => clearTimeout(bronzeTimeout));
    });

    async function fetchLB(period) {
        try {
            let lb = await api(`/leaderboard/${period}`, 'GET', null)
            if (lb.users) { setPlacements(lb.users) }
            if (lb.endsIn) {
                lb.endsAt = Date.now() + lb.endsIn
                setTime(lb.endsAt - Date.now())
            }

            return mutate(lb)
        } catch (e) {
            console.log(e)
            return mutate(null)
        }
    }

    const timer = setInterval(() => {
        if (!leaderboard() || !leaderboard().endsAt) return
        setTime(leaderboard().endsAt - Date.now())
    }, 1000)
    onCleanup(() => clearInterval(timer))

    function formatTimeLeft() {
        const totalSeconds = Math.floor(time() / 1000)
        const days = Math.floor(totalSeconds / 86400)
        const hours = Math.floor((totalSeconds % 86400) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    }
    
    function initCanvasConfetti(canvas) {
      const ctx = canvas.getContext('2d');
      const particles = [];
      const particleCount = 150;
      const colors = ['#00ffe7', '#ff00c8', '#fca31e', '#8b5dff', '#ffffff', '#59E878'];
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 3,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20 - 5,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          alpha: 1,
          gravity: 0.3,
          drag: 0.98,
          shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
      }
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(p => {
          if (p.alpha <= 0) return;
          
          activeParticles++;
          
          // Update physics
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          
          // Fade out
          if (p.y > canvas.height / 2) {
            p.alpha -= 0.01;
          }
          
          // Draw with glow effect
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = p.alpha;
          
          // Glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          
          if (p.shape === 'rect') {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
          
          ctx.restore();
        });
        
        if (activeParticles > 0) {
          requestAnimationFrame(animate);
        }
      }
      
      animate();
    }

    return (
      <>
        <Title>BloxRazon | Leaderboard</Title>
        <Meta name='title' content='Leaderboard'></Meta>
        <Meta name='description' content='Bet Robux On BloxRazon The Best Roblox Gaming Platform To Win Free Robux And Prizes!'></Meta>

        <div class='leaderboard-container fadein'>
          {/* Confetti effect */}
          <Show when={showConfetti()}>
            <canvas 
              ref={confettiCanvasRef}
              class="confetti-canvas"
              width={typeof window !== 'undefined' ? window.innerWidth : 1920}
              height={typeof window !== 'undefined' ? window.innerHeight : 1080}
            />
          </Show>
          {/* Flash effect */}
          <Show when={showFlash()}>
            <div class="flash-effect"></div>
          </Show>
                <div class='leaderboard-banner'>
                    <img class='art' src='/assets/art/goldswiggle.png' width='380' height='86'/>
                    <img class='art right' src='/assets/art/goldswiggle.png' width='380' height='86'/>

                    <img class='coin' src='/assets/icons/coin.svg' width='100' height='88'/>
                    <img class='coin two' src='/assets/icons/coinreverse.png' width='53' height='57'/>
                    <img class='coin three' src='/assets/icons/coin.svg' width='96' height='86'/>
                    <img class='coin four' src='/assets/icons/coinreverse.png' width='63' height='68'/>

                    <h1 class='title'>CLASH LEADERBOARD</h1>
                    <p class='desc'>
                        <span class='gold'>CLASH LEADERBOARD</span> showcases the top wagering users competing daily and weekly for amazing prizes! 
                        Climb the ranks and win <span class='gold'>$1,000+ IN WEEKLY REWARDS!</span>
                    </p>

                    <div class='periods'>
                        <button class={'period bevel-gold ' + (period() === 'daily' ? 'active' : '')} onClick={() => setPeriod('daily')}>DAILY</button>
                        <button class={'period bevel-gold ' + (period() === 'weekly' ? 'active' : '')} onClick={() => setPeriod('weekly')}>WEEKLY</button>
                    </div>
                </div>

                <Show when={!leaderboard.loading} fallback={<Loader/>}>
                    <>
                        <div className='time'>
                            <img src='/assets/icons/timer.svg' width='19' height='22' alt=''/>
                            <p>{formatTimeLeft()}</p>
                        </div>

                        <div className='podium-container'>
                          <Show when={showBronze()}>
                            <div className='podium third podium-animate-bronze'>
                              <p className='tag'>3rd PLACE</p>
                              <Avatar id={placements()[2] ? placements()[2]?.id || 'Anonymous' : '?'} height='68' xp='bronze'/>
                              <p>{placements()[2] ? placements()[2]?.username || 'Anonymous' : 'No User'}</p>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[2]?.wagered || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div className='bar'/>
                              <img className='item' src={placements()[2]?.item} alt='' height='56'/>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[2]?.reward || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          </Show>
                          <Show when={showSilver()}>
                            <div className='podium second podium-animate-silver'>
                              <p className='tag'>2nd PLACE</p>
                              <Avatar id={placements()[1] ? placements()[1]?.id || 'Anonymous' : '?'} height='68' xp='silver'/>
                              <p>{placements()[1] ? placements()[1]?.username || 'Anonymous' : 'No User'}</p>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[1]?.wagered || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div className='bar'/>
                              <img className='item' src={placements()[1]?.item} alt='' height='56'/>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[1]?.reward || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          </Show>
                          <Show when={showGold()}>
                            <div className='podium first podium-animate-gold'>
                              <p className='tag'>1st PLACE</p>
                              <Avatar id={placements()[0] ? placements()[0]?.id || 'Anonymous' : '?'} height='68' xp='gold'/>
                              <p>{placements()[0] ? placements()[0]?.username || 'Anonymous' : 'No User'}</p>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[0]?.wagered || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div className='bar'/>
                              <img className='item' src={placements()[0]?.item} alt='' height='56'/>
                              <div className='cost'>
                                <img src='/assets/icons/coin.svg' height='14' width='15' alt=''/>
                                <p>{(placements()[0]?.reward || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          </Show>
                        </div>

                        <div className='bar divider'/>

                        <div className='table-header'>
                            <div className='table-column'>
                                <p>PLACE</p>
                            </div>

                            <div className='table-column'>
                                <p>USER</p>
                            </div>

                            <div className='table-column'>
                                <p>WAGERED</p>
                            </div>

                            <div className='table-column'>
                                <p>REWARD</p>
                            </div>
                        </div>

                        <For each={placements().slice(3)}>{(placement, index) => (
                            <div className='table-data'>
                                <div className='table-column'>
                                    <p>#{index() + 4}</p>
                                </div>

                                <div className='table-column'>
                                    <Avatar id={placement?.id} height='30'/>
                                    <p>{placement?.username || 'Anonymous'}</p>
                                </div>

                                <div className='table-column'>
                                    <img src='/assets/icons/coin.svg' height='15' width='16' alt=''/>
                                    <p>{(placement?.wagered || 0)?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</p>
                                </div>

                                <div className='table-column gold'>
                                    <img src='/assets/icons/coin.svg' height='15' width='16' alt=''/>
                                    <p>{(placement?.reward || 0).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</p>
                                </div>
                            </div>
                        )}</For>
                    </>
                </Show>
            </div>

            <style jsx>{`
              .leaderboard-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;
              }
              
              /* Enhanced podium animations */
              .podium-animate-bronze {
                animation: podiumRiseBronze 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
              }
              
              .podium-animate-silver {
                animation: podiumRiseSilver 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
              }
              
              .podium-animate-gold {
                animation: podiumRiseGold 1.0s cubic-bezier(0.34, 1.56, 0.64, 1) both;
              }
              
              @keyframes podiumRiseBronze {
                0% {
                  opacity: 0;
                  transform: translateY(100px) scale(0.7) rotate(-5deg);
                  filter: blur(8px) brightness(0.5);
                }
                60% {
                  opacity: 0.8;
                  transform: translateY(-20px) scale(1.1) rotate(2deg);
                  filter: blur(2px) brightness(1.2);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1) rotate(0deg);
                  filter: blur(0) brightness(1);
                }
              }
              
              @keyframes podiumRiseSilver {
                0% {
                  opacity: 0;
                  transform: translateY(120px) scale(0.6) rotate(8deg);
                  filter: blur(10px) brightness(0.4) saturate(0.5);
                }
                50% {
                  opacity: 0.7;
                  transform: translateY(-30px) scale(1.15) rotate(-3deg);
                  filter: blur(3px) brightness(1.3) saturate(1.2);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1) rotate(0deg);
                  filter: blur(0) brightness(1) saturate(1);
                }
              }
              
              @keyframes podiumRiseGold {
                0% {
                  opacity: 0;
                  transform: translateY(150px) scale(0.5) rotate(-12deg);
                  filter: blur(15px) brightness(0.3) saturate(0.3) hue-rotate(180deg);
                }
                40% {
                  opacity: 0.6;
                  transform: translateY(-40px) scale(1.2) rotate(5deg);
                  filter: blur(5px) brightness(1.4) saturate(1.5) hue-rotate(90deg);
                }
                80% {
                  opacity: 0.9;
                  transform: translateY(10px) scale(0.95) rotate(-1deg);
                  filter: blur(1px) brightness(1.1) saturate(1.1) hue-rotate(0deg);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1) rotate(0deg);
                  filter: blur(0) brightness(1) saturate(1) hue-rotate(0deg);
                  box-shadow: 0 0 30px #fca31e, 0 0 60px #fca31e40;
                }
              }
              
              /* Professional high-quality flash effect */
              .flash-effect {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: 
                  radial-gradient(circle at 50% 40%, 
                    rgba(255, 255, 255, 0.8) 0%, 
                    rgba(252, 163, 30, 0.6) 15%, 
                    rgba(0, 255, 231, 0.4) 30%, 
                    rgba(255, 0, 200, 0.3) 45%, 
                    transparent 70%);
                z-index: 9997;
                pointer-events: none;
                animation: professionalFlash 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
                mix-blend-mode: screen;
              }
              
              @keyframes professionalFlash {
                0% { 
                  opacity: 0; 
                  transform: scale(0.7);
                  filter: blur(40px) brightness(3);
                }
                20% {
                  opacity: 0.9;
                  transform: scale(1);
                  filter: blur(20px) brightness(2);
                }
                50% { 
                  opacity: 1; 
                  transform: scale(1.05);
                  filter: blur(10px) brightness(1.8);
                }
                80% {
                  opacity: 0.5;
                  transform: scale(1.1);
                  filter: blur(5px) brightness(1.2);
                }
                100% { 
                  opacity: 0;
                  transform: scale(1.15);
                  filter: blur(0) brightness(1);
                }
              }
              
              /* Canvas confetti styling */
              .confetti-canvas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9998;
                pointer-events: none;
              }
              
              .leaderboard-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;
              }
              
              .leaderboard-banner {
                width: 100%;
                height: 180px;

                border-radius: 12px;
                border: 2px solid #FCA31E;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.35) 100%), 
                            radial-gradient(ellipse at top, rgba(255, 171, 46, 0.85) 0%, rgba(0, 0, 0, 0.00) 70%), 
                            radial-gradient(ellipse at bottom, rgba(245, 170, 56, 0.65) 0%, rgba(0, 0, 0, 0.00) 70%), 
                            linear-gradient(90deg, #F4AD59 0%, #FCA31E 50%, #F4AD59 100%);
                box-shadow: 0 8px 32px rgba(252, 163, 30, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);

                display: flex;
                gap: 12px;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                
                position: relative;
                overflow: hidden;
              }
              
              .coin {
                position: absolute;
                left: -30px;
                bottom: 5px;
              }

              .coin.two {
                position: absolute;
                left: 36px;
                top: -10px;
              }

              .coin.three {
                position: absolute;
                left: unset;
                right: 14px;
                top: 5px;
              }

              .coin.four {
                position: absolute;
                left: unset;
                right: -18px;
                bottom: 5px;
                transform: rotate(30deg);
              }
              
              .art {
                position: absolute;
                left: 0;
              }
              
              .art.right {
                left: unset;
                right: 0;
                transform: rotate(180deg) scaleY(-1);
              }
              
              .title {
                background: linear-gradient(135deg, #FFD700 0%, #FCA31E 50%, #F90 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                
                text-align: center;
                font-family: "Geogrotesque Wide", "Rubik", sans-serif;
                font-size: 56px;
                font-weight: 900;
                filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.5));
                letter-spacing: 0.05em;
                text-transform: uppercase;
              }
              
              h1 {
                margin: unset;
              }
              
              .desc {
                color: #FFF;
                text-align: center;
                font-family: "Geogrotesque Wide", "Rubik", sans-serif;
                font-size: 15px;
                font-weight: 600;
                max-width: 700px;
                line-height: 1.6;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
              }
              
              .periods {
                display: flex;
                align-items: center;
                gap: 10px;
                
                position: absolute;
                top: 50%;
                right: 30px;
                transform: translateY(-50%);
              }
              
              .period {
                height: 35px;
                padding: 0 20px;
                font-family: "Geogrotesque Wide", sans-serif;
                font-weight: 800;
                font-size: 13px;
                transition: all 0.2s ease;
              }
              
              .period:hover:not(:disabled):not(.active) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(252, 163, 30, 0.3);
              }
              
              .period:disabled {
                cursor: not-allowed;
                opacity: 0.5;
              }
              
              .period.active {
                box-shadow: 0 0 0 2px rgba(252, 163, 30, 0.3), inset 0 1px 3px rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                border: 2px solid #FCA31E;
                background: rgba(252, 163, 30, 0.35);
                color: #FFF;
                font-weight: 900;
              }
              
              .time {
                display: flex;
                align-items: center;
                gap: 10px;
                
                margin-top: 25px;
                justify-content: flex-end;

                color: #FFF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 16px;
                font-weight: 700;
                background: rgba(90, 84, 153, 0.3);
                padding: 8px 16px;
                border-radius: 6px;
                width: fit-content;
                margin-left: auto;
              }
              
              .podium-container {
                width: 100%;
                
                display: flex;
                align-items: flex-end;
                gap: 50px;
                padding: 0 60px;
              }
              
              .podium {
                flex: 1 1 0;
                height: 286px;
                border: 2px solid transparent;
                border-radius: 8px;
                position: relative;
                padding: 20px;
                
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;

                color: #FFF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 14px;
                font-weight: 700;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }
              
              .podium:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
              }
              
              .bar {
                width: 100%;
                min-height: 1px;
                margin: 6px 0;
                background: #5A5499;
              }
              
              .bar.divider {
                margin: 35px 0 0 0;
              }
              
              .item {
                margin: auto 0 auto 0;
              }
              
              .cost {
                border-radius: 3px;
                background: rgba(252, 163, 30, 0.24);
                min-height: 30px;
                padding: 0 12px;
              }
              
              .tag {
                padding: 0 8px;
                height: 25px;
                position: absolute;
                top: -6px;
                left: -1px;

                color: #FFF;
                font-size: 12px;
                font-weight: 700;
                line-height: 25px;
                
                border-radius: 2px;
              }
              
              .first {
                height: 320px;
                background: radial-gradient(134.74% 103.27% at 50.00% 103.27%, rgba(252, 163, 30, 0.45) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(143deg, rgba(255, 153, 0, 0.25) 30.03%, rgba(249, 172, 57, 0.25) 42.84%);
                border-color: rgb(249, 172, 57);
                order: 2;
                box-shadow: 0 0 30px rgba(252, 163, 30, 0.4), 0 8px 20px rgba(0, 0, 0, 0.4);
              }
              
              .first:hover {
                box-shadow: 0 0 40px rgba(252, 163, 30, 0.6), 0 12px 28px rgba(0, 0, 0, 0.5);
              }
              
              .first .tag {
                background: linear-gradient(37deg, #F90 30.03%, #F9AC39 42.84%);
              }
              
              .first .bar {
                background: linear-gradient(270deg, rgba(252, 162, 27, 0.00) 0%, rgba(252, 162, 27, 0.65) 49.00%, rgba(252, 162, 27, 0.00) 100%);
              }
              
              .second {
                background: radial-gradient(134.74% 103.27% at 50.00% 103.27%,  rgba(189, 189, 189, 0.45) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(37deg, rgba(209, 209, 209, 0.25) 30.03%, rgba(251, 251, 251, 0.25) 42.84%);
                border-color: rgb(193, 193, 193);
                order: 1;
                box-shadow: 0 0 20px rgba(189, 189, 189, 0.3), 0 6px 16px rgba(0, 0, 0, 0.3);
              }
              
              .second:hover {
                box-shadow: 0 0 30px rgba(189, 189, 189, 0.5), 0 10px 22px rgba(0, 0, 0, 0.4);
              }
              
              .second .tag {
                color: rgba(0, 0, 0, 0.53);
                background: linear-gradient(37deg, #D1D1D1 30.03%, #FBFBFB 42.84%);
              }
              
              .second .bar {
                background: linear-gradient(270deg, rgba(137, 137, 137, 0.00) 0%, rgba(192, 192, 192, 0.33) 49.00%, rgba(137, 137, 137, 0.00) 100%);
              }
              
              .third {
                background: radial-gradient(134.74% 103.27% at 50.00% 103.27%, rgba(115, 85, 68, 0.45) 0%, rgba(0, 0, 0, 0.00) 100%), 
                            linear-gradient(37deg, rgba(115, 85, 68, 0.25) 30.03%, rgba(160, 121, 98, 0.25) 42.84%);
                border-color: rgb(164, 124, 102);
                order: 3;
                box-shadow: 0 0 20px rgba(160, 121, 98, 0.3), 0 6px 16px rgba(0, 0, 0, 0.3);
              }
              
              .third:hover {
                box-shadow: 0 0 30px rgba(160, 121, 98, 0.5), 0 10px 22px rgba(0, 0, 0, 0.4);
              }
              
              .third .tag {
                color: rgba(0, 0, 0, 0.46);
                background: linear-gradient(37deg, #735544 30.03%, #A07962 42.84%);
              }
              
              .third .bar {
                background: linear-gradient(270deg, rgba(252, 162, 27, 0.00) 0%, rgba(252, 162, 27, 0.33) 49.00%, rgba(252, 162, 27, 0.00) 100%);
              }
              
              .table-header {
                display: flex;
                justify-content: space-between;
                margin: 30px 0 20px 0;
              }
              
              .table-data {
                height: 60px;
                background: rgba(90, 84, 153, 0.25);
                padding: 0 24px;
                border-radius: 6px;
                margin-bottom: 8px;
                
                display: flex;
                align-items: center;

                color: #ADA3EF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 14px;
                font-weight: 700;
                
                transition: background 0.2s ease, transform 0.2s ease;
              }
              
              .table-data:hover {
                background: rgba(90, 84, 153, 0.45);
                transform: translateX(4px);
              }
              
              .table-column {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1 1 0;
              }
              
              .table-column:nth-of-type(4n) {
                justify-content: flex-end;
              }
              
              .table-header p {
                background: rgba(90, 84, 153, 0.45);
                height: 28px;
                line-height: 28px;
                padding: 0 18px;
                border-radius: 4px;

                color: #FFF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 12px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              
              .confetti-container {
                pointer-events: none;
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: 10000;
                overflow: hidden;
              }
              .confetti {
                position: absolute;
                width: 12px; height: 18px;
                border-radius: 3px;
                opacity: 0.85;
                animation: confetti-fall 1.6s cubic-bezier(.6,.2,.4,1) forwards;
              }
              @keyframes confetti-fall {
                0% { top: -30px; transform: rotate(0deg) scale(1); }
                80% { opacity: 1; }
                100% { top: 100vh; transform: rotate(360deg) scale(0.7); opacity: 0.2; }
              }
              .flash-effect {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 60%, rgba(255,255,255,0) 100%);
                z-index: 10001;
                pointer-events: none;
                animation: flash-pop 0.6s cubic-bezier(.7,0,.3,1);
              }
              @keyframes flash-pop {
                0% { opacity: 0; }
                20% { opacity: 1; }
                100% { opacity: 0; }
              }
              .podium-animate-bronze {
                animation: podium-in-bronze 0.5s cubic-bezier(.7,0,.3,1);
              }
              .podium-animate-silver {
                animation: podium-in-silver 0.5s cubic-bezier(.7,0,.3,1);
              }
              .podium-animate-gold {
                animation: podium-in-gold 0.6s cubic-bezier(.7,0,.3,1);
              }
              @keyframes podium-in-bronze {
                0% { opacity: 0; transform: translateY(60px) scale(0.8) rotate(-8deg); }
                80% { opacity: 1; transform: translateY(-8px) scale(1.05) rotate(2deg); }
                100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
              }
              @keyframes podium-in-silver {
                0% { opacity: 0; transform: translateY(60px) scale(0.8) rotate(8deg); }
                80% { opacity: 1; transform: translateY(-8px) scale(1.05) rotate(-2deg); }
                100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
              }
              @keyframes podium-in-gold {
                0% { opacity: 0; transform: scale(0.7) rotate(0deg); filter: brightness(1.5) blur(2px); }
                60% { opacity: 1; transform: scale(1.1) rotate(-2deg); filter: brightness(1.2) blur(0.5px); }
                100% { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(1) blur(0); }
              }
              @media only screen and (max-width: 1000px) {
                .leaderboard-container {
                  padding: 20px 15px 90px 15px;
                }
                
                .leaderboard-banner {
                  height: auto;
                  min-height: 160px;
                  padding: 20px 15px;
                }
                
                .title {
                  font-size: 32px;
                }
                
                .desc {
                  font-size: 13px;
                  max-width: 90%;
                }
                
                .periods {
                  position: relative;
                  right: auto;
                  top: auto;
                  transform: none;
                  margin-top: 10px;
                }
                
                .coin {
                  display: none;
                }
                
                .art {
                  width: 200px;
                  height: auto;
                }
                
                .podium-container {
                  flex-direction: column;
                  padding: 0 15px;
                  gap: 20px;
                }
                
                .podium {
                  height: auto;
                  min-height: 250px;
                  width: 100%;
                }
                
                .first, .second, .third {
                  order: unset !important;
                  height: auto;
                  min-height: 260px;
                }
                
                .first {
                  min-height: 280px;
                }
                
                .table-data {
                  padding: 0 12px;
                  font-size: 12px;
                }
                
                .table-column {
                  font-size: 12px;
                }
                
                .table-header p {
                  font-size: 11px;
                  padding: 0 10px;
                }
                
                .time {
                  font-size: 14px;
                  padding: 6px 12px;
                  margin-top: 15px;
                }
              }
              
              @media only screen and (max-width: 600px) {
                .title {
                  font-size: 24px;
                }
                
                .desc {
                  font-size: 12px;
                }
                
                .period {
                  height: 30px;
                  padding: 0 12px;
                  font-size: 11px;
                }
              }
            `}</style>
        </>
    );
}

export default Leaderboard;
