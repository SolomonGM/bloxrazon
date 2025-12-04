import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {useWebsocket} from "../../contexts/socketprovider";
import {addDropdown, authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import Notification from "./notification";
import {useUser} from "../../contexts/usercontextprovider";

function Notifications(props) {

  const [user, { setNotifications }] = useUser()
  const [active, setActive] = createSignal(false)
  const [notifications, {mutate}] = createResource(() => active(), fetchNotifications)
  const [ws] = useWebsocket()

  addDropdown(setActive)

  createEffect(() => {
    if (ws() && ws().connected) {
      ws().on('notifications', (type, notis) => {
        if (type === 'set') return setNotifications(notis)

        let newNotis = user().notifications + notis
        setNotifications(newNotis)
      })
    }
  })

  async function fetchNotifications(dropdownActive) {
    if (!dropdownActive) return

    try {
      let notisRes = await authedAPI('/user/notifications', 'GET', null, false)
      return Array.isArray(notisRes) ? notisRes : []
    } catch (e) {
      return []
    }
  }

  function removeNotification(id) {
    let index = notifications().findIndex(noti => noti.id === id)

    if (index < 0) return
    mutate([
      ...notifications().slice(0, index),
      ...notifications().slice(index + 1)
    ])
  }

  return (
    <>
      <div className={'notifications ' + (active() ? 'active' : '')} onClick={(e) => {
        setActive(!active())
        e.stopPropagation()
      }}>
        <div className='bell'>
          <img src='/assets/icons/bell.svg' height='18' width='23' alt=''/>

          {user().notifications > 0 && (
            <div className='alert'>
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.0001 6.14308C12.0001 2.84753 9.38604 0.175903 6.16129 0.175903C2.93653 0.175903 0.322266 2.84753 0.322266 6.14308C0.322266 9.43863 2.93653 12.1103 6.16129 12.1103C9.38604 12.1103 12.0001 9.43863 12.0001 6.14308Z"
                  fill="#FC4747"/>
                <path
                  d="M7.72783 0.393555C9.21689 1.47489 10.1883 3.25202 10.1883 5.26108C10.1883 8.55662 7.57422 11.2283 4.34946 11.2283C3.80663 11.2283 3.2813 11.1524 2.78271 11.0106C3.73622 11.7032 4.90213 12.1103 6.16108 12.1103C9.38564 12.1103 11.9999 9.43864 11.9999 6.1431C11.9999 3.40221 10.1916 1.09337 7.72783 0.393555Z"
                  fill="#CC2B2B"/>
              </svg>

              <p>{user().notifications}</p>
            </div>
          )}

          <div class={'dropdown' + (active() ? ' active' : '')} onClick={(e) => e.stopPropagation()}>
            <div class='decoration-arrow'/>
            <div class='notis-wrapper'>
              <div class='notis'>
                <Show when={!notifications.loading} fallback={<Loader max={'20px'}/>}>
                  {notifications()?.length > 0 ? (
                    <For each={notifications()}>{(noti) =>
                      <Notification {...noti} delete={() => removeNotification(noti.id)}/>
                    }</For>
                  ) : (
                    <div class='none'>
                      <p>No new notifications...</p>
                    </div>
                  )}
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notifications {
          height: 43px;
          width: 43px;
          border-radius: 8px;
          border: 1px solid rgba(154, 144, 209, 0.2);
          background: rgba(154, 144, 209, 0.1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .notifications:hover {
          background: rgba(154, 144, 209, 0.15);
          border-color: rgba(154, 144, 209, 0.3);
        }

        .notifications.active {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        .notifications.active .bell img {
          filter: brightness(0) saturate(100%) invert(46%) sepia(98%) saturate(2261%) hue-rotate(337deg) brightness(100%) contrast(92%);
        }

        .bell {
          position: relative;
        }

        .bell img {
          width: 18px;
          height: 18px;
          filter: brightness(0) saturate(100%) invert(70%) sepia(15%) saturate(900%) hue-rotate(210deg) brightness(95%) contrast(85%);
        }

        .alert {
          width: 12px;
          height: 12px;
          position: absolute;
          top: -4px;
          right: 0;
          line-height: 12px;
          text-align: center;
          font-family: "Inter", "Geogrotesque Wide", sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: white;
        }

        .alert > p {
          position: relative;
          z-index: 1;
        }

        .alert > svg {
          position: absolute;
          top: 0;
          left: 0;
        }

        .dropdown {
          position: absolute;
          min-width: 300px;
          max-height: 0;
          height: 240px;
          top: 55px;
          right: 0;
          z-index: 1;
          border-radius: 8px;
          transition: max-height .3s;
          overflow: hidden;
          cursor: default;
        }

        .dropdown.active {
          max-height: 240px;
        }

        svg.active {
          transform: rotate(180deg);
        }

        .decoration-arrow {
          width: 13px;
          height: 9px;
          top: 1px;
          background: linear-gradient(135deg, rgba(26, 26, 30, 0.98) 0%, rgba(30, 27, 44, 0.98) 100%);
          position: absolute;
          right: 12px;
          border-left: 1px solid rgba(239, 68, 68, 0.2);
          border-right: 1px solid rgba(239, 68, 68, 0.2);
          border-top: 1px solid rgba(239, 68, 68, 0.2);
          clip-path: polygon(0% 100%, 100% 0%, 100% 100%);
          z-index: 1;
        }

        .mobile .decoration-arrow {
          display: none;
        }

        .notis-wrapper {
          padding: 10px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: linear-gradient(135deg, rgba(26, 26, 30, 0.98) 0%, rgba(30, 27, 44, 0.98) 100%);
          margin-top: 8px;
          height: 100%;
          position: relative;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.15);
        }
        
        .notis {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }
        
        .notis::-webkit-scrollbar {
          width: 6px;
        }

        .notis::-webkit-scrollbar-track {
          background: transparent;
        }

        .notis::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #EF4444 0%, #DC2626 100%);
          border-radius: 3px;
        }
        
        .notis::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #F87171 0%, #EF4444 100%);
        }
        
        .none {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(154, 144, 209, 0.75);
          font-weight: 600;
          overflow: hidden;
          font-family: "Inter", "Geogrotesque Wide", sans-serif;
        }

        @media only screen and (max-width: 1000px) {
          .notifications {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
    </>
  );
}

export default Notifications
