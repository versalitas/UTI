// ---------------------------------------------------------------
// Uti.cat (Roger special chat)
// ---------------------------------------------------------------

var express = require('express')
const router = express.Router();
const bodyParser = require("body-parser");
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const uuid = require('node-uuid');
const fs = require('fs');
const parse = require('csv-parse');
var path = require('path');

// ---------------------------------------------------------------
// Global variables **********************************************
// ---------------------------------------------------------------

var allMessages = [];
var allClients = [];
var users = [];
var messageSceneCounter = 0;
var sceneNumber = 0;
var rolesAsigned = 0;
var rolesAr = [];
var lastMessageSend = 0;
var timeBetweenMessages = 15000;
var screenPosition = 1;
var soundDirector = 0;
var blockNewMessages = false;
var csvSounds = [];
var totalSampleAudios = 70;
let colorCounter = 0;

// ---------------------------------------------------------------
// Global methods ************************************************
// ---------------------------------------------------------------

// Assign random color to actor from color list
const assignColor = () => {
  if(colorCounter >= 7){
    colorCounter = 0;
  }
  const colors = ['whitesmoke','lightpink','paleturquoise','peachpuff','LightSteelBlue','SandyBrown','lightgreen'];
  let color = colors[colorCounter];
  colorCounter+=1;
  return color;
}

function countMessage(socket){
  messageSceneCounter +=1;
  socket.broadcast.emit('messageSceneCounter', {messageSceneCounter:messageSceneCounter});
  socket.emit('messageSceneCounter', {messageSceneCounter:messageSceneCounter} );
}

function saveMessage(data){
  console.log("socket save");
  const fs = require('fs');
  fs.appendFile('chat.csv', data+'\r\n', function (err) {
    if (!err) console.log('Saved!');
  });
}

function loadCSV(file){
  var csvData = [];
  fs.createReadStream(file)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        csvData.push(csvrow);
    })
    .on('end',function() {
      csvSounds = csvData;//.reverse();
    });
}

function sendSceneInformation(socket){
  try{
    var data =  {
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
  }catch(err){}
}

function sendUsers(socket){
  socket.broadcast.emit('newUserList',rolesAr);
  socket.emit('newUserList',rolesAr);
}

function checkIfSocketHasNoneRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return false;
  }
  // not found id
  return true;
}

function getRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].nickname;
  }
  return '';
}

function getSoundRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].sound;
  }
  return '';
}

// Get  color
const getColor = (id) => {
  for(let i = 0; i < rolesAr.length; i++ ){
    if (rolesAr[i].id == id) return rolesAr[i].color;
  }
  return '';
}
 
function getIsRoleActive(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].activated;
  }
  return false;
}

function deleteAllRolesAssigned(socket){
  socket.broadcast.emit('assignActor','');
  socket.emit('assignActor','');
}

function sendLastScene(socket){
  blockNewMessages = true;
  var randomMessagesAr = [];
  for(var i=0;i<csvSounds.length;i++){
    var indexRandom = Math.floor((allMessages.length-1) * Math.random());
    //console.log('indexRandom:',indexRandom,'-',allMessages.length)
    randomMessagesAr.push(allMessages[indexRandom]);
  }
  console.log('startLastScene',csvSounds.length,randomMessagesAr.length);
  socket.broadcast.emit('startLastScene',randomMessagesAr);
  socket.emit('startLastScene', randomMessagesAr);
}

function resetScene(socket){
  rolesAsigned = 0;
  messageSceneCounter = 0;
  deleteAllRolesAssigned(socket);
  rolesAr = [];
  sendUsers(socket);
  sendSceneInformation(socket);
  // Save title and description scene
  saveMessage(objTheaterPlay[sceneNumber].titulo+" "+objTheaterPlay[sceneNumber].descripcion);
  // After 11s then allow to connect people to chat
  setTimeout(function(){
    blockNewMessages = false;
    sendSceneInformation(socket);
  },15000);
}

function changeScene(socket){
  socket.broadcast.emit('fadeOutInChatScene',{});
  socket.emit('fadeOutInChatScene', {});

  setTimeout(function(){
    if(objTheaterPlay.length>(sceneNumber+1)) sceneNumber +=1;
    resetScene(socket);
    console.log("Call Change Scene",sceneNumber ,objTheaterPlay.length-1);
    // Last scene exception
    if(sceneNumber == objTheaterPlay.length-2){
      sendLastScene(socket);
    }
  },5000);
}

// ---------------------------------------------------------------
// JWT  **********************************************************
// ---------------------------------------------------------------

var passport = require('passport');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
require('dotenv').config() //read environment variables
// ExtractJwt to help extract the token
let ExtractJwt = passportJWT.ExtractJwt;

// JwtStrategy which is the strategy for the authentication
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'nZr4u7x!A%D*G-KaPdRgUkXp2s5v8y/B'; // 256 bit key
jwtOptions.algorithm = 'RS256';

// Lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
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

var objTheaterPlay;
fs.readFile('guion_CULTUROPOLIS_1.json'/*'./guion_CAT.json'*/, 'utf8', function (err, data) {
  if (err) throw err;
  objTheaterPlay = JSON.parse(data);
  console.log(objTheaterPlay[0].titulo);
});

// Load audios
loadCSV('./audios/CLAIR_DE_LUNE_TIEMPOS004_reduce.csv');


// ---------------------------------------------------------------
// Web server ****************************************************
// ---------------------------------------------------------------

app.use(express.static('./build/'));
app.use(express.static('./audios/'));

// add router in express app
app.use("/",router);
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
var urlencodedParser= bodyParser.urlencoded({ extended: false });

http.listen(process.env.PORT || 80, function() {
  var host = http.address().address
  var port = http.address().port
  console.log('App listening at http://%s:%s', host, port)
});

// ---------------------------------------------------------------
// Routes ********************************************************
// ---------------------------------------------------------------

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

// Redirect to all routes not defined
router.post('/authlogin',urlencodedParser, function(req, res, next) {
  const { password } = req.body;
  console.log("password",password);
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
    var returnJson = { msg: 'ok', token: token }; 
    console.log("return jwt token",returnJson);
    res.json(returnJson);
  } else {
    res.status(401).json({ msg: 'Password is incorrect' });
  }
});

router.get('/chatDirector', function(req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

router.get('/chatProjector', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});

router.get('/login', function(req, res) {
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
  var me = {
        id:         uuid.v4(),
        client:     socket.id,
        nickname:   null,
        joinedAt:   new Date().getTime()
  };
  allClients.push(socket);
  users.push(me);

  console.log("socket connected");

  // socket methods
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('logMessage', function (data) {
    console.log(data);
  });

  socket.on('connectMessage', function (data) {
    console.log(data);
    sendSceneInformation(socket);
  });

  socket.on('addExtraToScene', function (data) {
    if(objTheaterPlay[sceneNumber].personajesExtra.length>0){
      objTheaterPlay[sceneNumber].personajes.push( objTheaterPlay[sceneNumber].personajesExtra.pop());
    }
    sendSceneInformation(socket);
  });

  // Activate and disactivated
  socket.on('roleAdmin', function (data) {
    try{
      console.log('call role Admin :',rolesAr[data.index].activated);
      rolesAr[data.index].activated = data.activated;
      sendUsers(socket);
    }catch(err){}
  })

  socket.on('publicMessage', function (data) {
    if(blockNewMessages) return;

    if( checkIfSocketHasNoneRole(this.id) && objTheaterPlay[sceneNumber].personajes.length>rolesAsigned){
      var nickname = objTheaterPlay[sceneNumber].personajes[rolesAsigned];
      socket.emit('assignActor',nickname);
      //rolesIdAr.push(this.id);
      let color = assignColor();
      rolesAr.push({'id':this.id,'nickname':nickname,'activated':true,'sound':(1+Math.floor(Math.random()*totalSampleAudios)), 'color':color})

      rolesAsigned += 1;
      sendSceneInformation(socket);
      sendUsers(socket);
    }

    var currentTimestamp = Date.now();
    var role = getRole(this.id);
    var roleIsActive = getIsRoleActive(this.id);
    var sound = getSoundRole(this.id);
    let actorColor = getColor(this.id);

    if(role!="" && roleIsActive){
      console.log('Send text to chat');
      var message = {'id':this.id,'type':'public','message':data, 'from':role,'sound':sound,'color':actorColor};
      // Send message
      socket.broadcast.emit('newMessage', message );
      socket.emit('newMessage', message );
      // Store message
      allMessages.push(message);
      // Save message
      countMessage(socket);
      saveMessage(role+" : "+data);
    }
  });

  socket.on('directorMessage', function (data) {
    // Send message
    var messageStr = '('+data+')';
    var message = {'message':messageStr,'type':'director', 'from':'director','sound':soundDirector};
    socket.broadcast.emit('newMessage', message);
    socket.emit('newMessage', message);
    // Store message
    allMessages.push(message);
    // Save message
    countMessage(socket);
    saveMessage(messageStr);
  });

  socket.on('changeScene', function (data) {
    // Enviar frase finals
    //TODO check display of objTheaterPlay[sceneNumber].frase_final_escena...
    socket.broadcast.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')','type':'director', 'from':'director','sound':soundDirector});
    socket.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')', 'type':'director','sound':soundDirector});
    blockNewMessages = true;
    sendSceneInformation(socket);

    // After 5s then disable messages
   //test with 1000
    setTimeout(function(){
      changeScene(socket);
    },1000);
  });

  socket.on('disconnect', function() {
      console.log('Got disconnect!');
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
  });
})

// ---------------------------------------------------------------
// End file ******************************************************
// ---------------------------------------------------------------

