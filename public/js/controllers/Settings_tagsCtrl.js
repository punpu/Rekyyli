//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko
// Viimeisimmät muutokset: Mikko 8.11.2014

// Tämä on Asetusten taginäkymän kontrolleri

angular.module('Settings_tagsCtrl', []).controller('Settings_tagsController', function($scope, Tags, Alerts) {

  $scope.alerts = Alerts.alerts;

  // Haetaan tägit
  $scope.getTags = function() {
    Tags.get(function(data, status) {
      $scope.tags = data; 
    });
  };

  // Poistaa tägin järjestelmästä
  $scope.removeTag = function(tagID) {
    Tags.remove(tagID, function(data, status, successful){
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Tägin poisto onnistui."}, 2500);
        // Päivitetään tägitilanne näkymään
        $scope.getTags();
      } else{
        Alerts.addAlert({type:"danger", msg:"Tägin poisto epäonnistui. Virhekoodi: "+status}, 4000);
      }
      
    });
  };

  // Lisää tägin järjestelmään
  $scope.addTag = function(tag) {
    Tags.add(tag, function(data, status, successful){
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Uusi tägi tallennettu."}, 2500);
        // Päivitetään tägitilanne näkymään
        $scope.getTags();
        // Tyhjennetään kirjotettu tägi näkymän kentästä
        $scope.newTag = '';
      } else{
        Alerts.addAlert({type:"danger", msg:"Tägin lisääminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  // Sivua ladatessa ja päivittäessä tehtävät funktiokutsut =============================================
  $scope.getTags();
  
});