//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 23.1.2015

// Service tägien hallintaan
'use strict';

angular.module('TagsService', []).factory('Tags', ['$http', function($http) {
  return {

    // Nämä ovat hakemuskohtaisia muutoksia varten ==========================================
    // Lisää tägin tag hakemukselle application_id
    addToApplication: function(application_id, tag, callback) {
      tag = tag.toLowerCase();
      $http({
        url: 'api/applications/'+application_id+'/tags',
        method: 'POST',
        data: {
          tag: tag
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Poistaa tägin tagID kannasta hakemukselta application_id
    removeFromApplication: function(application_id, tag, callback) {
      $http({
        url: 'api/applications/'+application_id+'/tags/'+tag,
        method: 'DELETE',
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Nämä ovat järjestelmänlaajuisia muutoksia varten ======================================
    // Noutaa listan kaikista tägeistä järjestelmässä
    get: function(callback) {
      $http({
        url: 'api/tags/',
        method: 'GET',
      }).success(function(data, status) {
        callback(data, status);
      });
    },    

    // Lisää järjestelmänlaajuisen tagin
    add: function(tag, callback) {
      tag = tag.toLowerCase();
      $http({
        url: 'api/tags/',
        method: 'POST',
        data: {
          tag: tag
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Muuttaa tagin tagID nimen parametrin tag mukaiseksi
    edit: function(tag_id, tag, callback) {
      tag = tag.toLowerCase();
      $http({
        url: 'api/tags/'+tag_id,
        method: 'POST',
        data: {
          tag: tag
        }
      }).success(function(data, status) {
        callback(data, status);
      });
    },

    // Poistaa järjestelmänlaajuisen tägin
    remove: function(tag_id, callback) {
      $http({
        url: 'api/tags/'+tag_id,
        method: 'DELETE'
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    }

  };
}]);