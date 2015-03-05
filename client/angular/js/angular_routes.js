// use the config method to set up routing:
pairGram.config(function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl: './angular/partials/login.html'
    })  
    .when('/register', {
      templateUrl: './angular/partials/register.html'
    })    
    .when('/rooms', {
      templateUrl: './angular/partials/rooms.html'
    })
    .when('/editor' ,{
      templateUrl: './angular/partials/editor.html'
    })
    .otherwise({
      redirectTo: '/'
    });
});