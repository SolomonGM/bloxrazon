import {For} from "solid-js";
import {useRain} from "../../contexts/raincontext";

function LeaderboardBanner(props) {

  return (
    <>
      <div class='leaderboard-banner'>
        <div class='mascot-container'>
          <img src='/assets/art/mascot.png' alt='Mascot' class='mascot-image'/>
        </div>
        
        <div class='leaderboard-content'>
          <div class='leaderboard-left'>
            <div class='leaderboard-text'>
              <h2>LEADERBOARD</h2>
              <p>Compete for the top spot and earn exclusive rewards!</p>
            </div>
          </div>
          
          <div class='leaderboard-right'>
            <div class='prize-pool'>
              <span class='prize-label'>PRIZE POOL</span>
              <div class='prize-amount'>
                <img src='/assets/icons/coin.svg' height='20' alt=''/>
                <span class='amount'>50,000</span>
              </div>
            </div>
            <button class='view-leaderboard-btn bevel-gold' onClick={() => {
              window.location.href = '/leaderboard'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V7C19 10.86 15.86 14 12 14S5 10.86 5 7V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM17 6H7V7C7 9.76 9.24 12 12 12S17 9.76 17 7V6ZM10 16H14L15 20H9L10 16ZM8 22H16V21H8V22Z"/>
              </svg>
              VIEW RANKINGS
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .leaderboard-banner {
          width: 650px;
          min-height: 165px;
          flex-shrink: 0;

          border-radius: 12px;
          background: linear-gradient(135deg, #FCA31E 0%, #FFD700 50%, #FCA31E 100%);
          box-shadow: 
            0 8px 32px rgba(252, 163, 30, 0.4),
            0 4px 16px rgba(252, 163, 30, 0.3),
            0 0 20px rgba(252, 163, 30, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);

          display: flex;
          align-items: stretch;
          padding: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(252, 163, 30, 0.6);
        }

        .mascot-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 140px;
          height: 140px;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .mascot-image {
          width: 140px;
          height: 140px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          transform: translateY(10px);
        }

        .leaderboard-banner:before {
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
              rgba(252, 163, 30, 0.05) 0%, 
              rgba(255, 215, 0, 0.1) 50%, 
              rgba(252, 163, 30, 0.05) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(252, 163, 30, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
            linear-gradient(to bottom right, #2A2B35, #1A1B23);
        }

        .leaderboard-banner:after {
          position: absolute;
          content: '';
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: 
            radial-gradient(circle, rgba(252, 163, 30, 0.03) 0%, transparent 70%),
            linear-gradient(45deg, transparent 30%, rgba(252, 163, 30, 0.05) 50%, transparent 70%);
          animation: gold-pulse 6s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes gold-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .leaderboard-content {
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

        .leaderboard-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }



        .leaderboard-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .leaderboard-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #ADA3EF;
          margin: 0;
          max-width: 220px;
          line-height: 1.4;
        }

        .leaderboard-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .leaderboard-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .prize-pool {
          text-align: right;
        }

        .prize-label {
          display: block;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #9489DB;
          margin-bottom: 4px;
        }

        .prize-amount {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .amount {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FCA31E;
          text-shadow: 0 2px 8px rgba(252, 163, 30, 0.6);
          filter: drop-shadow(0 0 4px rgba(252, 163, 30, 0.4));
        }

        .view-leaderboard-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          
          border-radius: 6px;
          background: linear-gradient(180deg, #FCA31E 0%, #E8940F 100%);
          box-shadow: 0px 2px 0px 0px #C57B0A, 0px -2px 0px 0px #FFB347;
          border: none;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .view-leaderboard-btn:hover {
          background: linear-gradient(180deg, #FFB347 0%, #FCA31E 100%);
          transform: translateY(1px);
          box-shadow: 0px 1px 0px 0px #C57B0A, 0px -1px 0px 0px #FFB347;
        }

        .leaderboard-decoration {
          position: absolute;
          right: -20px;
          bottom: -10px;
          z-index: 1;
          opacity: 0.1;
        }

        .podium {
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }

        .podium-place {
          background: #FCA31E;
          border-radius: 2px 2px 0 0;
        }

        .podium-place.first {
          width: 20px;
          height: 40px;
        }

        .podium-place.second {
          width: 16px;
          height: 30px;
        }

        .podium-place.third {
          width: 14px;
          height: 20px;
        }

        @media only screen and (max-width: 600px) {
          .leaderboard-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .leaderboard-content {
            flex-direction: column;
            gap: 16px;
          }
          
          .leaderboard-right {
            align-items: center;
          }
          
          .leaderboard-text p {
            max-width: none;
          }
        }
      `}</style>
    </>
  );
}

export default LeaderboardBanner;
