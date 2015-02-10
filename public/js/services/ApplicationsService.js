//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 2.12.2014, Heikki Känä 28.10.2014, Tuomas Kunnamo 30.11.2014,
// Eero Vornanen 5.12.2014

// Service hakemusten hallintaan
'use strict';

angular.module('ApplicationsService', []).factory('Applications', ['$http', function($http) {

  // ==================================================
  // Private muuttujat:
  //Säilyttää tiedon valittuina olleista hakemuksista
  var selected = [];
  // Tallennetaan hakuehdot tähän muuttujaan.
  var search_conditions = {};
  // ==================================================

  return {

    // Hakee ensimmäisen sivun verran hakemuksia kannasta
    get: function (callback) {
      $http.post('/api/applications/', search_conditions)
      .success(function(data, status) {
        callback(data, status);
        console.log(search_conditions);
      })
      .error(function(data, status){
        callback(data, status, false);
      });
    },

    // Tekijä: Mikko Nieminen 2.12.2014
    // Poistaa application_id mukaisen hakemuksen
    delete: function (application_id, callback) {
      $http.delete('/api/applications/'+application_id)
      .success(function(data, status) {
        callback(data, status);
      });
    },

    // Poistaa kaikki app_ids-objektissa olevien id:tten mukaiset hakemukset
    // data: {app_ids: [1,2,3]}
    deleteMany: function (app_ids, callback) {
    console.log(app_ids);
      $http({
        url: '/api/applications/',
        method: 'DELETE',
        data: app_ids,
        headers: {
        "Content-Type": "application/json"
    }
      })
      .success(function(data, status) {
        callback(data, status, true);
      }).error(function(data, status){
        callback(data, status, false);
      });
    },

    // Hakee sivun verran hakemuksia kohdasta index eteenpäin
    // backend palauttaa JSONina: {amount: <kaikkien hakemusten lkm>, list: <yhden sivun hakemukset>}
    getPageFrom: function ( index, page_size, callback){
      $http.post('api/applications?from=' + index + '&page_size=' + page_size, search_conditions)
      .success(function (data, status){
        callback(data, status, true);
      })
      .error(function (data, status) {
        callback(data, status, false);
      });
    },

    // Asetetaan parametrina saadut hakuehdot search_conditionsiin.
    searchConditions: function(conditions) {
      search_conditions = conditions;
    },

    // Lisää hakemuksen valittuihin
    select: function (application_info) {
      selected.push(application_info);
    },

    // Heikki Känä 28.10.2014
    // Poistaa muiden hakemusten valinnan ja valitsee yhden hakemuksen parametrin
    // perusteella. Käytetään hakemusnäkymästä yhdelle vastaamiseen.
    selectOne: function(application_info) {
      selected = [];
      selected.push(application_info);
    },

    // Muokattu: Tuomas Kunnamo 31.10.2014
    // Poistaa hakemuksen valituista
    deselect: function (application_info) {
      selected = _.reject(selected, function(applic){ return applic.id === application_info.id; });
    },

    // Tyhjentää kaikki valitut hakemukset
    deselectAll: function() {
      selected.length = 0;
    },

    // Palauttaa valitut hakemukset
    selectedApplications: function (callback) {
      callback(selected);
    },

    // Muokattu: Tuomas Kunnamo 31.10.2014
    // Asettaa valittujen hakemusten kategorian toiseksi kantaan
    setCategory: function(category_id, callback) {
      var selected_ids = _.pluck( selected, 'id' );
      $http.post('/api/applications/category/', {app_ids: selected_ids, categoryid: category_id}).success(function(status) {
          callback(status, true);
      }).error(function(status){
          callback(status, false);
      });
    },

    // Asettaa yksittäisen hakemuksen kategorian toiseksi
    setApplicationCategory: function(application_id, category_id, callback) {
      $http.post('/api/applications/'+application_id+'/category/', {categoryid: category_id}).success(function(status) {
          callback(status, true);
      }).error(function(status){
          callback(status, false);
      });
    },

    // Asettaa yksittäisen hakemuksen pestin toiseksi
    setApplicationJob: function(application_id, job_id, callback) {
      console.log("Nyt ollaan servicessä");
      $http.post('/api/applications/'+application_id+'/job/', {jobid: job_id}).success(function(status) {
          callback(status, true);
      }).error(function(status){
          callback(status, false);
      });
    },

    setApplicationNameAndSender: function(application_id, new_name, new_sender, callback) {
      $http.post('/api/applications/'+application_id+'/info', {name: new_name, sender: new_sender}).success(function(status) {
          callback(status, true);
      }).error(function(status){
          callback(status, false);
      });
    },

    // Tehnyt: Eero Vornanen
    returnConditions: function() {
      return search_conditions;
    },

    // Tehnyt: Eero Vornanen 23.12.2014
    // Asetetaan hakuaikaväli nulliksi.
    removeDates: function() {
      search_conditions.stringdatefrom = null;
      search_conditions.stringdateto = null;
    }
  };
}]);
