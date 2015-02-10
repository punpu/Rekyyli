//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko
// Viimeisimmät muutokset: Hannu 30.10.2014, Mikko 8.11.2014

// Tämä on Asetusten kategorianäkymän kontrolleri

angular.module('Settings_categoriesCtrl', []).controller('Settings_categoriesController', function($scope, Categories, Alerts) {

  $scope.alerts = Alerts.alerts;

  // Hakee kategoriat
  $scope.getCategories = function() {
    Categories.get(function(data) {
      $scope.categories = data;
    });
  };

  // Lisää kategorian
  $scope.addCategory = function(category) {
    Categories.add(category, function(data, status, successful) {

      if( successful ){
        Alerts.addAlert({type:"success", msg:"Uusi kategoria tallennettu."}, 2500);
        // Päivitetään kategorialista
        $scope.getCategories();
        // Tyhjennetään uuden kategorian kenttä
        $scope.newCategory = '';
      } else{
        Alerts.addAlert({type:"danger", msg:"Kategorian lisääminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
      
    });
  };

  // Poistaa kategorian
  $scope.deleteCategory = function(categoryID) {
    Categories.remove(categoryID, function(data, status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Kategoria poistettu."}, 2500);
        // Päivitetään kategorialista
        $scope.getCategories();
      } else{
        Alerts.addAlert({type:"danger", msg:"Kategorian poistaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  // Sivua ladatessa ja päivittäessä tehtävät funktiokutsut =============================================
  $scope.getCategories();

});