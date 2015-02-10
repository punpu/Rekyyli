//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 8.11.2014, Eero Vornanen 13.12.2014

// Tämä on Asetusten pestinäkymän kontrolleri

angular.module('SettingsJobsCtrl', []).controller('SettingsJobsController', function($scope, Jobs, Alerts) {

  $scope.alerts = Alerts.alerts;

  // Haetaan pestit
  Jobs.get(function(data, status) {
    $scope.jobs = data;
  });

  $scope.editAlias = function(job) {

    var job_alias = job.alias;

    if(job_alias === "") {
      job_alias = job.email;
      $scope.job.alias=job_alias;
    }

    $scope.changeAlias_loading = true;

    Jobs.editAlias($scope.job_id, job_alias, function(data, status, successful) {
      // Päivitetään pestilista
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Pestin alias tallennettu."}, 2500);
      } else{
        Alerts.addAlert({type:"danger", msg:"Pestin aliaksen tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
      $scope.changeAlias_loading = false;


      Jobs.get(function(data, status) {
        $scope.jobs = data;
      });
    });
  };

  $scope.editAutoreply = function(job) {
    Jobs.editAutoreply($scope.job_id, job.autoreply, function(data, status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Pestin automaattivastaus tallennettu."}, 2500);
      } else{
        Alerts.addAlert({type:"danger", msg:"Pestin automaattivastauksen tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
      $scope.changeAutoreply_loading = false;

      // Päivitetään pestilista
      Jobs.get(function(data, status) {
        $scope.jobs = data;
      });
    });
  };

  $scope.showJob = function(job){
    $scope.job.email = job.email;
    $scope.job.alias = job.alias;
    $scope.job.autoreply = job.autoreply;
    $scope.job_id=job.id;
  };
});