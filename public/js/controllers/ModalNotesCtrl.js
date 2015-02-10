//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Eero Vornanen
// Luotu 15.11.2014
// Viimeisimmät muutokset:

// Kontrolleri modaaliselle ikkunalle, jolla saadaan etusivun taulukosta
// hakemuksen muistiinpanot näkyville.

'use strict';

angular.module('ModalNotesCtrl', ['ui.bootstrap']).
controller('ModalNotesController', 
  function($scope, $modalInstance, application_id, Notes, Auth) {
  
  // Otetaan hakemuksen id scopeen, jotta sitä voidaan käyttää
  // html-templatessa.
  $scope.id = application_id;

  // Kutsuu Muistiinpanojen palvelua ja hakee hakemuksen muistiinpanot
  Notes.get(application_id, function(data) {
    $scope.notes = data;
  });

  // Lisää hakemukselle muistiinpanon NotesService:n kautta.
  $scope.addNote = function(newNote) {
    // Muistiinpano tallennetaan vain jos kenttään on kirjoitettu jotain
    if (newNote) {
      Notes.add(application_id, newNote, Auth.session.name, function(data, status) {

        // Muistiinpanon lisääminen onnistui, päivitetään muistiinpanolista
        Notes.get(application_id, function(data) {
          $scope.notes = data;
        });
        // Tyhjennetään tekstikenttä
        $scope.newNote = '';
      });
    }
  };

  // Sulkee muistiinpanojen modaalisen ikkunan.
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});