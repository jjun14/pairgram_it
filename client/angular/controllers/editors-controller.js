// create the controller and we're telling it that we are going to use $scope and we are going to use a FriendFactory and that it belongs to the fullMeanDemo app
pairGram.controller('EditorsController', function($scope, UserFactory ,RoomFactory) {
  getCurrentUser();
  getCurrentRoom();
  startFeed();

  var pc; // Global variable for peer connection
  var localStream; // Global variable for local stream (this will be the one to be passed to the user)

  function startFeed(){
    // Check if getUserMedia function is available via polyfill.
    var localVideo = document.getElementById('localVideo');
    var remoteVideo = document.getElementById('remoteVideo');

    if (window.getUserMedia) {
        // Now, th we are sure we can use it, get our stream.
        window.getUserMedia({
            video: true,
            audio: true
        }, function(stream) {
            localVideo.src = URL.createObjectURL(stream);
            localStream = stream;
            
            // Create a peer connection for both users
            pc = new webkitRTCPeerConnection(
              { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] }
            );

            // we are going to detect candidates (user)
            pc.onicecandidate = onicecandidate;

            // trigger video call
            socket.emit("trigger_video_call", {room_key: $scope.room_key});
      }, function(){

      });
    }
  }

  function onicecandidate(event) 
  {

      if (!pc || !event || !event.candidate) return;

      var candidate = event.candidate;

      data = {
        candidate: candidate,
        room_key: $scope.room_key
      }

      // pass the candidate information to the other user of the room / call
      socket.emit("new_candidate", data);

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

  // we are going to add the other candidate information
  socket.on("set_candidate", function(data){
     pc.addIceCandidate(new RTCIceCandidate(data.candidate))
  });

  socket.on("new_user", function(data)
    {
      // detect when theres's a change on gathering candidate information
      pc.ongatheringchange = function(e)
      {
          if(e.currentTarget && e.currentTarge.iceGathering === 'complete')
          {
             data = {
               candidate: e.candidate,
               room_key: $scope.room_key 
             }

             // when gathering the candidate informations, pass it to the user
             socket.emit("new_candidate", data);
          }
      }

      // add remote stream
      pc.onaddstream = function(event){
          console.log(event.stream)
          remoteVideo.src = URL.createObjectURL(event.stream);
       }  

      // add your local stream - this will be passed to the other user
       pc.addStream(localStream);


      // offer your local session to other user
      pc.createOffer(function (sessionDescription) {
          pc.setLocalDescription(sessionDescription, function(){
               data = {
                  sessionDescription: sessionDescription,
                  room_key: $scope.room_key
                }

                // pass session description information
                socket.emit("create_sdp", data);
          });

        }, function(error) {
            alert(error);
        }, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
    })


  socket.on("new_offer", function(data){

    // receive the other user offer session description
    var session_description = new RTCSessionDescription({
        type: "offer",
        sdp: data.sessionDescription.sdp
    });

    // add the session description of the user as your remote session
     pc.setRemoteDescription(session_description);
     pc.onaddstream = function(event){
        console.log(event.stream)
        remoteVideo.src = URL.createObjectURL(event.stream);
     }  

     console.log(localStream)


     // add your local stream - this will be passed to the other user
       pc.addStream(localStream);


    // answer back to the other user offer and pass your local session to that user
     pc.createAnswer(function(sessionDescription){
        pc.setLocalDescription(sessionDescription, function(){
            data = {
              sessionDescription: sessionDescription,
              room_key: $scope.room_key
            }

            // pass session description information
            socket.emit("answer_sdp", data);
        });
     }, function(error) {
          alert(error);
      }, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
  });

  socket.on("answer_sdp", function(data){

    // receive the other user answer session description
    var session_description = new RTCSessionDescription({
      type: "answer",
      sdp: data.sessionDescription.sdp
    });

    // add the session description of the other user as your remote session
    pc.setRemoteDescription(session_description);

    pc.onaddstream = function(event){
         console.log(event.stream)
        remoteVideo.src = URL.createObjectURL(event.stream);
     }  

     console.log(localStream)

     pc.addStream(localStream);
  });



  // editor.getSession().on('change', function(e){
  //   var cursor = editor.getCursor();
  //   console.log(cursor);
  // })

})