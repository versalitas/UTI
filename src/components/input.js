import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './Input.css';
import utiArrow from '../img/uti_arrow.svg';

class Input extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            textarea: null,
            height: 40,
        };
    }

    onSubmit(e) {
        e.preventDefault();
        this.forceUpdate();
        this.sendMessage();
    }

    sendMessage = () => {
        //TODO add regex sorting out emoji, gif, images etc
        // empty messages not allowed
        //console.log("text:",this.state.textarea.value);
        const elem = document.getElementById('textArea');
        console.log(elem.value);

        let textToSend = /*this.state.textarea.value*/ elem.value
            .replace(
                /[^0-9a-zA-ZáéóíúàèìòùÀÈÌÒÙÁÉÍÓÚÜüÇçÑñ·ㄱ-힣+×÷=%♤♡☆♧)(*&^/~#@!-:;,&?`_|<>{}¥£€$◇■□●○•°※¤《》¡¿₩\[\]\"\' \\]/g,
                ''
            )
            .trim();
        console.log('text:', textToSend, textToSend.length);
        if (textToSend !== '' && textToSend !== '\n') {
            this.props.socket.emit(this.props.type, textToSend);
        }
        elem.value = '';
    };
    //submits message with enter
    onChange = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        }
    };
    //TODO keep keyboard active while user is typing character
    //TODO get rid of mysterious whitespace added at initial submit, no luck with fresh module

    render() {
        return (
            <form className="input" onSubmit={(e) => this.onSubmit(e)}>
                {this.props.characterName != '' ? (
                    <label id="chatUser" htmlFor="chatUser">
                        {this.props.characterName}:
                    </label>
                ) : null}
                <div className="inputArea" id="inputArea">
                    <TextareaAutosize
                        placeholder="Type..."
                        id="textArea"
                        ref="textareaChat"
                        onKeyPress={(e) => {
                            this.onChange(e);
                        }}
                        inputRef={(tag) => (this.state.textarea = tag)}
                    />
                    <button id="chatSendButton" type="submit">
                        <img
                            className="imageButton"
                            src={utiArrow}
                            alt="arrow icon"
                        />
                    </button>
                </div>
            </form>
        );
    }
}

export default Input;
