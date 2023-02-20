// ---------------------------------------------------------------
// Uti.cat (Roger special chat)
// ---------------------------------------------------------------

const express = require('express')
const router = express.Router();
//TODO express.json()
const bodyParser = require("body-parser");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const uuid = require('node-uuid');
const fs = require('fs');

const parse = require('csv-parse');
const path = require('path');

// ---------------------------------------------------------------
// Global variables **********************************************
// ---------------------------------------------------------------

let allMessages = [];
let allClients = [];
let users = [];

let messageSceneCounter = 0;
let sceneNumber = 0;
let rolesAsigned = 0;
let rolesAr = [];
//TODO investigate these variables
let lastMessageSend = 0;
let timeBetweenMessages = 15000;
const pauseEndOfScene = let;
let screenPosition = 1;
let soundDirector = 0;
let blockNewMessages = false;
let csvSounds = [];
let totalSampleAudios = 70;
let colorCounter = 0;

const audio = './audios/CLAIR_DE_LUNE_TIEMPOS004_reduce.csv';
const guion = './guion_CULTUROPOLIS_1.json';

// ---------------------------------------------------------------
// Global methods ************************************************
// ---------------------------------------------------------------

// Assign random color user's chatbubble from color list
const assignColor = () => {
  if ( colorCounter >= 7 ) {
    colorCounter = 0;
  }
  const colors = ['whitesmoke','lightpink','paleturquoise','peachpuff','LightSteelBlue','SandyBrown','lightgreen'];
  let color = colors[ colorCounter ];
  colorCounter++;
  return color;
}

//
const countMessage = (socket) => {
  messageSceneCounter +=1;
  socket.broadcast.emit('messageSceneCounter', {messageSceneCounter:messageSceneCounter});
  socket.emit('messageSceneCounter', {messageSceneCounter:messageSceneCounter} );
}

//saves message to CSV
const saveMessage = (data) => {
  console.log("socket save");
  const fs = require('fs');
  fs.appendFile('chat.csv', data+'\r\n', (err) => {
    if (!err) console.log('Saved!');
  });
}

//loads CSV
const loadCSV = (file) => {
  let csvData = [];
  fs.createReadStream(file)
    .pipe(parse({delimiter: ','}))
    .on('data', (csvrow) => {
        csvData.push(csvrow);
    })
    .on('end', () => {
      csvSounds = csvData;//.reverse();
    });
}


const sendSceneInformation = (socket) => {
  try{
    let data =  {
      screenPosition:screenPosition,
      sceneTitle:objTheaterPlay[sceneNumber].titulo,
      sceneDescription: objTheaterPlay[sceneNumber].descripcion,
      sceneNumber:sceneNumber,
      totalScene:objTheaterPlay.length,
      messageSceneCounter:messageSceneCounter,
      rolesAsigned:rolesAsigned,
      totalRoles:objTheaterPlay[sceneNumber].personajes.length,
      totalRolesExtra:objTheaterPlay[sceneNumber].personajesExtra.length,
      allCharacterAsigned: (objTheaterPlay[sceneNumber].personajes.length<=rolesAsigned),
      blockNewMessages:blockNewMessages,
      acotacions: objTheaterPlay[sceneNumber].acotacions,
    };
    socket.broadcast.emit('sceneInfo', data);
    socket.emit('sceneInfo', data);
  } catch(err){
    //TODO add errorhandler
  }
}

const sendUsers = (socket) => {
  socket.broadcast.emit('newUserList',rolesAr);
  socket.emit('newUserList',rolesAr);
}

const checkIfSocketHasNoneRole = (id) => {
  for(let i = 0;i<rolesAr.length;i++){
    if(rolesAr[i].id == id) return false;
  }
  // not found id
  return true;
}

const getRole = (id) => {
  for(let i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].nickname;
  }
  return '';
}

const getSoundRole = (id) => {
  for(let i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id == id) return rolesAr[i].sound;
  }
  return '';
}

// Get color
const getColor = (id) => {
  for(let i = 0; i < rolesAr.length; i++ ){
    if (rolesAr[i].id == id) return rolesAr[i].color;
  }
  return '';
}
 
const getIsRoleActive = (id) => {
  for(let i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].activated;
  }
  return false;
}

const  deleteAllRolesAssigned = (socket) => {
  socket.broadcast.emit('assignActor','');
  socket.emit('assignActor','');
}

const sendLastScene = (socket) => {
  blockNewMessages = true;
  let randomMessagesAr = [];
  for(let i=0;i<csvSounds.length;i++){
    let indexRandom = Math.floor((allMessages.length-1) * Math.random());
    //console.log('indexRandom:',indexRandom,'-',allMessages.length)
    randomMessagesAr.push(allMessages[indexRandom]);
  }
  console.log('startLastScene',csvSounds.length,randomMessagesAr.length);
  socket.broadcast.emit('startLastScene',randomMessagesAr);
  socket.emit('startLastScene', randomMessagesAr);
}

const resetScene = (socket) => {
  rolesAsigned = 0;
  messageSceneCounter = 0;
  deleteAllRolesAssigned(socket);
  rolesAr = [];
  sendUsers(socket);
  sendSceneInformation(socket);
  // Save title and description scene
  saveMessage(objTheaterPlay[sceneNumber].titulo+" "+objTheaterPlay[sceneNumber].descripcion);
  // After 11s then allow to connect people to chat
  setTimeout( () => {
    blockNewMessages = false;
    sendSceneInformation(socket);
    //TODO convert to variable delay before allowing messages
  },15000);
}

const changeScene = (socket) => {
  socket.broadcast.emit('fadeOutInChatScene',{});
  socket.emit('fadeOutInChatScene', {});

  setTimeout( () => {
    if(objTheaterPlay.length>(sceneNumber+1)) sceneNumber +=1;
    resetScene(socket);
    console.log("Call Change Scene",sceneNumber ,objTheaterPlay.length-1);
    // Last scene exception
    if(sceneNumber == objTheaterPlay.length-2){
      sendLastScene(socket);
    }
    //TODO convert to variable delay before starting final scene
  },5000);
}

// ---------------------------------------------------------------
// JWT  **********************************************************
// ---------------------------------------------------------------

const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
require('dotenv').config() //read environment letiables
// ExtractJwt to help extract the token
let ExtractJwt = passportJWT.ExtractJwt;

// JwtStrategy which is the strategy for the authentication
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'nZr4u7x!A%D*G-KaPdRgUkXp2s5v8y/B'; // 256 bit key
jwtOptions.algorithm = 'RS256';

// Lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log('Payload received', jwt_payload);
  //let user = getUser({ id: jwt_payload.id });
  //if (user) {
  //  next(null, user);
  //} else {
  //  next(null, false);
  //}
});
passport.use(strategy);

// ---------------------------------------------------------------
// Load script ***************************************************
// ---------------------------------------------------------------

let objTheaterPlay;
fs.readFile(guion , 'utf8', (err, data) => {
  if (err) throw err;
  objTheaterPlay = JSON.parse(data);
  console.log(objTheaterPlay[0].titulo);
});

// Load audios
loadCSV(audio);


// ---------------------------------------------------------------
// Web server ****************************************************
// ---------------------------------------------------------------

app.use(express.static('./build/'));
app.use(express.static('./audios/'));

// add router in express app
app.use("/",router);
let urlencodedParser= bodyParser.urlencoded({ extended: false });

http.listen(process.env.PORT || 80, () => {
  const host = http.address().address
  const port = http.address().port
  console.log('App listening at http://%s:%s', host, port)
});

// ---------------------------------------------------------------
// Routes ********************************************************
// ---------------------------------------------------------------

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'), (err) => {
    if (err) res.status(500).send(err)
  })
});

// Redirect to all routes not defined
router.post('/authlogin', urlencodedParser, (req, res, next) => {
  const { password } = req.body;
  console.log("password", password);
  let userType = "none";
  if(password==="usiabus"){
    userType = "user";
  }

  if(password==="roger123456"){
    userType = "director";
  }

  if(userType === "user" || userType === "director"){
    let payload = { userType: userType };
    let token = jwt.sign(payload, jwtOptions.secretOrKey);
    let returnJson = { msg: 'ok', token: token }; 
    console.log("return jwt token",returnJson);
    res.json(returnJson);
  } else {
    res.status(401).json({ msg: 'Password is incorrect' });
  }
});

router.get('/chatDirector', (req, res) =>  {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

router.get('/chatProjector', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

router.get('/logout', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

// ---------------------------------------------------------------
// Socket server *************************************************
// ---------------------------------------------------------------

io.on('connection', function(socket) {
  console.log('Client connected to the WebSocket');

  // save socket client in a list
  let me = {
        id:         uuid.v4(),
        client:     socket.id,
        nickname:   null,
        joinedAt:   new Date().getTime()
  };
  allClients.push(socket);
  users.push(me);

  console.log("socket connected");
  
  //TODO this is probably duplicated code
  // socket methods
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  //TODO check if this event even exist in frontend
  socket.on('logMessage', function (data) {
    console.log(data);
  });
  
 
  socket.on('connectMessage', function (data) {
    console.log(data);
    sendSceneInformation(socket);
  });
  
  //adds additional role to scene
  socket.on('addExtraToScene', function (data) {
    if(objTheaterPlay[sceneNumber].personajesExtra.length>0){
      objTheaterPlay[sceneNumber].personajes.push( objTheaterPlay[sceneNumber].personajesExtra.pop());
    }
    sendSceneInformation(socket);
  });

  // Activate and desactivated
  socket.on('roleAdmin', function (data) {
    try{
      console.log('call role Admin :',rolesAr[data.index].activated);
      rolesAr[data.index].activated = data.activated;
      sendUsers(socket);
    }catch(err){
      console.error(err);
    }
  })
  
  //TODO change to publishMessage
  //Publishes messages and assigns roles on first message by User
  socket.on('publicMessage', function (data) {
    
    if(blockNewMessages) return;
    
    //assigns Role
    if( checkIfSocketHasNoneRole(this.id) && objTheaterPlay[sceneNumber].personajes.length>rolesAsigned){
      let nickname = objTheaterPlay[sceneNumber].personajes[rolesAsigned];
      socket.emit('assignActor',nickname);
      //rolesIdAr.push(this.id);
      let color = assignColor();
      rolesAr.push({'id':this.id,'nickname':nickname,'activated':true,'sound':(1+Math.floor(Math.random()*totalSampleAudios)), 'color':color})

      rolesAsigned += 1;
      sendSceneInformation(socket);
      sendUsers(socket);
    }

    //let currentTimestamp = Date.now();
    let role = getRole(this.id);
    let roleIsActive = getIsRoleActive(this.id);
    let sound = getSoundRole(this.id);
    let actorColor = getColor(this.id);

    if(role!="" && roleIsActive){
      console.log('Send text to chat');
      let message = {'id':this.id,'type':'public','message':data, 'from':role,'sound':sound,'color':actorColor};
      // Send message to front
      socket.broadcast.emit('newMessage', message );
      socket.emit('newMessage', message );
      // Store message in array
      allMessages.push(message);
      countMessage(socket);
      // Save message to CSV
      saveMessage(role+" : "+data);
    }
  });
  
  // messages from the director
  socket.on('directorMessage', function (data) {
    // Send message
    let messageStr = `(${data})`;
    let message = {'message':messageStr,'type':'director', 'from':'director','sound':soundDirector};
    socket.broadcast.emit('newMessage', message);
    socket.emit('newMessage', message);
    // Store message in array
    allMessages.push(message);
    // Save message
    countMessage(socket);
    saveMessage(messageStr);
  });

  //emits last didaskalia and changes to new scene
  socket.on('changeScene', function (data) {
   //TODO check display of objTheaterPlay[sceneNumber].frase_final_escena...
    socket.broadcast.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')','type':'director', 'from':'director','sound':soundDirector});
    socket.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')', 'type':'director','sound':soundDirector});
    //blocks users from messaging while director end scene
    blockNewMessages = true;
    sendSceneInformation(socket);
    //pause so audience can finish reading the scene
    setTimeout(function(){
      changeScene(socket);
    },pauseEndOfScene);
  });
  
  
  //on disconnect user is deleted from the allClients array.
  socket.on('disconnect', function() {
      console.log('Got disconnect!');
      let i = allClients.indexOf(socket);
      allClients.splice(i, 1);
  });
})

// ---------------------------------------------------------------
// End file ******************************************************
// ---------------------------------------------------------------