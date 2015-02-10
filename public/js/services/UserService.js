//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 9.1.2015
'use strict';

angular.module('UserService', []).factory('User', ['$http', function($http) {

  return {
 
    // Hakee käyttäjälistan
    list: function(callback) {
      $http.get('/api/users')
      .success(function(data, status){
        callback(data, status, true)
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Hakee käyttäjän <user_id> tiedot
    getById: function(user_id, callback) {
      $http.get('/api/users/'+user_id)
      .success(function(data, status){
        callback(data, status, true)
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Lisää käyttäjän
    add: function(new_user, callback) {
      
      $http({
        url: 'api/users',
        method: 'POST',
        data: {
          name: new_user.name,
          username: new_user.username,
          password: new_user.password,
          email: new_user.email,
          master: new_user.master
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Muuttaa käyttäjän tietoja
    edit: function(new_info, callback) {
      $http({
        url: 'api/users/'+new_info.id,
        method: 'POST',
        data: {
          name: new_info.name,
          username: new_info.username,
          email: new_info.email,
          password: new_info.password,
          master: new_info.master
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Poistaa käyttäjän
    remove: function(user_id, callback) {
      $http({
        url: 'api/users/'+user_id,
        method: 'DELETE'
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    }

  };

}]);