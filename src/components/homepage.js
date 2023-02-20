import React from 'react';
import Input from './input.js';
import io from 'socket.io-client';
import settings from '../settings.js';
import './homepage.css';
import utiLogo from '../img/uti_logo.svg';

class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            loggedIn: false,
            characterAsigned: '',

            allCharacterAsigned: false,
            sceneTitle: '',
            rolesAsigned: 0,
            totalRoles: 0,
            blockNewMessages: false,
        };
    }

    componentDidMount() {
        var self = this;
        var url = window.location.host;
        var socket = io(settings.ip); //+':8001'
        socket.on('connect', function () {
            self.setState({
                socket: socket,
            });

            socket.emit('connectMessage', 'connected');
        });

        socket.on('assignActor', function (data) {
            self.setState({
                characterAsigned: data,
            });
        });

        socket.on('sceneInfo', function (data) {
            self.setState({
                sceneTitle: data.sceneTitle,
                allCharacterAsigned: data.allCharacterAsigned,
                blockNewMessages: data.blockNewMessages,
                rolesAsigned: data.rolesAsigned,
                totalRoles: data.totalRoles,
            });
        });
    }

    renderInputField() {
        if (
            !this.state.blockNewMessages &&
            (this.state.characterAsigned != '' ||
                (!this.state.blockNewMessages &&
                    this.state.rolesAsigned < this.state.totalRoles))
        ) {
            return (
                <div className="chatInput">
                    <Input
                        socket={this.state.socket}
                        type="publicMessage"
                        characterName={this.state.characterAsigned}
                    />
                </div>
            );
        } else {
            return (
                <div className="blockedInputMessage">
                    <p>Wait...</p>
                </div>
            );
        }
    }

    render() {
        const socket = this.state.socket;
        const type = 'publicMessage';
        const sceneTitle = this.state.sceneTitle;
        const characterAsigned = this.state.characterAsigned;
        const allCharacterAsigned = this.state.allCharacterAsigned;
        const rolesAsigned = this.state.rolesAsigned;
        const totalRoles = this.state.totalRoles;
        const blockNewMessages = this.state.blockNewMessages;

        return (
            <div className="chatContainer">
                <header className="chatHeader">
                    <img
                        className="chatLogo"
                        src={utiLogo}
                        alt="uti et abuti logo"
                    ></img>
                    <div className="chatScene">{sceneTitle}</div>
                    {allCharacterAsigned && characterAsigned == '' ? (
                        <div className="allRolesAssigned">
                            Tots els personatges d'aquesta escena ja són
                            presents
                        </div>
                    ) : null}
                </header>
                {this.renderInputField()}
            </div>
        );
    }
}

export default Homepage;
