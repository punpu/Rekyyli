//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko
// Viimeisimmät muutokset: Mikko 8.11.2014, Heikki 3.12.2014, Tuomas 10.12.2014

// Tämä on Asetusten sähköpostipohjanäkymän kontrolleri
'use strict';

angular.module('Settings_mailtemplatesCtrl', []).controller('Settings_mailtemplatesController', function($scope, Mail, Alerts) {

  // tallennettavan templaatin title ja teksti (mail_body)
  $scope.newTemplateTitle = '';
  $scope.newTemplateSubject = '';
  $scope.mail_body = '';
  $scope.templateID = '';

  $scope.alerts = Alerts.alerts;

  // Hakee sähköpostipohjat MailServiceä hyödyntäen
  $scope.getMailtemplates = function() {
    Mail.get(function(data, status) {
      $scope.mailtemplates = data;
    });
  };

  // Lisää uuden sähköpostipohjan
  // Heikki 3.12.2014: Selkeytetty parametrien nimiä ja siirretty parametriolion luonti serviceen, lisätty subject
  $scope.addMailtemplate = function(template_body, template_title, template_subject) {
    //Mail.add({mailtemplate: template_body, title: template_title, subject: template_subject}, function(data, status) {
    Mail.add(template_body, template_title, template_subject, function(data, status, successful) {
      
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Uusi sähköpostipohja tallennettu."}, 2500);
        // Päivitetään sähköpostipohjien lista
        $scope.getMailtemplates();
      } else{
        Alerts.addAlert({type:"danger", msg:"Sähköpostipohjan tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  // Muokkaa sähköpostipohjaa templateID parametrin template mukaiseksi
  // Heikki 3.12.2014: Lisätty subject
  $scope.editMailtemplate = function(template_id, template_title, template_subject, template_body) {
    // Sähköpostipohjaa ei ole valittu
    if (!$scope.templateID) {
      Alerts.addAlert({type:"danger", msg:"Käytä painiketta 'Tallenna uusi', tai valitse olemassaoleva sähköpostipohja."}, 5000);
    }
    // Päivitetään pohja kantaan
    else {
      Mail.edit(template_id, template_title, template_subject, template_body, function(data, status, successful) {
        if( successful ){
          Alerts.addAlert({type:"success", msg:"Sähköpostipohjan muutokset tallennettu."}, 2500);
          // Päivitetään sähköpostipohjien lista
          $scope.getMailtemplates();
        } else{
          Alerts.addAlert({type:"danger", msg:"Sähköpostipohjan tallentaminen epäonnistui. Virhekoodi: "+status}, 4000);
        }
      });
    }
  };

  // Poistaa templateID mukaisen sähköpostipohjan
  $scope.removeMailtemplate = function(templateID) {
    Mail.remove(templateID, function(data, status, successful) {
      
      if( successful ){
        Alerts.addAlert({type:"success", msg:"Sähköpostipohja poistettu."}, 2500);
        // Päivitetään sähköpostipohjien lista
        $scope.getMailtemplates();
      } else{
        Alerts.addAlert({type:"danger", msg:"Sähköpostipohjan poistaminen epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  $scope.showMailTemplate = function(mailTemplate){
    $scope.mail_body = mailTemplate.body;
    $scope.newTemplateTitle = mailTemplate.title;
    $scope.newTemplateSubject = mailTemplate.subject;
    $scope.templateID = mailTemplate.id;
  };

  // Sivua ladatessa ja päivittäessä tehtävät funktiokutsut =============================================
  $scope.getMailtemplates();

});
