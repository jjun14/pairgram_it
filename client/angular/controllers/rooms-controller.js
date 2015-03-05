// create the controller and we're telling it that we are going to use $scope and we are going to use a FriendFactory and that it belongs to the fullMeanDemo app
pairGram.controller('RoomsController', function($scope, $location, UserFactory, RoomFactory) {
  getCurrentUser();
  loggedIn();

  function getCurrentUser(){
    UserFactory.currentUser(function(response){
      $scope.current_user = response;
    })
  }

  function loggedIn(){
    socket.emit('logged_in', $scope.current_user);
  }

  $scope.logout = function(){
    UserFactory.logout();
    $location.path('/index');
  }

  $scope.createRoom = function(host, room){
    var new_room = {};
    new_room.host = {_id: host._id, first_name: host.first_name, last_name: host.last_name};
    new_room.name = room.name
    new_room.users = [];
    new_room.created_at = new Date();
    console.log('CLIENT CREATE ROOM', new_room);
    socket.emit('createRoom', new_room);
    new_room = {};
  }

  $scope.joinRoom = function(room_key, user){
    console.log('JOINING ROOM: ' + room_key);
    var join_info = {room_key: room_key, user: user}
    socket.emit('joinRoom', join_info);
  }

  socket.on('updateRoomList', function(data){
    var key = Object.keys(data)[0];
    $scope.$apply(function(){
      $scope.rooms[key] = data[key];   
    })
  })

  socket.on('showRoomList', function(data){
    console.log("CLIENT SHOW ROOMS\n", data);
    $scope.$apply(function(){
      $scope.rooms = data;      
    })
  })

  socket.on('refreshRoomList', function(data){
    $scope.$apply(function(){
      $scope.rooms = data;      
    })
  })

  socket.on('startRoom', function(data){
    $scope.$apply(function(){
      console.log('STARTING ROOM');
      console.log(data);
      RoomFactory.setCurrentRoom(data);
      $location.path('/editor');
    })
  })

  socket.on('enterRoom', function(data){
    $scope.$apply(function(){
      console.log('EMTERING ROOM');
      console.log(data);
      RoomFactory.setCurrentRoom(data);
      $location.path('/editor');
    })
  })
})