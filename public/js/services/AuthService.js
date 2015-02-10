//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.1.2015, Tuomas Kunnamo 8.1.2015

'use strict';

angular.module('AuthService', []).factory('Auth', ['$http', function($http) {

  var authService = {};
  var session = {};

  return {

    session: session,
 
    login: function (credentials, callback) {
      $http({
        url: 'api/login',
        method: 'POST',
        data: {
          username: credentials.username,
          password: credentials.password
        }
      }).success(function(data, status) {
        console.log(data);
        session.username = data.username;
        session.userId = data.id;
        session.name = data.name;
        session.email = data.email;
        if( data.master ){
          session.master = true;  
        }
        else{
          session.master = false;
        }
        console.log(session);
        // Välitetään sessiotiedot kutsujalle
        callback(data);
      }).
      error( function(data, status) {
        callback();
      });
    },

    checkSessionExists: function ( callback ){
      $http.get('/api/checksession')
      .success(function(data, status){

        session.username = data.username;
        session.userId = data.id;
        session.name = data.name;
        session.email = data.email;
        if( data.master ){
          session.master = true;  
        }
        else{
          session.master = false;
        }

        callback(data, true);
      })
      .error(function(data, status){
        callback(data, false);
      });
    },
   
    isAuthenticated: function () {
      return !!Session.userId;
    },
   
    isAuthorized: function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authService.isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    },

    logout: function (callback) {
      session.id = null;
      session.userId = null;
      session.userRole = null;
      $http.get('/api/logout').then(function(){
        callback();
      });
    }

  };

}]);