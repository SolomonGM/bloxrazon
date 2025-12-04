function LoadingScreen(props) {
    return (
        <>
            <div class='loader-container'>
                <img src='/assets/logo/blox-clash-logo.gif' height='180'/>
                <img src='/assets/logo/bloxrazon.png' height='47'/>

                <div class='progress-container'>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                    <div class='progress-bar'/>
                </div>

                <div className='background'/>
            </div>

            <style jsx>{`
              .loader-container {
                height: 100vh;
                width: 100vw;
                
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 30px;
                position: relative;
                overflow: hidden;
              }
              
              .loader-container::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(ellipse at center, rgba(255, 153, 0, 0.15) 0%, transparent 50%),
                            radial-gradient(ellipse at top, rgba(139, 69, 19, 0.1) 0%, transparent 40%),
                            linear-gradient(180deg, rgba(20, 20, 30, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
                z-index: -2;
                animation: pulse 4s ease-in-out infinite;
              }
              
              .loader-container img:first-child {
                filter: drop-shadow(0 0 30px rgba(255, 153, 0, 0.6))
                        drop-shadow(0 0 60px rgba(255, 153, 0, 0.4))
                        brightness(1.1)
                        contrast(1.2);
                animation: glow 2s ease-in-out infinite;
              }
              
              .loader-container img:nth-child(2) {
                filter: drop-shadow(0 0 20px rgba(255, 153, 0, 0.5))
                        brightness(1.15)
                        contrast(1.3);
              }

              .progress-container {
                width: 300px;
                display: flex;
                gap: 7px;
              }
              
              .progress-bar {
                background: rgba(38, 35, 66, 0.8);
                flex: 1;
                height: 10px;
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255, 153, 0, 0.2);
                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
              }
              
              .progress-bar:before {
                width: 100%;
                height: 100%;
                position: absolute;
                left: -100%;
                top: 0;
                background: linear-gradient(37deg, #F90 30.03%, #F9AC39 42.84%), #262342;
                content: '';
                animation: fill 2.4s linear infinite;
                box-shadow: 0 0 15px rgba(255, 153, 0, 0.8);
              }
              
              .progress-bar:nth-child(2):before {
                animation-delay: .2s;
              }

              .progress-bar:nth-child(3):before {
                animation-delay: .4s;
              }

              .progress-bar:nth-child(4):before {
                animation-delay: .6s;
              }

              .progress-bar:nth-child(5):before {
                animation-delay: .8s;
              }

              .progress-bar:nth-child(6):before {
                animation-delay: 1s;
              }

              .progress-bar:nth-child(7):before {
                animation-delay: 1.2s;
              }

              .background {
                position: absolute;
                max-width: 1500px;
                width: 100%;
                top: 0;
                left: 50%;
                transform: translateX(-50%);

                height: 100%;
                width: 100%;

                background-image: url("/assets/art/background.png");
                mix-blend-mode: luminosity;
                z-index: -1;
                opacity: 0.4;
                filter: contrast(1.4) brightness(0.6);

                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
              }
              
              @keyframes glow {
                0%, 100% {
                  filter: drop-shadow(0 0 30px rgba(255, 153, 0, 0.6))
                          drop-shadow(0 0 60px rgba(255, 153, 0, 0.4))
                          brightness(1.1)
                          contrast(1.2);
                }
                50% {
                  filter: drop-shadow(0 0 40px rgba(255, 153, 0, 0.8))
                          drop-shadow(0 0 80px rgba(255, 153, 0, 0.5))
                          brightness(1.2)
                          contrast(1.3);
                }
              }
              
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.9;
                }
              }

              @keyframes fill {
                0% {
                  left: -100%;
                }
                7.21% {
                  left: 0%;
                }
                50% {
                  left: 0%;
                }
                57.21% {
                  left: 100%;
                }
                100% {
                  left: 100%;
                }
              }
            `}</style>
        </>
    );
}

export default LoadingScreen;
