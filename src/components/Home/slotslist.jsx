import {createResource, createSignal, For, Show} from "solid-js";
import {A} from "@solidjs/router";
import {api} from "../../util/api";
import Loader from "../Loader/loader";

function SlotsList() {

  let slotsRef
  const [slots, setSlots] = createSignal([])
  const [slotsInfo] = createResource(fetchSlots)

  async function fetchSlots() {
    try {
      let res = await api('/slots?limit=25', 'GET', null, false)
      if (!Array.isArray(res.data)) return

      setSlots(res.data)
      return res
    } catch (e) {
      console.error(e)
      return []
    }
  }

  function scrollGames(direction) {
    slotsRef.scrollBy({
      left: slotsRef.clientWidth * direction,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <div class='games'>
        <div class='games-header'>
          <svg class='slot-icon' width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM11 17H13V7H11V17ZM15 13H17V11H15V13ZM7 13H9V11H7V13Z" fill="url(#slot-gradient)"/>
            <defs>
              <linearGradient id="slot-gradient" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stop-color="#EF4444"/>
                <stop offset="1" stop-color="#DC2626"/>
              </linearGradient>
            </defs>
          </svg>

          <div class='header-text'>
            <h2>POPULAR <span>SLOTS</span></h2>
            <p><Show when={!slots.loading} fallback='Loading...'>{slotsInfo()?.total || 0} slots available</Show></p>
          </div>

          <div class='header-controls'>
            <A href='/slots' class='viewall-btn bevel-purple'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              VIEW ALL
            </A>

            <button class='bevel-purple arrow' onClick={() => scrollGames(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M12 6L2 6M2 6L7.6 0.999999M2 6L7.6 11" stroke="white" stroke-width="2"/>
              </svg>
            </button>

            <button class='bevel-purple arrow' onClick={() => scrollGames(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.58933e-07 6L10 6M10 6L4.4 11M10 6L4.4 0.999999" stroke="white" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class='slots' ref={slotsRef}>
          <Show when={!slots.loading} fallback={<Loader small={true}/>}>
            <For each={slots()}>{(slot, index) =>
              <div className='slot-card'>
                <div className='slot-thumbnail' style={{ 'background-image': `url(${import.meta.env.VITE_SERVER_URL}${slot.img})` }}>
                  <div class='slot-overlay'>
                    <svg class='play-btn' width="35" height="35" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.1)" />
                      <circle cx="20" cy="20" r="18" stroke="white" stroke-width="2" />
                      <path d="M16 12L28 20L16 28V12Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <A href={`/slots/${slot.slug}`} class='gamemode-link'/>
              </div>
            }</For>
          </Show>
        </div>
      </div>

      <style jsx>{`
        .games {
          width: 100%;
          margin-top: 40px;
        }

        .games-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          padding: 20px 25px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          position: relative;
          overflow: hidden;
        }

        .games-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .slot-icon {
          filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4));
          flex-shrink: 0;
        }

        .header-text {
          flex: 1;
        }

        .header-text h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          letter-spacing: 1px;
        }

        .header-text h2 span {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          margin: 5px 0 0 0;
          font-size: 13px;
          color: #ADA3EF;
          font-weight: 600;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .viewall-btn {
          height: 36px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all .3s ease;
          border: 1px solid rgba(139, 92, 246, 0.3);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
        }

        .viewall-btn:hover {
          transform: translateX(5px);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .arrow {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .3s ease;
        }

        .arrow:hover {
          transform: scale(1.1);
        }

        .slots {
          display: flex;
          gap: 16px;
          padding: 8px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        
        .slots::-webkit-scrollbar {
          height: 6px;
        }

        .slots::-webkit-scrollbar-track {
          background: rgba(29, 24, 62, 0.15);
          border-radius: 10px;
        }

        .slots::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }

        .slots::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        .slot-card {
          position: relative;
          min-width: 180px;
          width: 180px;
          height: 240px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #1A1825 0%, #252139 100%);
          border: 1px solid rgba(138, 116, 249, 0.15);
          transition: all .3s ease;
          cursor: pointer;
          flex-shrink: 0;
        }

        .slot-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
          z-index: 1;
        }

        .slot-card:hover::before {
          opacity: 1;
        }

        .slot-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.3), 0 5px 20px rgba(99, 102, 241, 0.2);
        }

        .slot-thumbnail {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
          transition: all .3s ease;
        }

        .slot-card:hover .slot-thumbnail {
          transform: scale(1.08);
        }

        .slot-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0.7) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all .3s ease;
        }

        .slot-card:hover .slot-overlay {
          opacity: 1;
        }

        .play-btn {
          transform: scale(0.7);
          transition: all .3s ease;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
        }

        .slot-card:hover .play-btn {
          transform: scale(1);
          filter: drop-shadow(0 6px 15px rgba(139, 92, 246, 0.6));
        }

        @media only screen and (max-width: 768px) {
          .games-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }

          .header-controls {
            width: 100%;
            justify-content: space-between;
          }

          .header-text h2 {
            font-size: 22px;
          }

          .slot-card {
            min-width: 150px;
            width: 150px;
            height: 200px;
          }
        }
      `}</style>
    </>
  );
}

export default SlotsList;
