import React from 'react'
//import Fade from 'react-reveal/Fade';
import Chat from './chat'
import Input from './input'
import Users from './users'
import io from 'socket.io-client';
import './chatDirector.css'
import settings from '../settings.js'
import { loadSongLastScene, playSongLastScene,loadAndPlaySoundMessage } from '../modules/audio'

//TODO feed input with default messages from json for director to submit

var socket = null;

class chatDirector extends React.Component {

    showModal() {
        //this.refs.modal.show()
    }

    hideModal() {
        //this.refs.modal.hide()
    }

    constructor(props) {
        super(props)

        this.state = {
            socket:             null,
            chatLog:            [],
            pending:            false,
            loggedIn:           false,
            desiredNameValid:   false,
            lastNameDetail:     '',
            desiredName:        '',
            userList:           [],
            sceneTitle:         '',
            sceneDescription:   '',
            sceneNumber:        0,
            totalScene:         0,
            messageCounter:     0,
            acotacionsSceneCue:    0,
            rolesAsigned:       0,
            totalRoles:         0,
            totalRolesExtra:    0,
            lastSceneTitle :    '',
            acotacions_count:   1,
            acotacions:[],
            acotacion:''
        }

        //document.getElementById("chat").style.height= "500px";
        //document.getElementById("chat").style.height= "500px";
        //loadAndPlaySound();
    }

    changeToNextScene = () => {
      console.log('called changeScene');
      socket.emit('changeScene',this.state.sceneNumber);
      this.resetAcotacions();
    }

    addOneExtra = () => {
      console.log('add extra role to Scene');
      socket.emit('addExtraToScene',this.state.sceneNumber);
    }

    resetAcotacions = ()=>{
      console.log("resetAcotacions")
      const elem = document.getElementById('textArea');
      elem.value = "";
      this.setState({acotacions:[],acotacionsSceneCue:0, acotacions_count:   0});
    }

    componentDidMount() {
      var self = this;
      var url = window.location.host;
      socket = io(settings.ip)//+':8001'//settings.ip

      socket.on('connect', function () {
        socket.emit('connectMessage','connected');
        self.state.socket = socket;
      });

      // messages to the chat
      socket.on('newMessage', function (data) {
        console.log('newMessage',data)
        self.refs.chat.onNewMessage(data)
        
        //loadAndPlaySoundMessage(socket,data.sound);
        if(data.type=='director'){
          if(self.state.acotacions.length-1>self.state.acotacions_count){
            self.setState({
              acotacions_count:self.state.acotacions_count+1,
              acotacion: self.state.acotacions[self.state.acotacions_count],
              acotacionsSceneCue:self.state.acotacions.length-(self.state.acotacions_count+2)
            })
            console.log("anotation",self.state.acotacions[self.state.acotacions_count])
            //self.setToTextArea()
            console.log("set value to text area");
            const elem = document.getElementById('textArea');
            elem.value = self.state.acotacions[self.state.acotacions_count];
          }
        }
        self.forceUpdate()
      });
      
     //TODO check when user refreshes/enters (homepage.js) all the messages are deleted from chatDirector's screen
      socket.on('newUserList', function (data) {
        console.log('new list users');
        self.setState({
          userList : data
        });
      });

      socket.on('sceneInfo', function (data) {
        console.log('sceneInfo', data)
        // clear message
        if(self.state.sceneTitle !==data.sceneTitle){
          self.refs.chat.clear();
          self.setState({
            acotacions_count:0
          });
          try{
            if(data.acotacions.length>0){
                self.setState({
                  acotacion: data.acotacions[0],
                  acotacionsSceneCue:data.acotacions.length-(self.state.acotacions_count+1)
                })
                //self.setToTextArea();
                console.log("set value to text area");
                const elem = document.getElementById('textArea');
                elem.value = self.state.acotacion;
                console.log('sceneInfo-acotacio',self.state.acotacion)
            }

            if(data.acotacions.length===0){
              self.resetAcotacions();
            }
          }catch(err){
            console.log("Error adding first Acotacions!");
            if(data.acotacions.length===0){
              self.resetAcotacions();
            }
          }
        } 

        self.setState({
          sceneTitle: data.sceneTitle,
          sceneDescription:data.sceneDescription,
          sceneNumber:data.sceneNumber,
          totalScene:data.totalScene,
          messageSceneCounter: data.messageSceneCounter,
          totalRoles: data.totalRoles,
          rolesAsigned: data.rolesAsigned,
          totalRolesExtra: data.totalRolesExtra,
          acotacions: data.acotacions
        });
      });

      socket.on('messageSceneCounter', function (data) {
        self.setState(
          { messageSceneCounter:data.messageSceneCounter}
        );
      });
    }

    render() {
        const type = "directorMessage";
        const socket = this.state.socket;
        const chatLog = this.state.chatLog;
        const userList = this.state.userList;
        const sceneTitle = this.state.sceneTitle;
        const sceneDescription = this.state.sceneDescription;
        const sceneNumber = this.state.sceneNumber;
        const totalScene = this.state.totalScene;
        const messageSceneCounter = this.state.messageSceneCounter;
        const acotacionsSceneCue = this.state.acotacionsSceneCue;

        const rolesAsigned = this.state.rolesAsigned;
        const totalRoles = this.state.totalRoles;
        const totalRolesExtra = this.state.totalRolesExtra;

        return (
            <div class="directorContainer">
                 
                    <aside className="directorSide">
                        <strong>{sceneTitle}</strong> {sceneDescription}<br/>
                       <hr/>
                       
                        <span className="containerCounterField">Escena:  <span className="counterField"><strong>{(sceneNumber+1)+"/"+totalScene}</strong></span></span>
                        <span className="containerCounterField">Mensajes escena: <span className="counterField"><strong>{messageSceneCounter}</strong></span></span>
                        <span className="containerCounterField">Acotaciones cola: <span className="counterField"><strong>{acotacionsSceneCue}</strong></span></span>
                        <span className="containerCounterField">Personajes: <span className="counterField"><strong>{rolesAsigned + "/" + totalRoles}</strong></span></span>
                        <span className="containerCounterField">Extras: <span className="counterField"><strong>{totalRolesExtra}</strong></span></span>
                       
                        <div id="buttonContainer">
                        <span className="buttonField">Siguiente Escena<button onClick={this.changeToNextScene}>+</button></span>
                        <br/>
                        <span className="buttonField">Personaje extra<button onClick={this.addOneExtra}>+</button></span>
                         </div>
                    </aside>
                    <div className="chatBodyContainer">
                    <div className="userDirectorContainer">
                    <main className="directorMain">
                      <Chat ref="chat" messages={chatLog} />
                    </main>
                    <aside className="userSide">
                    <Users socket={socket} users={userList} type='director' />
                    </aside>
                    </div>
                    <div className="directorInput">
                        <Input socket={socket} type={type} characterName={''}/>
                    </div>
                    </div>
                </div>
           
        )
    }
}

export default chatDirector
