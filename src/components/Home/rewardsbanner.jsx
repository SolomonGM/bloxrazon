import Level from "../Level/level";
import {getUserNextLevel, progressToNextLevel} from "../../resources/levels";
import {useSearchParams} from "@solidjs/router";
import {createSignal, onMount, onCleanup} from "solid-js";
import {api} from "../../util/api";

function DiscordBanner(props) {

  const [params, setParams] = useSearchParams()
  const [discordStats, setDiscordStats] = createSignal({ members: 0, online: 0 })

  async function fetchDiscordStats() {
    try {
      const response = await api('/discord/stats', 'GET', null, true)
      if (response && !response.error) {
        setDiscordStats(response)
      }
    } catch (error) {
      console.error('Error fetching Discord stats:', error)
    }
  }

  onMount(() => {
    fetchDiscordStats()
    
    // Update stats every 5 minutes
    const interval = setInterval(fetchDiscordStats, 5 * 60 * 1000)
    
    onCleanup(() => {
      clearInterval(interval)
    })
  })

  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <>
      <div class='discord-banner'>
        <div class='wumpus-container'>
          <img src="/assets/art/wumpus.png" alt="Wumpus" class='wumpus-image'/>
        </div>
        
        <div class='discord-content'>
          <div class='discord-left'>
            <div class='discord-text'>
              <h2>JOIN OUR DISCORD</h2>
              <p>Connect with the community, get exclusive updates, and participate in giveaways!</p>
            </div>
          </div>
          
          <div class='discord-right'>
            <div class='member-stats'>
              <div class='stat-item'>
                <span class='stat-number'>{formatNumber(discordStats().members)}</span>
                <span class='stat-label'>MEMBERS</span>
              </div>
              <div class='stat-item'>
                <span class='stat-number'>{formatNumber(discordStats().online)}</span>
                <span class='stat-label'>ONLINE</span>
              </div>
            </div>
            
            <button class='join-discord-btn' onClick={() => {
              window.open('https://discord.gg/TQvTA2ANXm', '_blank')
            }}>
              <svg width="20" height="15" viewBox="0 0 71 55" fill="none">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
              </svg>
              JOIN NOW
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .discord-banner {
          width: 650px;
          min-height: 165px;
          flex-shrink: 0;

          border-radius: 12px;
          background: linear-gradient(135deg, #5865F2 0%, #7289DA 50%, #5865F2 100%);
          box-shadow: 
            0 8px 32px rgba(88, 101, 242, 0.3),
            0 4px 16px rgba(88, 101, 242, 0.2),
            0 0 20px rgba(88, 101, 242, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);

          display: flex;
          align-items: stretch;
          padding: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(88, 101, 242, 0.5);
        }

        .wumpus-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200px;
          height: 200px;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .wumpus-image {
          width: 200px;
          height: 200px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          transform: translateY(15px);
        }

        .discord-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          z-index: 2;
          position: relative;
          padding: 20px 30px 20px 170px;
          gap: 30px;
          height: 165px;
        }

        .discord-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .discord-banner:before {
          position: absolute;
          content: '';
          width: calc(100% - 2px);
          height: calc(100% - 2px);
          border-radius: 12px;
          top: 1px;
          left: 1px;
          z-index: 0;
          background: 
            linear-gradient(135deg, 
              rgba(88, 101, 242, 0.05) 0%, 
              rgba(114, 137, 218, 0.1) 50%, 
              rgba(88, 101, 242, 0.05) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(88, 101, 242, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(114, 137, 218, 0.15) 0%, transparent 50%),
            linear-gradient(to bottom right, #2A2B35, #1A1B23);
        }

        .discord-banner:after {
          position: absolute;
          content: '';
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: 
            radial-gradient(circle, rgba(88, 101, 242, 0.03) 0%, transparent 70%),
            linear-gradient(45deg, transparent 30%, rgba(88, 101, 242, 0.05) 50%, transparent 70%);
          animation: discord-glow 8s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes discord-glow {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.5; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
        }

        .discord-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          z-index: 1;
          position: relative;
        }

        .discord-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .discord-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
        }

        .discord-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #ADA3EF;
          margin: 0;
          max-width: 280px;
        }

        .discord-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .discord-stats {
          display: flex;
          gap: 20px;
        }

        .stat-item {
          text-align: center;
        }

        .discord-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .discord-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .discord-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #B8C1FF;
          margin: 0;
          max-width: 220px;
          line-height: 1.4;
        }

        .discord-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .member-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          display: block;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #B8C1FF;
          display: block;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .join-discord-btn {
          padding: 12px 18px;
          background: #5865F2;
          border: none;
          border-radius: 6px;
          color: white;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .join-discord-btn:hover {
          background: #4752C4;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(88, 101, 242, 0.4);
        }

        .join-discord-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(88, 101, 242, 0.3);
        }

        .join-discord-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          
          border: none;
          outline: none;
          border-radius: 3px;
          background: #5865F2;
          color: white;
          box-shadow: 0px -2px 0px #4752C4, 0px 2px 0px #404EED;
        }        .discord-banner:after {
          position: absolute;
          content: '';
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: 
            radial-gradient(circle, rgba(88, 101, 242, 0.03) 0%, transparent 70%),
            linear-gradient(45deg, transparent 30%, rgba(88, 101, 242, 0.05) 50%, transparent 70%);
          animation: discord-glow 8s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes discord-glow {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.5; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
        }

        .discord-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          z-index: 2;
          position: relative;
          padding: 20px 30px 20px 170px;
          gap: 30px;
          height: 165px;
        }

        .discord-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .discord-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
        }

        .discord-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #ADA3EF;
          margin: 0;
          max-width: 280px;
        }

        .discord-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .member-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          display: block;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #B8C1FF;
          display: block;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .discord-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .discord-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .discord-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #B8C1FF;
          margin: 0;
          max-width: 220px;
          line-height: 1.4;
        }

        .discord-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .member-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .join-discord-btn {
          padding: 12px 18px;
          background: #5865F2;
          border: none;
          border-radius: 6px;
          color: white;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .join-discord-btn:hover {
          background: #4752C4;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(88, 101, 242, 0.4);
        }

        .join-discord-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(88, 101, 242, 0.3);
        }

        .join-discord-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          
          border: none;
          outline: none;
          border-radius: 3px;
          background: #5865F2;
          color: white;
          box-shadow: 0px -2px 0px #4752C4, 0px 2px 0px #404EED;
        }

        .join-discord-btn:hover {
          background: #4752C4;
        }

        .join-discord-btn:active {
          background: #4752C4;
          box-shadow: unset;
        }

        @media only screen and (max-width: 600px) {
          .discord-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .discord-content {
            flex-direction: column;
            gap: 16px;
          }
          
          .discord-right {
            align-items: center;
          }
          
          .discord-text p {
            max-width: none;
          }
        }
      `}</style>
    </>
  );
}

export default DiscordBanner;
