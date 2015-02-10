//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Tuomas Kunnamo
// Viimeisimmät muutokset: Heikki Känä 28.10.2014, Mikko Nieminen 30.11.2014, Tuomas Kunnamo 15.12.2014

// Tämä on hakemuksen tiedot-näkymän kontrolleri
'use strict';

angular.module('Application_detailsCtrl', []).controller('Application_detailsController', function($scope, $routeParams, $http, $location, Categories, Applications, Notes, Tags, Jobs, Auth, Alerts) {

	$scope.id = $routeParams.hakemusId;

  // Kirjautunut käyttäjä
  $scope.user = Auth.session;
  $scope.alerts = Alerts.alerts;

	// Näytetään sivulla virheviesti, jos tämä on true
	// alustetaan true, jotta virheviesti ei vilahda jokakerta ennenkun tietokantahaun tulos selviää
	$scope.applicationFound = true;

  $scope.modifying_info = false;

  // Päivittää scopeen uudet sisällöt backendilta ja suorittaa tietojen haun sivua avatessa
  // Voi kutsua aina kun tarve päivittää tiedot backendilta
  $scope.refresh = function() {
    $http({
      url: '/api/applications/'+$scope.id,
      method: 'GET',
    }).success(function(data, status) {
      $scope.application = data;
      $scope.applicationFound = true;

      // Haetaan liitteet ja muistiinpanot vasta kun muut tiedot on haettu
      $scope.getAttachmentList();

      // Haetaan muistiinpanot
      $scope.getNotes();

    }).error(function(data, status) {
          $scope.applicationFound = false;
      });
  };

  // Vaihdetaan valittujen hakemusten kategoria
  // Hakemusten id numerot menevät listana
  // Lisätty vivut virheviestien ja latausikonin näyttämiseen
  function changeCategory(category_id) {
    
    // Vaihdetaan kategoria servicen metodilla
    Applications.setApplicationCategory( $scope.application.id, category_id, function(status, successful) {
      
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Kategoria vaihdettu."}, 2500);
        $scope.refresh();
      } else{
        Alerts.addAlert({type:"danger", msg:"Kategorian vaihtaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  }
  // debounce estää ylimääräiset vahinkoklikkaukset käyttäjältä
  // Odottaa 1000ms ennenkuin funktio voidaan ajaa uudelleen, kun kategorianvaihtoa klikataan
  $scope.changeCategory = _.debounce( changeCategory, 1000, true );

  // Vaihtaa hakemuksen pestin
  $scope.changeJob = function(job_id) {
  	console.log("Nyt ollaan controllerissa");
    $scope.changeJob_alert = 'loading';
    Applications.setApplicationJob( $scope.application.id, job_id, function(status, successful) {
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Pesti vaihdettu."}, 2500);
        $scope.refresh();
      } else{
        Alerts.addAlert({type:"danger", msg:"Pestin vaihtaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  }

  // Hakee hakemuksen liitteet
	$scope.getAttachmentList = function() {
		$http({
			url: '/api/applications/'+$scope.id+'/attachments/',
			method: 'GET',
		}).success(function(data, status) {
			$scope.attachments = data;
		}).error(function(data, status) {
					alert('Liitetiedostojen hakeminen ei onnistunut.');
			});
	};

	// Tätä kutsutaan klikkaamalla liitetiedostoa
	$scope.getAttachment = function(applicationID, hash) {
			window.open('/api/applications/'+applicationID+'/attachments/'+hash);
	};

	// Tätä kutsutaan kun painetaan Vastaa-nappia. Mikäli hakemuslistassa on valittu
	// hakemuksia ennen tälle sivulle tuloa, niiden valinta täytyy poistaa,
	// jotta vastausnäkymässä esivalittuna vastaanottajana on vain tämän hakemus-sivun hakemus
	$scope.selectOneApplication = function(applicationInfo) {
		Applications.selectOne(applicationInfo);
	};


	// Muistiinpanot ===================================================================================
	// Hakee muistiinpanot
	$scope.getNotes = function() {
		// Kutsuu Muistiinpanojen palvelua ja hakee hakemuksen muistiinpanot
		Notes.get($scope.id, function(data) {
			$scope.notes = data;
		});
	};

	// Lisää muistiinpanon hakemukselle, parametrina saatu newNote on tekstikentän sisältö
	$scope.addNote = function(applicationID, newNote) {
		// Muistiinpano tallennetaan vain jos kenttään on kirjoitettu jotain
		if (newNote) {
			Notes.add(applicationID, newNote, Auth.session.name, function(data, status, successful) {

        if( successful ){
          Alerts.addAlert({type:"success", msg:"Muistiinpano tallennettu."}, 2500);
          // Muistiinpanon lisääminen onnistui, päivitetään muistiinpanolista
          $scope.getNotes();
          // Tyhjennetään tekstikenttä
          $scope.newNote = '';
        } else{
          Alerts.addAlert({type:"danger", msg:"Muistiinpanon tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
        }
			});
		}
	};

	// Poistaa id:n mukaisen kommentin hakemukselta applicationID
	$scope.deleteNote = function(applicationID, noteID) {
		Notes.remove(applicationID, noteID, function(data, status, successful) {
			  if( successful ){
          Alerts.addAlert({type:"success", msg:"Muistiinpano poistettu."}, 2500);
          // Muistiinpanon poistaminen onnistui, päivitetään muistiinpanolista
          $scope.getNotes();
        } else{
          Alerts.addAlert({type:"danger", msg:"Muistiinpanon poistaminen epäonnistui. Virhekoodi: "+status}, 4000);
        }
		});
	};

	// Tagit ============================================================================================
	// Hakee parametrina annetun hakemuksen kaikki tagit
	$scope.getTags = function() {
		Tags.getByApplication($scope.id, function(data) {
			$scope.tags = data;
		});
	};

	// Lisää tägin hakemukselle applicationID
	$scope.addTag = function(applicationID, newTag) {
		//Tulostetaan testiksi selaimen consoleen id ja tagi
		console.log('Tallennetaan tägi hakemukselle: '+applicationID);
		console.log('Tägi: '+newTag);

		// Tägi tallennetaan vain jos kenttään on kirjoitettu jotain
		if (newTag) {
			Tags.addToApplication(applicationID, newTag, function(data, status, successful) {
				if( successful ){
          Alerts.addAlert({type:"success", msg:"Tägi lisätty."}, 2500);
          // Tägin lisääminen onnistui, päivitetään hakemuksen tiedot näkymään
          $scope.refresh();
          // Tyhjennetään tekstikenttä
          $scope.newTag = '';
        } else{
          Alerts.addAlert({type:"danger", msg:"Tägin lisääminen epäonnistui. Virhekoodi: "+status}, 4000);
        }
			});
		}
	};

	// Poistaa id:n mukaisen tagin hakemukselta applicationID
	$scope.deleteTag = function(applicationID, tag) {
		Tags.removeFromApplication(applicationID, tag, function(data, status, successful) {
			if( successful ){
          Alerts.addAlert({type:"success", msg:"Tägi poistettu hakemukselta."}, 2500);
          // Tägin lisääminen onnistui, päivitetään hakemuksen tiedot näkymään
          $scope.refresh();
        } else{
          Alerts.addAlert({type:"danger", msg:"Tägin poistaminen hakemukselta epäonnistui. Virhekoodi: "+status}, 4000);
        }
		});
	};

  // Poistaa hakemuksen
  $scope.deleteApplication = function(application_id) {
    Applications.delete(application_id, function(data, status) {
      $location.path('/');
    });
  }

  $scope.showModifiableInfo = function(){
    $scope.modifying_info = true;
    $scope.new_name = $scope.application.name;
    $scope.new_sender = $scope.application.sender;
  };

  $scope.saveModifiedInfo = function(){
    Applications.setApplicationNameAndSender( $scope.application.id, $scope.new_name, $scope.new_sender, function(status, successful){
      
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Hakemuksen tiedot tallennettu."}, 2500);
        $scope.refresh();
        $scope.modifying_info = false;
      } else{
        Alerts.addAlert({type:"danger", msg:"Hakemuksen tietojen tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  $scope.cancelModify = function(){
    $scope.modifying_info = false;
  };

	// Sivua ladatessa ja päivittäessä tehtävät toimenpiteet =============================================
	$scope.refresh();

	// Haetaan kategoriat serviceltä
  Categories.get( function(data) {
    // Poistetaan näkymässä tarpeeton Poistettu-kategoria
    data = _.without(data, _.findWhere(data, {category: "Poistettu"}))
    // Asetetaan kategoriat muistiin
    $scope.categories = data;
  });

  // Haetaan kaikki järjestelmän tagit
  Tags.get(function(data, status) {
    // Valitaan pelkät tagien nimet
    $scope.tags = _.pluck(data, 'body');
  });

  // Haetaan pestit serviceltä
  Jobs.get( function(data, status, successful) {
    if( successful ){
      // Asetetaan pestit muistiin.
    $scope.jobs = data;
    }
  });

});
