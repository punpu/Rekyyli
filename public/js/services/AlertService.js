//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Tuomas Kunnamo
// Viimeisimmät muutokset: Tuomas Kunnamo 30.12.2014

// Service käyttäjälle näytettävien virhe- ja onnistumisviestien hallintaan

angular.module('AlertService', []).factory('Alerts', [ '$timeout', function($timeout) {

  alerts = [];

  return {

    alerts: alerts,

    // parametri alert mallia: {type: "error"|"success", msg: "Käyttäjälle näkyvä viesti"}
    // timeout on alertin näkymisaika millisekunneissa
    addAlert: function(alert, timeout){
      alerts.push(alert);
      
      if( timeout ){
        $timeout(function(){
          alerts.splice( alerts.indexOf(alert), 1);
        }, timeout);
      }
    }
  };

}]);