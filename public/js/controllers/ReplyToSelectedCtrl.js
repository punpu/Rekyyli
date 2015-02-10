//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Tuomas Kunnamo
// Viimeisimmät muutokset:  Mikko Nieminen 8.11.2014, Heikki Känä 3.12.2014, Tuomas Kunnamo 10.12.2014

// Tämä on vastaa valituille hakemuksille-näkymän kontrolleri
'use strict';

angular.module('ReplyToSelectedCtrl', [])
	.controller('ReplyToSelectedController', function($scope, $http, Applications, Mail, Auth, Alerts) {


	$scope.selectedMailTemplateTitle = 'Sähköpostipohja';
	$scope.mailToSend = {};

	$scope.alerts = Alerts.alerts;

	// Haetaan serviceltä tieto valituista hakemuksista
	Applications.selectedApplications ( function(data) {
		$scope.selected = data;
	});

	// Hakee sähköpostipohjat MailServiceä hyödyntäen
	$scope.getMailtemplates = function() {
    Mail.get(function(data, status) {
    	$scope.mailtemplates = data;
    });
	};

	// Tätä kutsutaan kun dropdown-valikosta valitaan vastauspohja
	$scope.showMailTemplate = function(mailTemplate) {
		$scope.selectedMailTemplate = mailTemplate;
		$scope.selectedMailTemplateTitle = mailTemplate.title;
		$scope.selectedMailTemplateSubject = mailTemplate.subject;
		$scope.mail_body = mailTemplate.body;
	};

	// Heikki 3.12.2014: Lisätty oikea otsikko
	function sendMail(){
		$scope.mailToSend.message = $scope.mail_body;
		$scope.mailToSend.recipients = $scope.selected;
		$scope.mailToSend.subject = $scope.selectedMailTemplateSubject;
		$scope.mailToSend.sender = Auth.session.email;

		$scope.sendMail_loading = true;

		Mail.send($scope.mailToSend, function(status, successful){

			if( successful ){
				Alerts.addAlert({type:"success", msg:"Sähköpostit lähetetty."}, 8000);
			} else{
				Alerts.addAlert({type:"danger", msg:"Sähköpostin lähetyksessä ongelma. Yksi tai useampi viesteistä ei mennyt perille. Virhekoodi: "+status}, 10000);
			}
			$scope.sendMail_loading = false;
		});
	}
	// debounce estää ylimääräiset vahinkoklikkaukset käyttäjältä
  // Odottaa 3000ms ennenkuin funktio voidaan ajaa uudelleen, kun painiketta klikataan
	$scope.sendMail = _.debounce(sendMail, 6000, true);

	// Kutsutaan kun painetaan Tallenna muutokset -nappia
	function updateEmailTemplate() {
		// Sähköpostipohjaa ei ole valittu
		if (!$scope.selectedMailTemplate) {
			alert('Valitse sähköpostipohja');
		}
		// Päivitetään pohja kantaan
		else {
			$scope.updateEmailTemplate_loading = true;

			// Heikki 3.12.2014: Lisätty kutsuun subject
			Mail.edit($scope.selectedMailTemplate.id, $scope.selectedMailTemplate.title,
							  $scope.selectedMailTemplateSubject, $scope.mail_body, function( status, successful) {

				if( successful ){
					Alerts.addAlert({type:"success", msg:"Sähköpostipohja päivitetty."}, 2500);
				} else{
					Alerts.addAlert({type:"danger", msg:"Sähköpostipohjan päivittäminen epäonnistui. Virhekoodi: "+status}, 4000);
				}
				$scope.updateEmailTemplate_loading = false;
			});
		}
	}
	// debounce estää ylimääräiset vahinkoklikkaukset käyttäjältä
  // Odottaa 1000ms ennenkuin funktio voidaan ajaa uudelleen, kun painiketta klikataan
	$scope.updateEmailTemplate = _.debounce(updateEmailTemplate, 1000, true);

	// Sivua ladatessa ja päivittäessä tehtävät funktiokutsut =============================================
	$scope.getMailtemplates();

});
