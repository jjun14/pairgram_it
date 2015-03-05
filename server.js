var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client')));

var mongoose = require('./config/mongoose.js');
var routes = require('./config/routes.js')(app);

// start listening
var server = app.listen(8000, function(){
  console.log("Listening on 8000");
});

var rooms = {};
var users = [];
var count = 0;

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
  console.log('Sockets are open for business');
  console.log(socket.id);
  // socket code goes here
  socket.on('logged_in', function(data){
    console.log('SOCKET ID: ', socket.id);
    console.log(data);
    users[socket.id] = data;
    socket.emit('showRoomList', rooms);
  })

  socket.on('createRoom', function(data){
    var new_room = {};
    console.log('received new room');
    rooms[socket.id] = data;
    new_room[socket.id] = data
    // console.log("ROOMS\n\n", rooms);
    console.log("STARTING ROOM");
    console.log(new_room);
    socket.join(socket.id);
    io.emit('updateRoomList', new_room);
    socket.emit('startRoom', new_room);
  })

  socket.on('joinRoom', function(data){
    console.log('user wants to enter room:' + data.room_key);
    for(room in rooms){
      if(room == data.room_key){
        var enter_room = {};
        rooms[room].users.push(data.user);
        console.log("Entering room");
        enter_room[data.room_key] = rooms[room];
        socket.join(data.room_key);
        socket.emit('enterRoom', enter_room);
      }
    }
    socket.broadcast.emit('refreshRoomList', rooms);
  })

  socket.on('sendOffer', function(data){
    console.log('got offer');
  })

  socket.on('keyPress', function(data){
    console.log(data);
    var update = {row: data.row, column: data.column, key: data.key};
    socket.to(data.room_key).broadcast.emit('updateEditor', update);
  })
})