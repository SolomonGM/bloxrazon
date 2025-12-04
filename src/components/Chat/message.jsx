import Level from "../Level/level";
import Avatar from "../Level/avatar";
import {STAFF_ROLES} from "../../resources/users";
import {useSearchParams} from "@solidjs/router";
import {createSignal, For} from "solid-js";

function Message(props) {

    const [params, setParams] = useSearchParams()

    const tryToParseWord = (word) => {
        if (word[0] === '@' && word.length > 3) {
            return <span style={{ color: '#8F7FFF' }}>{word}&nbsp;</span>
        }

        if (word[0] === ':' || word[word.length - 1] === ':') {

            let emojiName = word.replaceAll(':', '').trim()
            let emoji = props?.emojis.find(emoji => emoji.name === emojiName)
            if (!emoji) return <>{word + ' '}</>

            return <><img style={{ 'vertical-align': 'bottom' }} src={emoji.url} height='24px' alt=''/>&nbsp;</>
        }

        return word + ' '
    }

    function wasMentioned() {
        if (!props?.actualUser) return false
        return props?.content?.includes(`@${props?.actualUser?.username}`)
    }

    return (
        <>
            <div class={'chatmessage-container ' + props?.user?.role + (wasMentioned() ? ' mentioned' : '')}>
                {props?.replyTo && (
                    <div className='replied'>
                        <img src='/assets/art/replybar.png' class='replybar'/>
                        <div class='replied-message' title={props?.repliedMessage}>
                            <For each={props?.repliedMessage?.split(' ')}>{(word) => tryToParseWord(word)}</For>
                        </div>
                    </div>
                )}

                <div class='user'>
                    <div class='user-info' onClick={() => setParams({ user: props?.user?.id })}>
                        <Avatar id={props?.user?.id} xp={props?.user?.xp} height={30}/>

                        <p class='username'>
                            {props?.user?.role !== 'USER' && (
                                <span class='role'>{props?.user?.role}</span>
                            )}
                            &nbsp;
                            {props?.user?.username}
                        </p>

                        {props?.user?.role === 'USER' && (
                            <Level xp={props?.user?.xp}/>
                        )}
                    </div>

                    <p class='time'>{new Date(props?.createdAt)?.toLocaleTimeString()}</p>
                </div>

                <p class='message'>
                    <For each={props?.content?.split(' ')}>{(word) => tryToParseWord(word)}</For>

                    <span class='floaters'>
                        <img className='reply' src='/assets/icons/send.svg' height='16' width='16' onClick={() => {
                            if (props.replying === props.id) return props.setReplying(null)
                            props.setReplying(props.id)
                        }}/>

                        {STAFF_ROLES?.includes(props?.actualUser?.role) && (
                            <img class='trash' src='/assets/icons/trash.svg' height='16' width='16' onClick={() => {
                                if (!props?.ws?.connected) return
                                props?.ws?.emit('chat:sendMessage', `/delete ${props?.id}`)
                            }}/>
                        )}
                    </span>
                </p>
            </div>

            <style jsx>{`
              .chatmessage-container {
                width: 100%;
                height: fit-content;
                position: relative;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
              }

              .user {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 8px;
                width: 100%;
                flex-shrink: 0;
              }
              
              .user-info {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: opacity 0.2s ease;
                white-space: nowrap;
                text-overflow: ellipsis;
                flex-shrink: 1;
                min-width: 0;
              }
              
              .user-info:hover {
                opacity: 0.8;
              }

              .username {
                font-weight: 600;
                font-size: 13px;
                font-family: "Geogrotesque Wide", sans-serif;
                font-style: normal;
                color: #E8E3FF;
                margin-top: -2px;

                text-overflow: ellipsis;
                max-width: 140px;
                overflow: hidden;
              }
              
              .ADMIN .username, .OWNER .username {
                color: #FCA31E;
              }
              
              .MOD .username {
                color: #7FE89D;
              }
              
              .DEV .username {
                color: #FF9A6C;
              }

              .level {
                font-family: 'Geogrotesque Wide', sans-serif;
                font-weight: 700;
                font-size: 10px;
                color: white;

                background: linear-gradient(135deg, rgba(143, 141, 161, 0.4) 0%, rgba(143, 141, 161, 0.2) 100%);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid rgba(143, 141, 161, 0.3);

                margin-top: -2px;

                display: flex;
                align-items: center;
                gap: 5px;
              }

              .level p {
                margin-top: -1px;
              }

              .message {
                width: 100%;
                font-weight: 500;
                font-size: 13.5px;
                line-height: 1.5;
                color: #9B94CD;
                background: linear-gradient(135deg, rgba(40, 36, 74, 0.4) 0%, rgba(35, 31, 67, 0.6) 100%);
                border: 1px solid rgba(62, 55, 113, 0.3);
                border-radius: 10px;
                position: relative;

                word-break: break-word;
                white-space: pre-wrap;
                -moz-white-space: pre-wrap;

                padding: 12px 16px;
                transition: all 0.2s ease;
                box-sizing: border-box;
              }
              
              .chatmessage-container:hover .message {
                border-color: rgba(62, 55, 113, 0.5);
                background: linear-gradient(135deg, rgba(40, 36, 74, 0.5) 0%, rgba(35, 31, 67, 0.7) 100%);
              }
              
              .mentioned .message {
                background: linear-gradient(135deg, rgba(139, 93, 255, 0.15) 0%, rgba(139, 93, 255, 0.08) 100%) !important;
                border: 1px solid rgba(139, 93, 255, 0.3) !important;
                box-shadow: 0 0 16px rgba(139, 93, 255, 0.1);
              }
              
              .floaters {
                position: absolute;
                cursor: pointer;

                display: flex;
                gap: 8px;
                
                opacity: 0;
                top: 50%;
                transform: translateY(-50%);
                right: 12px;
                transition: opacity 0.2s ease;
                pointer-events: auto;
              }
              
              .message:hover .floaters {
                opacity: 1;
              }
              
              .trash, .reply {
                cursor: pointer;
                opacity: 0.6;
                transition: all 0.2s ease;
                padding: 6px;
                background: rgba(40, 36, 74, 0.8);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .trash:hover, .reply:hover {
                opacity: 1;
                background: rgba(139, 93, 255, 0.2);
                transform: scale(1.05);
              }
              
              .reply {
                transform: scaleX(-1);
              }
              
              .reply:hover {
                transform: scaleX(-1) scale(1.05);
              }

              .time {
                font-family: 'Geogrotesque Wide';
                font-weight: 600;
                font-size: 10px;
                margin-left: auto;

                color: rgba(173, 163, 239, 0.4);
                cursor: initial;
              }
              
              .replied {
                position: relative;
                
                width: 100%;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                
                margin-bottom: 8px;
              }
              
              .replied-message {
                width: 220px;
                height: 36px;
                
                display: flex;
                align-items: center;

                white-space: nowrap;
                overflow: hidden;
                
                border-radius: 8px;
                background: rgba(139, 93, 255, 0.1);
                border: 1px solid rgba(139, 93, 255, 0.2);

                color: #B18DFF;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 11px;
                font-weight: 500;
                
                padding: 0 12px;
              }
              
              .replybar {
                position: absolute;
                top: 10px;
                left: 0;
                opacity: 0.6;
              }
              
              .OWNER .message, .ADMIN .message {
                background: linear-gradient(135deg, rgba(255, 153, 0, 0.12) 0%, rgba(249, 172, 57, 0.08) 100%);
                border: 1px solid rgba(252, 163, 30, 0.25);
                color: #FFB347;
              }
              
              .OWNER .message:hover, .ADMIN .message:hover {
                background: linear-gradient(135deg, rgba(255, 153, 0, 0.18) 0%, rgba(249, 172, 57, 0.12) 100%);
                border-color: rgba(252, 163, 30, 0.4);
              }
              
              .MOD .message {
                background: linear-gradient(135deg, rgba(89, 232, 120, 0.08) 0%, rgba(89, 232, 120, 0.04) 100%);
                border: 1px solid rgba(89, 232, 120, 0.2);
                color: #7FE89D;
              }
              
              .MOD .message:hover {
                background: linear-gradient(135deg, rgba(89, 232, 120, 0.12) 0%, rgba(89, 232, 120, 0.06) 100%);
                border-color: rgba(89, 232, 120, 0.3);
              }
              
              .DEV .message {
                background: linear-gradient(135deg, rgba(249, 115, 57, 0.12) 0%, rgba(249, 115, 57, 0.08) 100%);
                border: 1px solid rgba(249, 115, 57, 0.25);
                color: #FF9A6C;
              }
              
              .DEV .message:hover {
                background: linear-gradient(135deg, rgba(249, 115, 57, 0.18) 0%, rgba(249, 115, 57, 0.12) 100%);
                border-color: rgba(249, 115, 57, 0.4);
              }
              
              .role {
                font-size: 13px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .ADMIN .role, .OWNER .role, .OWNER .sword, .ADMIN .sword {
                color: var(--gold);
                fill: var(--gold);
              }
              
              .DEV .role, .DEV .sword {
                color: #FF9A6C;
                fill: #FF9A6C;
              }
              
              .MOD .role, .MOD .role {
                color: #7FE89D;
                fill: #7FE89D;
              }
            `}</style>
        </>
    );
}

export default Message;
