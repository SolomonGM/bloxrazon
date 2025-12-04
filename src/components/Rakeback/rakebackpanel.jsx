import {createResource, createSignal, onCleanup, Show} from "solid-js";
import {authedAPI} from "../../util/api";
import RakebackTier from "./tier";
import Loader from "../Loader/loader";
import {useUser} from "../../contexts/usercontextprovider";

function RakebackPanel(props) {

  const [user, { mutateUser }] = useUser()
  const [rewards, {mutate}] = createResource(fetchRakeback)
  const [time, setTime] = createSignal(Date.now())

  async function fetchRakeback() {
    try {
      let data = await authedAPI('/user/rakeback', 'GET', null, false)
      if (!data.serverTime) return

      data.instant.claimAt = new Date(data.instant.canClaimAt).getTime()
      data.daily.claimAt = new Date(data.daily.canClaimAt).getTime()
      data.weekly.claimAt = new Date(data.weekly.canClaimAt).getTime()
      data.monthly.claimAt = new Date(data.monthly.canClaimAt).getTime()

      return data
    } catch (e) {
      return null
    }
  }

  function claimTier(tier) {
    tier = tier.toLowerCase()
    let newRewards = {...rewards()}
    newRewards[tier].unclaimedRakeback = 0
    newRewards[tier].canClaim = false
    newRewards[tier].claimAt = Date.now() + newRewards[tier].cooldown
    mutateUser({
      ...user(),
      rewards: Math.max(0, user().rewards - 1)
    })

    mutate(newRewards)
  }

  let timer = setInterval(() => setTime(Date.now()), 1000)
  onCleanup(() => clearInterval(timer))

  return (
    <>
      <div class={'rakeback-panel-container ' + (props.active ? 'active' : '')}>
        <div class='rakeback-header'>
          <h2>
            Your rewards
            <button class='close-button' onClick={() => props.setRakeback(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="#9489DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </h2>
        </div>

        <div class='rakeback-content'>
          <Show when={!rewards.loading} fallback={<Loader/>}>
            <div className='rewards-grid'>
              <RakebackTier 
                reward={rewards()?.instant?.unclaimedRakeback} 
                active={rewards()?.instant?.canClaim}
                tier='Instant' 
                label='Instant Rakeback'
                onClaim={claimTier} 
                claimAt={rewards()?.instant?.claimAt}
                time={time()} 
                min={rewards()?.instant.min}
              />

              <RakebackTier 
                reward={rewards()?.daily?.unclaimedRakeback} 
                active={rewards()?.daily?.canClaim}
                tier='Daily' 
                label='Daily Rakeback'
                onClaim={claimTier} 
                claimAt={rewards()?.daily?.claimAt}
                time={time()} 
                min={rewards()?.daily.min}
              />

              <RakebackTier 
                reward={rewards()?.weekly?.unclaimedRakeback} 
                active={rewards()?.weekly?.canClaim}
                tier='Weekly' 
                label='Weekly Bonus'
                onClaim={claimTier} 
                claimAt={rewards()?.weekly?.claimAt}
                time={time()} 
                min={rewards()?.weekly.min}
              />

              <RakebackTier 
                reward={rewards()?.monthly?.unclaimedRakeback} 
                active={rewards()?.monthly?.canClaim}
                tier='Monthly' 
                label='Monthly Bonus'
                onClaim={claimTier} 
                claimAt={rewards()?.monthly?.claimAt}
                time={time()} 
                min={rewards()?.monthly.min}
              />
            </div>
          </Show>
        </div>
      </div>

      <style jsx>{`
        .rakeback-panel-container {
          position: fixed;
          right: 0;
          top: 0;
          
          min-width: 300px;
          width: 300px;
          height: 100vh;
          
          background: var(--gradient-bg);
          border-left: 1px solid #2A2B35;
          
          transform: translateX(100%);
          transition: transform 0.3s ease;
          
          z-index: 100;
          
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .rakeback-panel-container.active {
          transform: translateX(0);
        }
        
        .rakeback-header {
          width: 100%;
          padding: 20px;
          
          background: rgba(22, 23, 33, 0.5);
          border-bottom: 1px solid rgba(42, 43, 53, 0.5);
        }
        
        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        
        .close-button:hover {
          opacity: 0.7;
        }
        
        .rakeback-header h2 {
          margin: 0;
          color: #FFF;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 16px;
          font-weight: 700;
          
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .rakeback-content {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }
        
        .rakeback-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .rakeback-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .rakeback-content::-webkit-scrollbar-thumb {
          background: #2A2B35;
          border-radius: 4px;
        }
        
        .rakeback-content::-webkit-scrollbar-thumb:hover {
          background: #35363F;
        }
        
        .rewards-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        @media only screen and (max-width: 1250px) {
          .rakeback-panel-container {
            position: fixed;
            top: 0;
            right: -300px;
            height: calc(100% - 60px);
            z-index: 4;
          }
          
          .rakeback-panel-container.active {
            top: 0;
            right: 0;
          }
        }
      `}</style>
    </>
  )
}

export default RakebackPanel
