function SystemMessage(props) {
    return (
        <>
            <div class='chatmessage-container'>
                <div class='user'>
                    <div class='avatar'>
                        <img src='/assets/icons/orangesword.png' alt='' height='25'/>
                    </div>

                    <p class='username'>BOT</p>
                    <p class='time'>{new Date(props?.createdAt)?.toLocaleTimeString()}</p>
                </div>

                <p class='message'>{props?.content}</p>
            </div>

            <style jsx>{`
              .chatmessage-container {
                width: 100%;
                height: fit-content;
              }
              
              .user {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
              }
              
              .avatar img {
                border-radius: 6px;
                position: relative;
                filter: drop-shadow(0 2px 6px rgba(249, 115, 57, 0.3));
              }
              
              .avatar {
                position: relative;
                padding: 1px;
                box-sizing: content-box;
              }
              
              .username {
                font-weight: 700;
                font-size: 13px;
                font-family: "Geogrotesque Wide", sans-serif;
                font-style: normal;
                color: #FF9A6C;
                margin-top: -2px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .message {
                font-weight: 500;
                font-size: 13.5px;
                line-height: 1.5;
                color: #FF9A6C;
                background: linear-gradient(135deg, rgba(249, 115, 57, 0.12) 0%, rgba(249, 115, 57, 0.08) 100%);
                border: 1px solid rgba(249, 115, 57, 0.25);
                border-radius: 10px;
                padding: 12px 16px;
                transition: all 0.2s ease;
              }
              
              .message:hover {
                background: linear-gradient(135deg, rgba(249, 115, 57, 0.18) 0%, rgba(249, 115, 57, 0.12) 100%);
                border-color: rgba(249, 115, 57, 0.4);
              }
              
              .time {
                font-family: 'Geogrotesque Wide';
                font-weight: 600;
                font-size: 10px;
                margin-left: auto;

                color: rgba(173, 163, 239, 0.4);
              }
            `}</style>
        </>
    );
}

export default SystemMessage;
