// create the controller and we're telling it that we are going to use $scope and we are going to use a FriendFactory and that it belongs to the fullMeanDemo app
fullMeanDemo.controller('FriendsController', function($scope, FriendFactory) {
  updateFriends();
  
  // gets all of the current friends and saves it in $scope.friends
  function updateFriends() {
    // FriendFactory.getFriends takes a callback function that has the output as a parameter
    FriendFactory.getFriends(function(output) {
      $scope.friends = output;
    });
  }

  $scope.addfriend = function() {
    FriendFactory.addNewFriend($scope.new_friend, function() {
      console.log("We added a Friend!!! NOT!")
    });
  }

})