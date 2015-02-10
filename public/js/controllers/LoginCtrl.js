//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.1.2015, Tuomas Kunnamo 8.1.2015


// Kirjautumisikkunan controller
'use strict';

angular.module('LoginCtrl', []).controller('LoginController', function($scope, $http, $rootScope, $route, AUTH_EVENTS, Auth) {
  
  $scope.credentials = {
      username: '',
      password: ''
    };

  $scope.currentUser = null;
  $scope.checkSessionLoading = true;

  $scope.loginAttempts = 0;

  // Tarkistetaan backendiltä, onko sessio jo olemassa
  Auth.checkSessionExists( function(user, sessionExists){
    if(sessionExists){
      $scope.currentUser = user;
      $scope.userLoggedIn = !!user;
    }
    $scope.checkSessionLoading = false;
  });

  $scope.login = function (credentials) {
    Auth.login(credentials, function (user) {
      $scope.loginAttempts++;
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      $scope.currentUser = user;
      $scope.userLoggedIn = !!user;
      $route.reload();
    }, function () {
      $scope.loginAttempts++;
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };

  $scope.logout = function(){
    Auth.logout(function(){
      $scope.currentUser = null;
      $scope.userLoggedIn = false;
      $scope.loginAttempts = 0;
      $route.reload();
    });
  };

});
