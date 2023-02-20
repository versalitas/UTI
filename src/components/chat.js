import React from 'react';
import './chat.css';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    clear() {
        this.state.messages = [];
        this.forceUpdate();
    }

    onNewMessage(messagePacket) {
        this.state.messages.push(messagePacket);
        this.forceUpdate();
        // Move scroll to bottom
        document
            .getElementById('chat')
            .firstElementChild.lastChild.scrollIntoView();
    }

    render() {
        let chat = this.state.messages.map((c) => (
            <li>
                {c.type != 'director' ? (
                    <div
                        className="message"
                        style={{ backgroundColor: `${c.color}` }}
                    >
                        <p id="sender">{c.from}:</p> {c.message}
                    </div>
                ) : (
                    <div className="messageDirector">{c.message}</div>
                )}
            </li>
        ));

        return (
            <div id="chat" ref={(ref) => (this._div = ref)}>
                <ul ref="list" id="chatList">
                    {chat}
                </ul>
            </div>
        );
    }
}

export default Chat;
