import {getCents} from "../../util/balance";
import Avatar from "../Level/avatar";

function HighWin(props) {

    return (
        <>
            <div class='highwin-container'>
                <div class='sparkles'/>
                
                <div class='user-section'>
                    <Avatar xp={props?.user?.xp || 0} id={props?.user?.id} height='32'/>
                    <div class='user-info'>
                        <p class='username'>{props?.user?.username}</p>
                        <p class='subtitle'>just hit a high win!</p>
                    </div>
                </div>

                <div class='win-details'>
                    <div class='detail-item'>
                        <p class='label'>GAME</p>
                        <p class='value game'>{props?.content?.game}</p>
                    </div>
                    <div class='detail-item'>
                        <p class='label'>BET</p>
                        <div class='value amount'>
                            <img src='/assets/icons/coin.svg' alt='' height='14'/>
                            <p>{Math.floor(props?.content?.amount || 0)}<span class='cents'>.{getCents(props?.content?.amount || 0)}</span></p>
                        </div>
                    </div>
                    <div class='detail-item highlight'>
                        <p class='label'>MULTIPLIER</p>
                        <p class='value multiplier'>{props?.content?.multiplier}x</p>
                    </div>
                </div>

                <div class='payout-backing'>
                    <div class='payout-container'>
                        <img class='coin' src='/assets/icons/fancycoin.png' alt='' height='36'/>
                        <p>{Math.floor(props?.content?.payout || 0)}<span class='cents'>.{getCents(props?.content?.payout || 0)}</span></p>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .highwin-container {
                width: 100%;
                min-height: 110px;

                background: conic-gradient(from 180deg at 50% 50%, #8B5CF6 -0.3deg, #6D28D9 72.1deg, rgba(109, 40, 217, 0.61) 139.9deg, rgba(91, 33, 182, 0.49) 180.52deg, rgba(76, 29, 149, 0.61) 215.31deg, #6D28D9 288.37deg, #8B5CF6 359.62deg),
                linear-gradient(0deg, #2A2453, #2A2453);
                border-radius: 8px;
                
                position: relative;
                z-index: 0;
                
                padding: 12px 16px 40px 16px;
                overflow: visible;
              }
              
              .highwin-container > * {
                position: relative;
                z-index: 2;
              }
              
              .highwin-container:before {
                width: calc(100% - 2px);
                height: calc(100% - 2px);
                
                top: 1px;
                left: 1px;
                position: absolute;
                z-index: 1;
                content: '';

                background: linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), 
                            radial-gradient(196.93% 1543.75% at 129.21% -19.16%, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 100%), 
                            linear-gradient(277.39deg, rgba(19, 17, 41, 0.8) -69.8%, rgba(37, 31, 78, 0.8) 144.89%);
                border-radius: 8px;
              }

              .highwin-container:after {
                width: calc(100% - 2px);
                height: calc(100% - 2px);

                top: 1px;
                left: 1px;
                position: absolute;
                z-index: 0;
                content: '';

                background-color: #2A2453;
                border-radius: 8px;
              }
              
              .sparkles {
                width: calc(100% - 2px);
                height: calc(100% - 2px);

                top: 1px;
                left: 1px;
                position: absolute !important;
                z-index: 0;

                opacity: 0.08;
                background-image: url("/assets/art/rainswords.png");
                background-position: center;
                background-size: cover;
                border-radius: 8px;
              }
              
              .user-section {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
              }
              
              .user-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              
              .username {
                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 13px;
                color: white;
                margin: 0;
              }
              
              .subtitle {
                font-family: 'Geogrotesque Wide';
                font-weight: 600;
                font-size: 11px;
                color: #A78BFA;
                margin: 0;
              }
              
              .win-details {
                display: flex;
                gap: 8px;
                margin-top: 8px;
              }
              
              .detail-item {
                flex: 1;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                padding: 6px 8px;
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              
              .detail-item.highlight {
                background: rgba(139, 92, 246, 0.15);
                border: 1px solid rgba(139, 92, 246, 0.3);
              }
              
              .label {
                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 9px;
                color: #8B8B8B;
                margin: 0;
              }
              
              .value {
                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 12px;
                color: white;
                margin: 0;
              }
              
              .value.game {
                text-transform: uppercase;
                font-size: 11px;
              }
              
              .value.multiplier {
                color: #A78BFA;
                font-size: 14px;
              }
              
              .value.amount {
                display: flex;
                align-items: center;
                gap: 4px;
              }
              
              .payout-backing {
                width: 100%;
                height: 32px;
                
                position: absolute !important;
                left: -1px;
                bottom: 0;

                background: linear-gradient(270deg, rgba(90, 84, 153, 0) 0%, rgba(139, 92, 246, 0.31) 98.73%, rgba(90, 84, 153, 0) 100%);
                border-radius: 0 0 8px 8px;
                
                display: flex;
                align-items: center;
                justify-content: center;
                
                padding: 0 5px;

                overflow: visible;
              }
              
              .payout-container {
                width: 100%;
                height: 22px;

                background: conic-gradient(from 180deg at 50% 50%, #8B5CF6 -0.3deg, #6D28D9 72.1deg, rgba(109, 40, 217, 0.61) 139.9deg, rgba(91, 33, 182, 0.49) 180.52deg, rgba(76, 29, 149, 0.61) 215.31deg, #6D28D9 288.37deg, #8B5CF6 359.62deg);
                border-radius: 5px;
                
                position: relative;
                
                display: flex;
                align-items: center;
                justify-content: center;

                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                color: white;
                font-size: 12px;
                
                overflow: visible;
              }
              
              .payout-container:before {
                width: calc(100% - 2px);
                height: calc(100% - 2px);

                top: 1px;
                left: 1px;
                position: absolute;
                z-index: 1;
                content: '';

                background: linear-gradient(90deg, #3D2B5F 0%, #2E1F4A 100%);
                border-radius: 5px;
              }
              
              .payout-container > * {
                position: relative;
                z-index: 1;
              }
              
              .coin {
                position: absolute !important;
                left: -12px;
                z-index: 1;
              }
              
              .cents {
                color: #A7A7A7;
              }
            `}</style>
        </>
    );
}

export default HighWin;
