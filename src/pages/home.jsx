import GamesList from "../components/Home/gameslist";
import {createSignal, For} from "solid-js";
import Bets from "../components/Home/bets";
import {useNavigate} from "@solidjs/router";
import {createNotification} from "../util/api";
import SlotsList from "../components/Home/slotslist";

const METHODS = {
    'limiteds': {
        src: '/assets/icons/limiteds.png',
        name: 'LIMITEDS',
        url: 'limiteds',
        width: '54'
    },
    'robux': {
        src: '/assets/icons/coin.svg',
        name: 'ROBUX',
        url: 'robux',
        width: '54'
    },
    'bitcoin': {
        src: '/assets/icons/bitcoin.png',
        name: 'BITCOIN',
        url: 'bitcoin',
        width: '45'
    },
    'ethereum': {
        src: '/assets/icons/ethereum.png',
        name: 'ETHEREUM',
        url: 'ethereum',
        width: '45'
    },
    'litecoin': {
        src: '/assets/icons/litecoin.png',
        name: 'LITECOIN',
        url: 'litecoin',
        width: '45'
    },
    'visa': {
        src: '/assets/icons/visa.png',
        name: 'VISA',
        url: 'credit card',
        width: '82'
    },
    'mastercard': {
        src: '/assets/icons/mastercard.png',
        name: 'MASTERCARD',
        url: 'credit card',
        width: '54'
    },
    'googlepay': {
        src: '/assets/icons/googlepay.png',
        name: 'GOOGLE PAY',
        url: 'credit card',
        width: '76'
    },
    'paypal': {
        src: '/assets/icons/paypal.png',
        name: 'PAYPAL',
        url: 'credit card',
        width: '33'
    }
}

function Home(props) {

    const [method, setMethod] = createSignal('')
    const [currentBanner, setCurrentBanner] = createSignal(0)
    const navigate = useNavigate()

    const banners = [
        '/assets/art/banner1.png',
        '/assets/art/banner1.png',
        '/assets/art/banner1.png'
    ]

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
    }

    const prevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
    }

    return (
        <>
            <div class='home-container fadein'>

                <div class='banner-carousel-container'>
                    <button class='banner-nav-btn left' onClick={prevBanner}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    
                    <div class='banner-carousel'>
                        <img src={banners[currentBanner()]} alt="Banner" class='banner-image'/>
                    </div>

                    <button class='banner-nav-btn right' onClick={nextBanner}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <GamesList/>
                <SlotsList/>

                <div class='deposit-methods-bar'/>

                <div class='deposit-methods'>
                    <div class='header'>
                        <p><span class='gold'>BLOXRAZON</span> OFFERS VARIOUS DEPOSIT METHODS</p>
                        <div class='bar'/>
                        <p class={'method-name ' + (METHODS[method()] ? 'active' : '')}>{METHODS[method()]?.name || 'NONE'}</p>
                    </div>

                    <div class='methods'>
                        <For each={Object.keys(METHODS)}>{(key, index) => (
                            <img onClick={() => method() === key ? setMethod('') : setMethod(key)}
                                 class={'method ' + (method() !== '' && method() !== key ? 'unactive' : '')}
                                 src={METHODS[key].src} width={METHODS[key].width || '54'} alt={METHODS[key].name}
                                 draggable={false}/>
                        )}</For>
                    </div>
                </div>

                <div class='deposit-container'>
                    <button class='deposit bevel-gold' disabled={!METHODS[method()]} onClick={() => {
                        if (!METHODS[method()]) return
                        if (!props?.user) return createNotification('error', 'Please login first.')
                        navigate(`/deposit?type=${METHODS[method()]?.url}`)
                    }}>
                        DEPOSIT
                    </button>
                </div>

                <Bets user={props.user}/>
            </div>

            <style jsx>{`
              .home-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;
              }

              .banner-carousel-container {
                width: 100%;
                max-width: 1100px;
                margin: 0 auto 30px auto;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                padding: 20px 0;
              }

              .banner-carousel {
                width: 100%;
                max-width: 900px;
                height: auto;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 12px;
                overflow: hidden;
                position: relative;
              }

              .banner-carousel > * {
                width: 100%;
                height: auto;
                border-radius: 12px;
              }

              .banner-image {
                width: 100%;
                height: auto;
                display: block;
                border-radius: 12px;
                object-fit: cover;
              }

              .banner-nav-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #F5B942 0%, #D4A033 100%);
                border: 2px solid #FFD700;
                box-shadow: 0 4px 15px rgba(245, 185, 66, 0.4), 
                            inset 0 2px 4px rgba(255, 255, 255, 0.3),
                            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1A1B23;
                transition: all 0.3s ease;
                flex-shrink: 0;
                position: relative;
                z-index: 2;
              }

              .banner-nav-btn:hover {
                background: linear-gradient(135deg, #FFD700 0%, #F5B942 100%);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6),
                            inset 0 2px 4px rgba(255, 255, 255, 0.4),
                            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
                transform: scale(1.05);
              }

              .banner-nav-btn:active {
                transform: scale(0.95);
                box-shadow: 0 2px 8px rgba(245, 185, 66, 0.4),
                            inset 0 2px 4px rgba(0, 0, 0, 0.3);
              }

              .banner-nav-btn svg {
                width: 24px;
                height: 24px;
                stroke-width: 3;
              }

              .banner-nav-btn.left {
                animation: pulse-left 2s ease-in-out infinite;
              }

              .banner-nav-btn.right {
                animation: pulse-right 2s ease-in-out infinite;
              }

              @keyframes pulse-left {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-5px); }
              }

              @keyframes pulse-right {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(5px); }
              }

              @media only screen and (max-width: 1200px) {
                .banner-carousel-container {
                  max-width: 95%;
                  gap: 15px;
                }

                .banner-carousel {
                  max-width: 85%;
                }

                .banner-nav-btn {
                  width: 45px;
                  height: 45px;
                }
              }

              @media only screen and (max-width: 768px) {
                .banner-carousel-container {
                  gap: 10px;
                  padding: 10px 0;
                }

                .banner-carousel {
                  max-width: 80%;
                }

                .banner-nav-btn {
                  width: 40px;
                  height: 40px;
                }

                .banner-nav-btn svg {
                  width: 20px;
                  height: 20px;
                }
              }

              .deposit-methods-bar {
                margin: 50px auto 0 auto;
                max-width: 650px;
                height: 1px;
                background: linear-gradient(270deg, rgba(90, 84, 153, 0.00) 0%, #5A5499 49.47%, rgba(90, 84, 153, 0.00) 100%);
              }

              .deposit-methods {
                max-width: 980px;
                border-radius: 5px;
                margin: 30px auto;
                overflow: hidden;

                border-bottom: 1px solid #5665BA;
              }

              .header {
                width: 100%;
                height: 30px;

                font-size: 14px;
                font-family: Geogrotesque Wide;
                font-weight: 700;
                color: white;

                display: flex;
                align-items: center;
                padding: 15px;
                gap: 15px;

                background: linear-gradient(90deg, rgba(90, 84, 149, 0.65) 0%, rgba(90, 84, 149, 0.45) 29.82%, rgba(66, 53, 121, 0) 100%);
              }

              .bar {
                flex: 1;
                height: 1px;

                background: #5A5499;
              }

              .method-name {
                color: #8D86CD;
              }

              .method-name.active {
                color: var(--gold);
              }

              .methods {
                display: flex;
                align-items: center;
                padding: 15px 0;
                justify-content: space-evenly;

                background: linear-gradient(0deg, rgba(29, 24, 62, 0.15), rgba(29, 24, 62, 0.15)), linear-gradient(269.89deg, rgb(104, 100, 164) -49.01%, rgba(90, 84, 149, 0.655) -5.08%, rgba(66, 53, 121, 0) 98.28%);
              }

              .method {
                cursor: pointer;
                transition: all .3s;
              }

              .method.unactive {
                -webkit-filter: grayscale(100%);
                -moz-filter: grayscale(100%);
                -o-filter: grayscale(100%);
                filter: grayscale(100%);

                opacity: 0.5;
              }

              .method:hover {
                transform: translateY(-5px);
              }

              .deposit-container {
                width: 100%;

                display: flex;
                align-items: center;
                justify-content: center;

                position: relative;
                margin-bottom: 50px;
              }

              .deposit-container:before {
                height: 1px;
                width: 100%;
                position: absolute;
                content: '';
                left: 0;
                background: linear-gradient(270deg, rgba(90, 84, 153, 0.00) 0%, #5A5499 49.47%, rgba(90, 84, 153, 0.00) 100%);
                z-index: -1;
              }

              .deposit {
                width: 130px;
                height: 30px;

                color: white;
                font-size: 14px;
                font-weight: 700;

                outline: unset;
                border: unset;

                cursor: pointer;
              }

              .deposit:disabled {
                border-radius: 3px;
                background: #6760A9;
                box-shadow: 0px 2px 0px 0px #524D8A, 0px -2px 0px 0px #7F77C6;

                color: #8D86CD;
              }

              @media only screen and (max-width: 1000px) {
                .home-container {
                  padding-bottom: 90px;
                }

                .scrolling-banners-container {
                  height: auto;
                }

                .scrolling-banners {
                  flex-direction: column;
                  width: 100%;
                  animation: none;
                }

                .banner-set {
                  width: 100%;
                  flex-direction: column;
                }
              }
            `}</style>
        </>
    );
}

export default Home;
