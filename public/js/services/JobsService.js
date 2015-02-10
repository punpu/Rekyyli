//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 8.11.2014, Eero Vornanen 13.12.2014

// Service pestien hallintaan
'use strict';

angular.module('JobsService', []).factory('Jobs', ['$http', function($http) {
  return {

    // Hakee kaikki pestit backendilta
    get: function(callback) {
      $http.get('api/jobs/')
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Lisää pestin backendille
    add: function(job_email, job_alias, callback) {
      $http.post('api/jobs/', {email: job_email, alias: job_alias})
      .success(function(data, status){
        callback(data, status);
      }).error(function(data, status){
        callback(data, status);
      });
    },

    // Poistaa pestin aliaksen
    removeAlias: function(job_id, callback) {
      $http.delete('api/jobs/'+job_id+'/alias/')
      .success(function(data, status) {
        callback(data, status);
      }).error(function(data, status){
        callback(data, status);
      });
    },

    // 
    editAlias: function(job_id, job_alias, callback) {
      $http.post('api/jobs/'+job_id+'/alias', {alias: job_alias})
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    editAutoreply: function(job_id, job_autoreply, callback) {
      $http.post('api/jobs/'+job_id+'/autoreply', {autoreply: job_autoreply})
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    }

  };
}]);
