//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko
// Viimeisimmät muutokset: Mikko 9.1.2015, Tuomas Kunnamo 10.1.2015

// Käyttäjähallintanäkymän kontrolleri

angular.module('Settings_usermanagerCtrl', []).controller('Settings_usermanagerController', function($scope, User, Alerts, Auth) {

  $scope.selectedUser = null;
  $scope.users = null;
  $scope.passwordsNotMatching = false;

  $scope.user = Auth.session;

  $scope.alerts = Alerts.alerts;

  $scope.refresh = function() {
    $scope.passwordsNotMatching = false;
    $scope.readonly = true;
    $scope.creatingUser = true;
    User.list( function(data, status, successful) {
      if( successful ){
        $scope.users = data;
      }
    });
  };

  $scope.selectUser = function(user) {
    $scope.selectedUser = user;

    $scope.creatingUser = false;
    $scope.readonly = true;
  };

  $scope.initializeNewUser = function() {
    $scope.selectedUser = null;
    $scope.creatingUser = true;
    $scope.readonly = false;
  };

  $scope.add = function (user) {
    
    // Jos salasanat eivät ole samat, lopetetaan ja näytetään errorviesti
    if( user.password != user.password_verify ){
      $scope.passwordsNotMatching = true;
      return;
    }

    // jos checkboxia ei klikkaa ollenkaan, user.master jää undefined:ksi, joten laitetaan se falseksi
    if( typeof user.master === 'undefined'){
      user.master = false;
    }

    User.add(user, function(data, status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Uusi käyttäjä lisätty."}, 2500);
        $scope.refresh();
      } else{
        Alerts.addAlert({type:"danger", msg:"Uuden käyttäjän lisääminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  $scope.edit = function(user) {

    // Jos salasanat eivät ole samat, lopetetaan ja näytetään errorviesti
    if( user.password != user.password_verify ){
      $scope.passwordsNotMatching = true;
      return;
    }

    User.edit(user, function(data, status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Käyttäjän tiedot tallennettu."}, 2500);
        $scope.refresh();
      } else{
        Alerts.addAlert({type:"danger", msg:"Käyttäjän tietojen tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  $scope.remove = function(user_id) {
    if(user_id === $scope.user.userId){
      Alerts.addAlert({type:"danger", msg:"Et voi poistaa itseäsi!"}, 4000);
      return;
    }

    User.remove(user_id, function(data, status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Käyttäjä poistettu."}, 2500);
        $scope.selectedUser = null;
        $scope.refresh();
      } else{
        Alerts.addAlert({type:"danger", msg:"Käyttäjän poistaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  $scope.toggleReadonly = function() {
    $scope.creatingUser = false;
    if ($scope.readonly === false) $scope.readonly = true
    else $scope.readonly = false
  };

  // Sivua ladatessa ja päivittäessä tehtävät toimenpiteet
  $scope.refresh();
  $scope.readonly = true;

});