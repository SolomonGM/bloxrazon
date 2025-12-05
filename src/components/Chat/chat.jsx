import {createEffect, createSignal, For} from "solid-js";
import ChatMessage from "./message";
import RainEnd from "./rainend";
import SystemMessage from "./systemmessage";
import RainTip from "./raintip";
import HighWin from "./highwin";
import {useUser} from "../../contexts/usercontextprovider";
import {addDropdown, createNotification} from "../../util/api";

function Chat(props) {

    let sendRef
    let messagesRef
    let chatRef
    let hasLoaded = false

    const [user] = useUser()
    const [text, setText] = createSignal('')

    const [top, setTop] = createSignal(0)
    const [scroll, setScroll] = createSignal(true)

    const [replying, setReplying] = createSignal()

    const [emojisOpen, setEmojisOpen] = createSignal(false)
    addDropdown(setEmojisOpen)

    createEffect(() => {
        if (replying() || !replying()) // just to proc the effect
            sendRef.select()
    })

    createEffect(() => {
        if (!chatRef) return

        chatRef.onscroll = (e) => {
            let maxScroll = e.target.scrollHeight - e.target.clientHeight
            if (e.target.scrollTop >= maxScroll) {
                setScroll(true)
                return
            }

            if (!top()) return setTop(e.target.scrollTop)

            if (e.target.scrollTop < top() - 100) {
                setScroll(false)
                setTop(e.target.scrollTop)
                return
            }
        }
    })

    createEffect(() => {
        if (props.messages.length === 0 || !scroll()) return

        messagesRef.scrollIntoView({block: 'nearest', inline: 'end', behavior: hasLoaded ? 'smooth' : 'instant'})
        setTop(chatRef.scrollTop)
        hasLoaded = true
    })

    function resumeScrolling() {
        setScroll(true)
        messagesRef.scrollIntoView({block: 'nearest', inline: 'end', behavior: 'instant'})
        setTop(chatRef.scrollTop)
    }

    function sendMessage(message) {
        if (!user()) {
            return createNotification('error', 'Please log in first')
        }

        if (!props.ws) {
            return createNotification('error', 'Chat disconnected. Refresh the page.')
        }

        message = message.trim()
        if (message.length < 1) {
            return
        }

        if (replying() && !message.includes('@')) {
            message = `@${getReplyingTo().user.username} ${message}`
        }

        props.ws.emit('chat:sendMessage', message, replying())
        setTimeout(() => {
            setText('')
            setReplying(null)
        }, 1)
    }

    const handleKeyPress = (e, message) => {
        if (e.key === 'Backspace' && message.length === 0) {
            setReplying(null)
        }

        if (e.key === 'Enter' && props.ws) {
            sendMessage(message)
        }
    }

    function getReplyingTo() {
        return props?.messages?.find(msg => msg.id === replying())
    }

    function getRepliedMessage(id) {
        if (!id) return 'Unknown'
        let msg = props?.messages?.find(m => m.id === id)
        return msg?.content || 'Unknown'
    }

    return (
        <>
            <div class='chat-container'>
                <div class='messages' ref={chatRef}>
                    <div class='pusher'/>
                    <For each={props.messages}>{(message, index) =>
                        message?.type === 'rain-end' ? (
                            <RainEnd {...message}/>
                        ) : message?.type === 'high-win' ? (
                            <HighWin {...message}/>
                        ) : message?.type === 'system' ? (
                            <SystemMessage {...message}/>
                        ) : message?.type === 'rain-tip' ? (
                            <RainTip {...message}/>
                        ) : (
                            <ChatMessage {...message} actualUser={user()}
                                         ws={props?.ws} emojis={props?.emojis}
                                         replying={replying()} setReplying={setReplying}
                                         repliedMessage={getRepliedMessage(message.replyTo)}
                            />
                        )}
                    </For>
                    <div ref={messagesRef}/>
                </div>

                {!scroll() && (
                    <div class='paused' onClick={() => resumeScrolling()}>
                        <p>Chat paused due to scroll</p>
                    </div>
                )}

                <div class='send-message'>
                    <div class='message-wrapper'>
                        {replying() && (
                            <p class='replyto'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
                                    <path d="M5 2.50112V0.375123C5 0.224623 4.9095 0.0886233 4.771 0.0296233C4.633 -0.0288767 4.4715 0.000623226 4.364 0.106123L0.114 4.23112C0.041 4.30162 0 4.39862 0 4.50012C0 4.60162 0.041 4.69862 0.114 4.76912L4.364 8.89412C4.4725 8.99912 4.6335 9.02862 4.771 8.97062C4.9095 8.91162 5 8.77562 5 8.62512V6.50012H5.709C8.027 6.50012 10.164 7.76012 11.2855 9.78612L11.296 9.80512C11.363 9.92712 11.49 10.0001 11.625 10.0001C11.656 10.0001 11.687 9.99662 11.718 9.98862C11.884 9.94612 12 9.79662 12 9.62512C12 5.73812 8.8715 2.56812 5 2.50112Z" fill="#8B5DFF"/>
                                </svg>
                                @{getReplyingTo().user.username}
                            </p>
                        )}

                        <input type='text' class='send-message-input' placeholder={user() ? 'Send a message...' : 'Login to chat...'}
                               value={text()}
                               ref={sendRef}
                               disabled={!user()}
                               onChange={(e) => setText(e.target.value)}
                               onKeyDown={(e) => handleKeyPress(e, e.target.value)}/>
                    </div>

                    <div class='emojis-button' onClick={(e) => {
                        if (!user()) {
                            return createNotification('error', 'Please log in first')
                        }
                        setEmojisOpen(!emojisOpen())
                        e.stopPropagation()
                    }}>
                        <img src='/assets/icons/emojis.png' height='20' alt=''/>

                        {emojisOpen() && (
                            <div className='emojis-wrapper' onClick={(e) => e.stopPropagation()}>
                                <div className='emojis'>
                                    <For each={props?.emojis}>{(emoji) =>
                                        <img src={emoji.url} className='emoji' alt={`:${emoji.name}:`} height='24'
                                             width='24'
                                             onClick={() => setText(text() + ` :${emoji.name}:`)}/>
                                    }</For>
                                </div>
                            </div>
                        )}
                    </div>

                    <div class='send bevel' onClick={() => sendMessage(text())}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="#8B5DFF"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M6.35156 2.84522C2.83113 3.02855 0 5.95057 0 9.51562V12L0.888867 9.9307C1.94013 7.82855 4.02591 6.48443 6.35156 6.36084V9.20423L11.9918 4.59375L6.35156 0V2.84522Z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .chat-container {
                width: 100%;
                height: 100%;

                padding: 0;

                display: flex;
                flex-direction: column;
                box-sizing: border-box;

                overflow: hidden;
                position: relative;
                background: linear-gradient(180deg, rgba(26, 23, 47, 0.95) 0%, rgba(20, 18, 35, 0.98) 100%);
                border-left: 1px solid rgba(139, 92, 246, 0.15);
              }

              .messages {
                width: 100%;
                height: 100%;

                padding: 24px 18px;

                display: flex;
                flex-direction: column;
                position: relative;

                gap: 14px;
                overflow-y: scroll;

                mask-image: linear-gradient(to top, black 85%, rgba(0, 0, 0, 0.15) 98%);
                scrollbar-width: thin;
                scrollbar-color: rgba(139, 92, 246, 0.4) transparent;
              }

              .messages::-webkit-scrollbar {
                width: 6px;
              }

              .messages::-webkit-scrollbar-track {
                background: transparent;
              }

              .messages::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.4);
                border-radius: 10px;
              }

              .messages::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.6);
              }

              .pusher {
                flex: 1 1 auto;
              }

              .paused {
                min-height: 44px;
                width: calc(100% - 32px);
                margin: 0 16px;

                border: 1px solid rgba(252, 163, 30, 0.3);
                background: linear-gradient(90deg, rgba(252, 163, 30, 0.08) 0%, rgba(252, 163, 30, 0.15) 50%, rgba(252, 163, 30, 0.08) 100%);
                backdrop-filter: blur(10px);
                border-radius: 8px;

                cursor: pointer;
                line-height: 44px;
                text-align: center;

                color: #FCA31E;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                transition: all 0.3s ease;
              }
              
              .paused:hover {
                background: linear-gradient(90deg, rgba(252, 163, 30, 0.12) 0%, rgba(252, 163, 30, 0.2) 50%, rgba(252, 163, 30, 0.12) 100%);
                border-color: rgba(252, 163, 30, 0.5);
              }

              .send-message {
                background: linear-gradient(180deg, rgba(46, 41, 88, 0.8) 0%, rgba(35, 31, 67, 0.95) 100%);
                backdrop-filter: blur(20px);

                border: 1px solid rgba(139, 92, 246, 0.25);
                border-top: 1px solid rgba(139, 92, 246, 0.35);
                border-radius: 0;
                box-shadow: 0 -4px 20px rgba(139, 92, 246, 0.1), 0 -2px 10px rgba(0, 0, 0, 0.3);

                min-height: 60px;
                width: 100%;
                padding: 0 16px;

                display: flex;
                align-items: center;
                gap: 12px;
              }
              
              .message-wrapper {
                display: flex;
                height: 100%;
                flex: 1;
                gap: 10px;
                align-items: center;
                padding: 10px 14px;
                background: rgba(40, 36, 74, 0.7);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 10px;
                transition: all 0.3s ease;
              }
              
              .message-wrapper:focus-within {
                border-color: rgba(139, 92, 246, 0.7);
                background: rgba(40, 36, 74, 0.9);
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
              }

              .send-message-input {
                width: 100%;
                height: 100%;

                background: unset;
                border: unset;
                outline: unset;

                font-family: 'Rubik', sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: #C7C0EF;
                line-height: 1.5;
              }

              .send-message-input::placeholder {
                font-family: 'Rubik', sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: rgba(173, 163, 239, 0.4);
                user-select: none;
              }

              .send-message-input:disabled {
                cursor: not-allowed;
                opacity: 0.6;
              }

              .send {
                min-height: 44px;
                min-width: 44px;
                
                background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
                border-radius: 10px;
                border: 1px solid rgba(139, 92, 246, 0.4);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
                transition: all 0.2s ease;
              }
              
              .send:hover {
                background: linear-gradient(135deg, #B794FF 0%, #9B6FE6 100%);
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
                transform: scale(1.05) translateY(-1px);
                border-color: rgba(139, 92, 246, 0.6);
              }
              
              .send:active {
                transform: translateY(0);
              }

              .send svg {
                transition: all .2s;
                fill: white;
              }

              .send:hover svg {
                fill: white;
                transform: scale(1.1);
              }
              
              .replyto {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                background: rgba(139, 93, 255, 0.15);
                border-radius: 4px;
                border: 1px solid rgba(139, 93, 255, 0.2);
                
                color: #B18DFF;
                font-family: Rubik;
                font-size: 12px;
                font-style: normal;
                font-weight: 500;
                line-height: normal;
              }
              
              .replyto svg {
                flex-shrink: 0;
              }

              .emojis-button {
                min-width: 36px;
                height: 36px;

                border-radius: 8px;
                border: 1px solid rgba(138, 129, 205, 0.2);
                background: rgba(54, 50, 102, 0.4);

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
                transition: all 0.2s ease;
              }
              
              .emojis-button:hover {
                background: rgba(54, 50, 102, 0.6);
                border-color: rgba(138, 129, 205, 0.4);
              }

              .emojis-wrapper {
                width: calc(100% - 32px);
                max-width: 320px;
                height: 240px;

                position: absolute;
                bottom: 72px;

                border-radius: 12px;
                border: 1px solid rgba(138, 129, 205, 0.2);
                background: linear-gradient(180deg, rgba(46, 41, 88, 0.98) 0%, rgba(35, 31, 67, 0.98) 100%);
                backdrop-filter: blur(20px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

                padding: 16px;
                overflow-y: scroll;

                display: flex;

                left: 0;
                right: 0;
                margin: 0 auto;
                cursor: initial;
              }

              .emojis-wrapper::-webkit-scrollbar {
                width: 6px;
              }

              .emojis-wrapper::-webkit-scrollbar-track {
                background: rgba(34, 31, 61, 0.4);
                border-radius: 10px;
              }

              .emojis-wrapper::-webkit-scrollbar-thumb {
                background: rgba(99, 92, 156, 0.6);
                border-radius: 10px;
              }
              
              .emojis-wrapper::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 92, 156, 0.8);
              }

              .emojis {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                width: 100%;
              }

              .emoji {
                cursor: pointer;
                transition: transform 0.2s ease;
                border-radius: 6px;
                padding: 4px;
              }
              
              .emoji:hover {
                transform: scale(1.15);
                background: rgba(139, 93, 255, 0.15);
              }
            `}</style>
        </>
    );
}

export default Chat;
