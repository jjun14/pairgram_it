// create the controller and we're telling it that we are going to use $scope and we are going to use a FriendFactory and that it belongs to the fullMeanDemo app
pairGram.controller('EditorsController', function($scope, UserFactory ,RoomFactory) {
  getCurrentUser();
  getCurrentRoom();
  startFeed();


  function startFeed(){
  // Check if getUserMedia function is available via polyfill.
  var localBideo = document.getElementById('localVideo');
  if (window.getUserMedia) {
      // Now, th we are sure we can use it, get our stream.
      window.getUserMedia({
          video: true,
          audio: true
      }, function(stream) {
          localVideo.src = URL.createObjectURL(stream);
      //     var pc = new RTCPeerConnection(
      //       { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] }
      //     );
      //     pc.onicecandidate = onicecandidate;
      //     pc.onaddstream = onaddstream;
      //     pc.addStream(video);

      // peerConnection.createOffer(function (sessionDescription) {
      //   peerConnection.setLocalDescription(sessionDescription);

        // POST-Offer-SDP-For-Other-Peer(sessionDescription.sdp, sessionDescription.type);

      // }, function(error) {
      //     alert(error);
      // }, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });


      }, function(err) {
          // Handle error.
          console.log(err);
      })
    }
  }

  function onicecandidate(event) {
      if (!peerConnection || !event || !event.candidate) return;
      var candidate = event.candidate;
      // POST-ICE-to-other-Peer(candidate.candidate, candidate.sdpMLineIndex);
  }

  function getCurrentUser(){
    UserFactory.currentUser(function(response){
      $scope.current_user = response;
    })
  }

  function getCurrentRoom(){
    RoomFactory.getCurrentRoom(function(response){
      $scope.current_room = response;
      $scope.room_key = Object.keys(response)[0];
      console.log("CURRENT ROOM\n\n", $scope.current_room);
      // $scope.code = "alert('"+Object.keys($scope.current_room)[0]+"')";
    })
  }

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/cobalt");
  editor.getSession().setMode("ace/mode/javascript");
  editor.getSession().setTabSize(2);

  var cursor = editor.getSession().selection.getCursor();
  // document.onkeypress = function(e){
  //   cursor = editor.getSession().selection.getCursor();
  //   // console.log(String.fromCharCode(e.charCode));
  //   var update = {room_key: $scope.room_key, row: cursor.row, column: cursor.column, key: String.fromCharCode(e.charCode)}
  //   socket.emit('keyPress', update);
  // }

  document.onkeydown = function(e){
    console.log(e);
  }

  editor.getSession().selection.on('changeCursor', function(e){
    var test = editor.getSession().selection.getCursor();
    console.log(test);
  })

  socket.on('updateEditor', function(data){
    console.log(data);
    editor.getSession().selection.moveCursorBy(data.row, data.column);
    console.log(editor.getSession().selection.getCursor());
    editor.insert(data.key);
  })


  // editor.getSession().on('change', function(e){
  //   var cursor = editor.getCursor();
  //   console.log(cursor);
  // })

})