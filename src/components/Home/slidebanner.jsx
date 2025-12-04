import {useNavigate} from "@solidjs/router";

function SlideBanner(props) {

  const navigate = useNavigate()

  return (
    <>
      <div class='slide-banner'>
        <div class='domino-container'>
          <img src="/assets/art/Domino.png" alt="Domino" class='domino-image'/>
        </div>
        
        <div class='slide-content'>
          <div class='slide-left'>
            <div class='slide-text'>
              <h2>WELCOME TO BLOXRAZON</h2>
              <p>Your secure and trustworthy gambling destination with the industry's best house edge rates!</p>
            </div>
          </div>
          
          <div class='slide-right'>
            <div class='security-stats'>
              <div class='stat-item'>
                <span class='stat-number'>99.2%</span>
                <span class='stat-label'>RTP RATE</span>
              </div>
              <div class='stat-item'>
                <span class='stat-number'>0.8%</span>
                <span class='stat-label'>HOUSE EDGE</span>
              </div>
            </div>
            
            <button class='play-slide-btn bevel-gold' onClick={() => {
              navigate('/slide')
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5V19L19 12L8 5Z"/>
              </svg>
              PLAY NOW
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slide-banner {
          width: 650px;
          min-height: 165px;
          flex-shrink: 0;

          border-radius: 12px;
          background: linear-gradient(135deg, #E53E3E 0%, #FF6B6B 50%, #E53E3E 100%);
          box-shadow: 
            0 8px 32px rgba(229, 62, 62, 0.3),
            0 4px 16px rgba(229, 62, 62, 0.2),
            0 0 20px rgba(229, 62, 62, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);

          display: flex;
          align-items: stretch;
          padding: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(229, 62, 62, 0.5);
        }

        .domino-container {
          position: absolute;
          bottom: 5px;
          left: 15px;
          width: 140px;
          height: 140px;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .domino-image {
          width: 140px;
          height: 140px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          transform: translateY(0px);
        }

        .slide-banner:before {
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
              rgba(229, 62, 62, 0.05) 0%, 
              rgba(255, 107, 107, 0.1) 50%, 
              rgba(229, 62, 62, 0.05) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(229, 62, 62, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.15) 0%, transparent 50%),
            linear-gradient(to bottom right, #2A2B35, #1A1B23);
        }

        .slide-banner:after {
          position: absolute;
          content: '';
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: 
            radial-gradient(circle, rgba(229, 62, 62, 0.03) 0%, transparent 70%),
            linear-gradient(45deg, transparent 30%, rgba(229, 62, 62, 0.05) 50%, transparent 70%);
          animation: slide-energy 7s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes slide-energy {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.5; }
          33% { transform: rotate(120deg) scale(1.05); opacity: 0.7; }
          66% { transform: rotate(240deg) scale(0.95); opacity: 0.6; }
        }

        .slide-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          z-index: 2;
          position: relative;
          padding: 20px 30px 20px 200px;
          gap: 30px;
          height: 165px;
        }

        .slide-left {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 100%;
        }

        .slide-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: 
            linear-gradient(135deg, rgba(229, 62, 62, 0.3) 0%, rgba(255, 107, 107, 0.2) 100%),
            radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(229, 62, 62, 0.6);
          flex-shrink: 0;
          box-shadow: 
            0 4px 16px rgba(229, 62, 62, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .slide-icon:before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          border-radius: 14px;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%);
          animation: slide-glow 5s ease-in-out infinite;
        }

        @keyframes slide-glow {
          0%, 100% { transform: translateX(-100%) translateY(-100%); }
          50% { transform: translateX(100%) translateY(100%); }
        }

        .slide-text h2 {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slide-text p {
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #FFB3B3;
          margin: 0;
          max-width: 220px;
          line-height: 1.4;
        }

        .slide-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .security-stats {
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
          color: #FFB3B3;
          display: block;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .slide-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          justify-content: center;
        }

        .security-stats {
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
          color: #FFB3B3;
          display: block;
          margin-top: 2px;
          letter-spacing: 0.5px;
        }

        .play-slide-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          
          border: none;
          outline: none;
          border-radius: 6px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          color: #E53E3E;
          box-shadow: 
            0 4px 12px rgba(229, 62, 62, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(229, 62, 62, 0.2);
        }

        .play-slide-btn:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          transform: translateY(-1px);
          box-shadow: 
            0 6px 16px rgba(229, 62, 62, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border-color: rgba(229, 62, 62, 0.3);
        }

        .play-slide-btn:active {
          transform: translateY(0px);
          box-shadow: 
            0 2px 8px rgba(229, 62, 62, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .play-slide-btn svg {
          fill: #E53E3E;
        }

        @media only screen and (max-width: 600px) {
          .slide-content {
            flex-direction: column;
            gap: 16px;
            padding: 20px 30px 20px 200px;
          }
          
          .slide-left {
            align-items: center;
          }
          
          .slide-right {
            align-items: center;
          }
          
          .slide-text p {
            max-width: none;
            text-align: center;
          }
          
          .domino-container {
            width: 100px;
            height: 100px;
          }
          
          .domino-image {
            width: 100px;
            height: 100px;
            transform: translateY(5px);
          }
        }
      `}</style>
    </>
  );
}

export default SlideBanner;