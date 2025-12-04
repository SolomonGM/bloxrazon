import {authedAPI, createNotification} from "../../util/api";

function RakebackTier(props) {

  function formatTimeLeft() {
    let timeLeft = props?.claimAt - props?.time
    const totalSeconds = Math.floor(timeLeft / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) return `${days}d ${hours.toString().padStart(2, '0')}h`
    if (hours > 0) return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`
    return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }

  async function claimRakeback() {
    if (!props?.active || props?.reward < props?.min) return

    let res = await authedAPI('/user/rakeback/claim', 'POST', JSON.stringify({
      type: props?.tier?.toLowerCase()
    }), true)

    if (res.success) {
      createNotification('success', `Successfully claimed your ${props?.tier} rakeback for a total of ${props?.reward}.`)
      props?.onClaim(props?.tier)
    }
  }

  // Only allow claiming if active, reward meets minimum, and reward is greater than 0
  const canClaim = props?.active && props?.reward >= props?.min && props?.reward > 0

  return (
    <>
      <div className={'rakeback-card ' + (canClaim ? 'claimable' : '')}>
        <div className='card-header'>
          <span className='claim-now-badge'>Claim now</span>
          <button className='gift-icon'>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.25 3.5H10.0625C10.1953 3.28125 10.2812 3.03125 10.2812 2.75C10.2812 1.92188 9.60938 1.25 8.78125 1.25C8.20312 1.25 7.67188 1.54688 7.35938 2.01562L7 2.5625L6.64062 2.01562C6.32812 1.54688 5.79688 1.25 5.21875 1.25C4.39062 1.25 3.71875 1.92188 3.71875 2.75C3.71875 3.03125 3.80469 3.28125 3.9375 3.5H1.75C1.33594 3.5 1 3.83594 1 4.25V5.125C1 5.53906 1.33594 5.875 1.75 5.875H2.1875V11.375C2.1875 12.2031 2.85938 12.875 3.6875 12.875H10.3125C11.1406 12.875 11.8125 12.2031 11.8125 11.375V5.875H12.25C12.6641 5.875 13 5.53906 13 5.125V4.25C13 3.83594 12.6641 3.5 12.25 3.5Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className='icon-container'>
          <div className='icon-wrapper'>
            <div className='sparkles'>
              <span className='sparkle sparkle-1'>✦</span>
              <span className='sparkle sparkle-2'>✦</span>
              <span className='sparkle sparkle-3'>✦</span>
            </div>
            {props?.tier === 'Instant' && (
              <div className='icon-3d instant'>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 5L9 24H22L20 39L35 19H22L24 5Z" fill="url(#lightning-gradient)" stroke="#FCA31E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="lightning-gradient" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FCA31E"/>
                      <stop offset="1" stop-color="#F59E0B"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
            {props?.tier === 'Daily' && (
              <div className='icon-3d daily'>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Gift Box */}
                  <rect x="10" y="19" width="24" height="20" rx="1.5" fill="url(#daily-box)" stroke="#9F7AEA" stroke-width="1.5"/>
                  {/* Ribbon Vertical */}
                  <rect x="20.5" y="19" width="3" height="20" fill="#B794F6"/>
                  {/* Ribbon Horizontal */}
                  <rect x="10" y="26.5" width="24" height="3" fill="#B794F6"/>
                  {/* Bow */}
                  <path d="M22 12L19 19H25L22 12Z" fill="#B794F6"/>
                  <ellipse cx="18" cy="18" rx="3.5" ry="2.5" fill="#9F7AEA"/>
                  <ellipse cx="26" cy="18" rx="3.5" ry="2.5" fill="#9F7AEA"/>
                  {/* Crystal/Diamond inside */}
                  <path d="M22 28L19 31L22 34L25 31L22 28Z" fill="url(#crystal-gradient)" stroke="#E9D5FF" stroke-width="1"/>
                  <defs>
                    <linearGradient id="daily-box" x1="22" y1="19" x2="22" y2="39" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#B794F6"/>
                      <stop offset="1" stop-color="#9F7AEA"/>
                    </linearGradient>
                    <linearGradient id="crystal-gradient" x1="22" y1="28" x2="22" y2="34" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#E9D5FF"/>
                      <stop offset="0.5" stop-color="#FFF"/>
                      <stop offset="1" stop-color="#DDD6FE"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
            {props?.tier === 'Weekly' && (
              <div className='icon-3d weekly'>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Gift Box */}
                  <rect x="8" y="18" width="28" height="21" rx="2" fill="url(#weekly-box)" stroke="#48BB78" stroke-width="1.5"/>
                  {/* Ribbon Vertical */}
                  <rect x="20.5" y="18" width="3" height="21" fill="#68D391"/>
                  {/* Ribbon Horizontal */}
                  <rect x="8" y="26" width="28" height="3" fill="#68D391"/>
                  {/* Big Bow */}
                  <ellipse cx="14" cy="15" rx="4.5" ry="3" fill="#48BB78"/>
                  <ellipse cx="22" cy="15" rx="4.5" ry="3" fill="#48BB78"/>
                  <ellipse cx="30" cy="15" rx="4.5" ry="3" fill="#48BB78"/>
                  <path d="M22 8L19 15H25L22 8Z" fill="#68D391"/>
                  {/* Multiple Diamonds */}
                  <g opacity="0.9">
                    <path d="M22 25L20 27L22 29L24 27L22 25Z" fill="url(#diamond1)" stroke="#C6F6D5" stroke-width="0.8"/>
                    <path d="M16 29L14.5 30.5L16 32L17.5 30.5L16 29Z" fill="url(#diamond2)" stroke="#C6F6D5" stroke-width="0.8"/>
                    <path d="M28 29L26.5 30.5L28 32L29.5 30.5L28 29Z" fill="url(#diamond2)" stroke="#C6F6D5" stroke-width="0.8"/>
                  </g>
                  <defs>
                    <linearGradient id="weekly-box" x1="22" y1="18" x2="22" y2="39" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#68D391"/>
                      <stop offset="1" stop-color="#48BB78"/>
                    </linearGradient>
                    <linearGradient id="diamond1" x1="22" y1="25" x2="22" y2="29" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FFF"/>
                      <stop offset="0.5" stop-color="#C6F6D5"/>
                      <stop offset="1" stop-color="#9AE6B4"/>
                    </linearGradient>
                    <linearGradient id="diamond2" x1="16" y1="29" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#F0FFF4"/>
                      <stop offset="1" stop-color="#C6F6D5"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
            {props?.tier === 'Monthly' && (
              <div className='icon-3d monthly'>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Large Gift Box */}
                  <rect x="6" y="18" width="32" height="22" rx="2" fill="url(#monthly-box)" stroke="#4299E1" stroke-width="2"/>
                  {/* Ribbon Vertical */}
                  <rect x="20" y="18" width="4" height="22" fill="#63B3ED"/>
                  {/* Ribbon Horizontal */}
                  <rect x="6" y="26.5" width="32" height="4" fill="#63B3ED"/>
                  {/* Elaborate Bow */}
                  <ellipse cx="10" cy="15" rx="5" ry="3" fill="#4299E1"/>
                  <ellipse cx="18" cy="15" rx="5" ry="3" fill="#4299E1"/>
                  <ellipse cx="26" cy="15" rx="5" ry="3" fill="#4299E1"/>
                  <ellipse cx="34" cy="15" rx="5" ry="3" fill="#4299E1"/>
                  <path d="M22 6L18 14H26L22 6Z" fill="#63B3ED"/>
                  <circle cx="22" cy="13" r="2" fill="#90CDF4"/>
                  {/* Large Crystal Cluster */}
                  <g opacity="0.95">
                    {/* Center large diamond */}
                    <path d="M22 24L19 28L22 32L25 28L22 24Z" fill="url(#crystal-main)" stroke="#DBEAFE" stroke-width="1.2"/>
                    <path d="M22 26L20.5 28L22 30L23.5 28L22 26Z" fill="#FFF" opacity="0.6"/>
                    {/* Side crystals */}
                    <path d="M28 28L26.5 29.5L28 31L29.5 29.5L28 28Z" fill="url(#crystal-side)" stroke="#DBEAFE" stroke-width="0.8"/>
                    <path d="M16 28L14.5 29.5L16 31L17.5 29.5L16 28Z" fill="url(#crystal-side)" stroke="#DBEAFE" stroke-width="0.8"/>
                    <path d="M22 34L20.5 35.5L22 37L23.5 35.5L22 34Z" fill="url(#crystal-small)" stroke="#DBEAFE" stroke-width="0.8"/>
                  </g>
                  <defs>
                    <linearGradient id="monthly-box" x1="22" y1="18" x2="22" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#63B3ED"/>
                      <stop offset="1" stop-color="#4299E1"/>
                    </linearGradient>
                    <linearGradient id="crystal-main" x1="22" y1="24" x2="22" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FFF"/>
                      <stop offset="0.3" stop-color="#DBEAFE"/>
                      <stop offset="0.7" stop-color="#BFDBFE"/>
                      <stop offset="1" stop-color="#93C5FD"/>
                    </linearGradient>
                    <linearGradient id="crystal-side" x1="28" y1="28" x2="28" y2="31" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#F0F9FF"/>
                      <stop offset="1" stop-color="#DBEAFE"/>
                    </linearGradient>
                    <linearGradient id="crystal-small" x1="22" y1="34" x2="22" y2="37" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FFF"/>
                      <stop offset="1" stop-color="#E0F2FE"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className='card-content'>
          <p className='label'>{props?.label}</p>

          <div className='reward-amount'>
            <img src='/assets/icons/coin.svg' height='16' width='15' alt=''/>
            <span>{props?.reward?.toFixed(2) || '0.00'}</span>
          </div>

          <button 
            class={'claim-btn ' + (canClaim ? 'active' : 'disabled')} 
            onClick={async () => claimRakeback()}
            disabled={!canClaim}
          >
            {canClaim ? 'Claim' : formatTimeLeft()}
          </button>
        </div>
      </div>

      <style jsx>{`
        .rakeback-card {
          background: linear-gradient(253deg, rgba(22, 23, 33, 0.95) -27.53%, rgba(26, 27, 35, 0.95) 175.86%);
          border: 1px solid #2A2B35;
          border-radius: 8px;
          overflow: hidden;
          
          display: flex;
          flex-direction: column;
          
          transition: all 0.3s;
          position: relative;
        }
        
        .rakeback-card.claimable {
          border-color: rgba(239, 68, 68, 0.5);
          background: linear-gradient(253deg, rgba(239, 68, 68, 0.15) -27.53%, rgba(26, 27, 35, 0.95) 175.86%);
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.2);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .claim-now-badge {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #7F78BC;
        }
        
        .rakeback-card.claimable .claim-now-badge {
          color: #EF4444;
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        .gift-icon {
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          color: #7F78BC;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .rakeback-card.claimable .gift-icon {
          color: #EF4444;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
        } color: #59E878;
        }
        
        .icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%);
        }
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        }
        
        .icon-3d {
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }
        
        .icon-3d svg {
          display: block !important;
          margin: 0 !important;
          text-align: center;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        /* Instant Rakeback - Lightning */
        .icon-3d.instant svg {
          filter: drop-shadow(0 0 12px rgba(252, 163, 30, 0.6)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .sparkles {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          color: #FCA31E;
          font-size: 12px;
          animation: sparkle 2s ease-in-out infinite;
          text-shadow: 0 0 8px rgba(252, 163, 30, 0.8);
        }
        
        .sparkle-1 {
          top: 10%;
          right: 15%;
          animation-delay: 0s;
        }
        
        .sparkle-2 {
          bottom: 15%;
          left: 10%;
          animation-delay: 0.7s;
        }
        
        .sparkle-3 {
          top: 50%;
          right: 5%;
          animation-delay: 1.4s;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        /* Daily Rakeback - Gift Box with Crystal */
        .icon-3d.daily svg {
          filter: drop-shadow(0 0 15px rgba(159, 122, 234, 0.7)) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4));
        }
        
        .gift-sparkles {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          pointer-events: none;
        }
        
        .gift-sparkles .sparkle {
          color: #B794F6;
        }
        
        .gift-sparkles .sparkle-4 {
          top: 60%;
          left: 10%;
          animation-delay: 2.1s;
        }
        
        /* Weekly Rakeback - Gift Box with Multiple Diamonds */
        .icon-3d.weekly svg {
          filter: drop-shadow(0 0 15px rgba(72, 187, 120, 0.7)) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4));
        }
        
        .icon-3d.weekly .gift-sparkles .sparkle {
          color: #68D391;
        }
        
        /* Monthly Rakeback - Premium Gift with Crystal Cluster */
        .icon-3d.monthly svg {
          filter: drop-shadow(0 0 18px rgba(66, 153, 225, 0.8)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
        }
        
        .monthly-sparkles {
          animation: rotate-sparkles 4s linear infinite;
        }
        
        @keyframes rotate-sparkles {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .monthly-sparkles .sparkle {
          color: #63B3ED;
        }
        
        .monthly-sparkles .sparkle-5 {
          top: 70%;
          left: 50%;
          animation-delay: 2.8s;
        }
        
        .crystal-shine {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
          animation: crystal-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes crystal-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        .glow-ring {
          position: absolute;
          width: 70%;
          height: 70%;
          border-radius: 50%;
          border: 2px solid rgba(159, 122, 234, 0.3);
          animation: pulse-ring 2s ease-in-out infinite;
        }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }
        
        .calendar-shine {
          position: absolute;
          width: 40%;
          height: 80%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skew(-20deg);
          animation: shine 3s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes shine {
          0% { left: -50%; }
          50%, 100% { left: 150%; }
        }
        
        .page-flip {
          position: absolute;
          top: 0;
          right: 10%;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
          clip-path: polygon(100% 0, 0 0, 100% 100%);
          animation: flip 4s ease-in-out infinite;
        }
        
        @keyframes flip {
          0%, 100% { transform: rotateX(0deg); opacity: 0.3; }
          50% { transform: rotateX(180deg); opacity: 0.8; }
        }
        
        .card-content {
          padding: 0 12px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .label {
          color: #ADA3EF;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 13px;
          font-weight: 700;
          margin: 0;
          text-align: center;
          line-height: 1.2;
        }
        
        .rakeback-card.claimable .label {
          color: #FFF;
        }
        .reward-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          
          padding: 10px;
          background: rgba(42, 43, 53, 0.5);
          border: 1px solid rgba(74, 75, 85, 0.2);
          border-radius: 5px;
          
          transition: all 0.3s;
        }
        
        .rakeback-card.claimable .reward-amount {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        } border-color: rgba(89, 232, 120, 0.3);
        }
        
        .reward-amount img {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
        
        .reward-amount span {
          color: #FFF;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 15px;
          font-weight: 700;
        }
        
        .claim-btn {
          width: 100%;
          height: 36px;
          
          border: none;
          border-radius: 5px;
          
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .claim-btn.active {
          background: linear-gradient(180deg, #5FEF83 0%, #4AC768 100%);
          color: #1A1B23;
          box-shadow: 0px 3px 12px rgba(89, 232, 120, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        .claim-btn.active:hover {
          background: linear-gradient(180deg, #4AC768 0%, #3BA857 100%);
          box-shadow: 0px 5px 16px rgba(89, 232, 120, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .claim-btn.active:active {
          transform: translateY(0);
          box-shadow: 0px 2px 8px rgba(89, 232, 120, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .claim-btn.disabled {
          background: rgba(42, 43, 53, 0.6);
          border: 1px solid rgba(74, 75, 85, 0.3);
          color: #7F78BC;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

export default RakebackTier