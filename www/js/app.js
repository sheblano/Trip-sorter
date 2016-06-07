var app = angular.module('myapp', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', { // the home state
      url: '/home',
      templateUrl: "templates/home.html",
      cache: false,
      controller: 'HomeController'
    });
  $urlRouterProvider.otherwise('/home'); // the default state
});

