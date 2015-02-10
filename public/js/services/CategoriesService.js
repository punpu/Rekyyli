//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.12.2014

// Service kategorioiden hallintaan
'use strict';

angular.module('CategoriesService', []).factory('Categories', ['$http', function($http) {
  return {

    // Hakee kaikki kategoriat kannasta
    get: function(callback) {
      $http({
        cache: false,
        url: 'api/categories/',
        method: 'GET',
      }).success(function(data, status) {
        callback(data, status);
      });
    },

    // Lisää kategorian kantaan
    add: function(category, callback) {
      $http({
        cache: false,
        url: 'api/categories/',
        method: 'POST',
        data: {
          category: category
        }
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Poistaa kategorian kannasta
    remove: function(category_id, callback) {
      $http({
        cache: false,
        url: 'api/categories/'+category_id,
        method: 'DELETE'
      }).success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    }

  };
}]);