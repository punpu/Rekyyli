//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.12.2014, Eero Vornanen 14.1.2015

// Service muistiinpanojen hallintaan
'use strict';

angular.module('NotesService', []).factory('Notes', ['$http', function($http) {
  return {

    // Nämä ovat hakemuskohtaisia muutoksia varten =========================================
    // Hakee kaikki hakemuksen application_id muistiinpanot
    get: function(applicationID, callback) {
      $http({
        url: 'api/applications/'+applicationID+'/notes',
        method: 'GET',
      }).success(function(data, status) {
        callback(data, status);
      });
    },

    // Lisää muistiinpanon note hakemukselle application_id
    add: function(application_id, note, user, callback) {
      $http({
        url: 'api/applications/'+application_id+'/notes',
        method: 'POST',
        data: {
          note: note,
          user: user
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Poistaa muistiinpanon  kannasta hakemukselta application_id
    remove: function(application_id, note_id, callback) {
      $http({
        url: 'api/applications/'+application_id+'/notes/'+note_id,
        method: 'DELETE'
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    }

  };
}]);