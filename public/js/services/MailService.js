//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.11.2014, Tuoma Kunnamo Kunnamo 10.11.2014, Heikki 3.12.2014

// Service sähköpostipohjien hallintaan ja viestien lähetykseen
'use strict';

angular.module('MailService', []).factory('Mail', ['$http', function($http) {
  return {

    // Lähettää parametrin mail sisältämän sähköpostin
    // Muokattu: Tuomas Kunnamo 10.11.2014
    send: function(mail, callback) {
      $http.post('api/sendmail/', mail).success(function(status){
        callback(status, true);
      }).error(function(status){
        callback(status, false);
      });
    },

    // Hakee kaikki sähköpostipohjat backendilta
    // Muokattu: Tuomas Kunnamo 10.11.2014
    get: function(callback) {
      $http.get('api/mailtemplates/')
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Lisää järjestelmään uuden sähköpostipohjan parametrista template
    // template muotoa: {mailtemplate: "teksti", title: "titteli"}
    // Muokattu: Tuomas Kunnamo 10.11.2014
    // Heikki 3.12.2014: Siirretty parametriolion luonti ctrl:stä tänne yhtenäisyyden vuoksi, lisätty subject
    add: function(template_body, template_title, template_subject, callback) {
      $http.post('api/mailtemplates/', {mailtemplate: template_body, title: template_title, subject: template_subject})
      .success(function(data, status){
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Muuttaa sähköpostipohjan template sisällön parametria template_body vastaavaksi
    // Muokattu: Tuomas Kunnamo 10.11.2014
    // Heikki 3.12.2014: Lisätty subject
    edit: function(template_id, template_title, template_subject, template_body, callback) {
      $http.post('api/mailtemplates/'+template_id, {mailtemplate: template_body, title: template_title, subject: template_subject})
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Poistaa järjestelmästä parametria templateID vastaavan sähköpostipohjan
    // Muokattu: Tuomas Kunnamo 10.11.2014
    remove: function(template_id, callback) {
      $http.delete('api/mailtemplates/'+template_id)
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

  };
}]);
