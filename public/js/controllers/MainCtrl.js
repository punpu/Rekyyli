//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 12.12.2014, Joni Ollikainen 18.10,
// Tuomas Kunnamo 8.1.2015, Eero Vornanen 15.1.2015

// Pää- ja etusivunäkymän kontrolleri

'use strict';

angular.module('MainCtrl', ['ui.bootstrap', 'angularUtils.directives.dirPagination']).controller('MainController', function($route, $scope, 
  $modal, $http, $rootScope, Applications, Tags, Categories, Jobs, USER_ROLES, AUTH_EVENTS, Auth, Alerts) {

  // Tehnyt: Eero Vornanen
  // Muokannut Eero Vornanen 15.1.2015
  $scope.search = function() {
    // Haetaan syötettyjä tageja vastaavat id:t
    if($scope.search_tags.length > 0) {
      var temp = []
      for ( var i=0; i<$scope.search_tags.length; i++ ) {
        for ( var j=0; j<$scope.tags.length; j++ ) { 
          if ( $scope.search_tags[i] == $scope.tags[j].body ) {
            console.log("Lähetetään hakuparametrina tagi: "+$scope.search_tags[i]);
            temp.push($scope.tags[j].id);
          }
        }
      }
      $scope.search_conditions.tag_ids = temp;
    }
    else{
      $scope.search_conditions.tag_ids = null;
    }

    // Muutetaan päivämäärät oikeaan muotoon.
    $scope.search_conditions.stringdatefrom = formatDate( $scope.search_conditions.datefrom, '00:00:00+00' );
    $scope.search_conditions.stringdateto = formatDate( $scope.search_conditions.dateto, '24:00:00+00' );

    // Välitetään hakuehdot applicationsServicelle
    Applications.searchConditions($scope.search_conditions);

    // Tehdään getti annetuilla hakuehdoilla, jolloin näytölle
    // tulee hakuehtojen mukainen hakemuslista.
    $scope.applications_list_loading = true;
    Applications.get( function(data, status) {
      $scope.applications_list_loading = false;
      $scope.applications = data.list;
      $scope.total_applications = data.amount;
      if (!$scope.applications) {
        Alerts.addAlert({type:"danger", msg:"Hakuehdoilla ei löytynyt hakemuksia"}, 4000);
      }
    });
  };

  // Tehnyt: Eero Vornanen 
  // Tyhjennetään hakuehdot
  $scope.emptySearch = function() {

    var empty_conditions = {};
    $scope.search_tags = [];

    // Välitetään tyhjät hakuehdot applicationsServicelle
    Applications.searchConditions(empty_conditions);
    initializeFrontPage();

    // Laitetaan tyhjät hakuehdot gettinä, jolloin saadaan näkymään
    // kaikki hakemukset.
    $scope.applications_list_loading = true;
    Applications.get( function(data) {
      $scope.applications_list_loading = false;
      $scope.applications = data.list;
      $scope.total_applications = data.amount;
    });
  };

  // Tehnyt: Mikko Nieminen 7.12.2014
  // Lisää tägin hakuparametreihin
  $scope.addTag = function(newTag) {
    // Tarkistetaan oliko tagi jo syötetty
    if (!_.contains($scope.search_tags, newTag) ) {
      //Tulostetaan testiksi selaimen consoleen id ja tagi
      console.log('Tallennetaan tagi '+newTag+' hakuparametreihin');

      // Tägi tallennetaan vain jos kenttään on kirjoitettu jotain
      if (newTag) {
        $scope.search_tags.push(newTag);
      }
    }
    // Tyhjennetään tekstikenttä
    $scope.newTag = '';
  };

  // Tehnyt: Mikko Nieminen 12.12.2014
  // Poistaa parametrina annetun tagin hakuparametreista
  $scope.removeSearchTag = function(search_tag) {
    $scope.search_tags = _.reject($scope.search_tags, function(rejected){ return rejected == search_tag });
    console.log('Poistetaan tagi '+search_tag+' hakuparametreista');
  };

  // Tehnyt: Eero Vornanen 23.12.2014
  // Funktio tyhjentää hakuehdoista aikavälihaun
  $scope.emptyDates = function() {
    Applications.removeDates();
    $scope.search_conditions.datefrom = null;
    $scope.search_conditions.dateto = null;
  };

//=========================================================================

  // Muokattu 25.11.2014 Tuomas, 5.12.2014 Mikko Nieminen
  // Tämä ajetaan, kun hakemustaulukossa vaihdetaan sivua
  // Hakee backendiltä uuden sivun hakemukset
  $scope.pageChangeHandler = function(page_number){
    // Pyyhitään sivunvaihdon yhteydessä hakemusten checkboxit
    $scope.deselectAll();

    console.log("Page changed to " + page_number);
    $scope.current_page = page_number;

    $scope.applications_list_loading = true;

    // Index on sen hakemuksen indeksi, josta eteenpäin yksi sivu halutaan hakea
    var index = $scope.page_size * ( page_number - 1 );
    Applications.getPageFrom( index, $scope.page_size, function(data, status){
      $scope.applications_list_loading = false;
      $scope.total_applications = data.amount;
      $scope.applications = data.list;
    });
  };

  // Muokattu 30.11.2014 Tuomas
  // Tämä ajetaan, kun käyttäjä klikkaa etusivulta "hakemuksia sivulla"-linkkejä
  $scope.changePageSize = function( new_size ){
    // Pyyhitään hakemusten checkboxit
    $scope.deselectAll();

    $scope.page_size = new_size;

    // Haetaan uuden kokoinen sivu
    $scope.pageChangeHandler( $scope.current_page );
  };

  // funktio asettaa sarakkeen, jonka mukaan hakemuslista järjestetään
  $scope.orderBy = function orderBy(field){
    // Jos klikataan samaa saraketta uudelleen, käännetään järjestys
    if( $scope.orderByField === field ){
      $scope.reverseOrder = ! $scope.reverseOrder;
    }
    else{
      $scope.orderByField = field;
    }
  };

  // Haetaan serviceltä tieto valituista hakemuksista
  Applications.selectedApplications ( function(data) {
    $scope.selected = data;
  });

  // Muokattu 31.10.2014 Tuomas, vaihdettu toimimaan underscoren funktioilla
  // Checkboxin valinnan funktio. Tökkää valitun hakemuksen tietoja
  // selected-taulukkoon
  $scope.toggleSelection = function toggleSelection(applicationInfo) {

    var selectedApplication = _.findWhere( $scope.selected, {id: applicationInfo.id} );
    // Jos hakemus oli jo valittu, poistetaan valinta
    if ( selectedApplication ) {
      Applications.deselect( selectedApplication );
    }
    // Muuten lisätään valinta
    else {
      Applications.select(applicationInfo);
    }
    // päivitetään scope.selected
    Applications.selectedApplications ( function(data) {
      $scope.selected = data;
    });
  };

  // Tekijä: Mikko Nieminen
  // Poistaa valinnan kaikista hakemuksista sekä kaikki hakemukset valitsevasta checkboxista
  $scope.deselectAll = function() {
    angular.forEach($scope.applications, function(applic) {
      // Poistetaan valinta kaikista, jotka olivat jo valittuja
      if( _.findWhere( $scope.selected, {id: applic.id} ) ) {
        $scope.toggleSelection( { id: applic.id, email: applic.sender, name: applic.name } );
      }
      // Poistetaan valitut myös servicen tiedoista
      Applications.deselectAll();
    });
    // Pyyhitään valinta vielä kaikki hakemukset valitsevasta checkboxista
    $scope.selectedAll = false;
  }

  // Muokattu 31.10.2014 Tuomas, vaihdettu toimimaan underscoren funktioilla
  // Funktio, jolla saadaan kaikkien hakemusten checkboxit valittua.
  $scope.selectAll = function() {
    angular.forEach($scope.applications, function(applic) {
      // Jos selectedAll on true, niin checkbox oli jo ennalta täpätty
      if ($scope.selectedAll === true) {
        // Poistetaan valinta kaikista, jotka olivat jo valittuja
        if( _.findWhere( $scope.selected, {id: applic.id} ) ) {
          $scope.toggleSelection( { id: applic.id, email: applic.sender, name: applic.name } );
        }
      }
      // Kaikkien valinta checkbox ei ollut ennalta täpätty
      else {
        // Lisätään valinta kaikille, joita ei ollut valittu
        if( _.findWhere( $scope.selected, {id: applic.id} ) === undefined ) {
          $scope.toggleSelection( { id: applic.id, email: applic.sender, name: applic.name } );
        }
      }
    });
  };

  // 31.10.2014 Tuomas, tarkistaa onko hakemus valittu hakemuslistasta checkboksilla.
  $scope.isSelected = function isSelected( applicationID ){
    return _.some($scope.selected, function(applic){ return applic.id === applicationID; });
  };

  // Asetetaan dropdownmenulla valittu kategoria valituksi kategoriaksi.
  $scope.setCategory = function setCategory(chosenCategory) {
    $scope.selectedCategory = chosenCategory;
  };

  // Muokattu 23.10. by Mikko, 30.11.2014 Tuomas (hakemuslistan päivitys pageChangeHandlerilla)
  // Vaihdetaan valittujen hakemusten kategoria
  // Hakemusten id numerot menevät listana
  // Lisätty vivut virheviestien ja latausikonin näyttämiseen
  function changeCategory() {
    $scope.changeCategory_loading = true;
    $scope.changeCategory_success = false;
    $scope.changeCategory_failure = false;
    // Vaihdetaan kategoria servicen metodilla
    Applications.setCategory( $scope.selectedCategory.id, function(status, successful) {
      
      $scope.changeCategory_loading = false;

      if( successful ){
        Alerts.addAlert({type:"success", msg:"Kategorian vaihto onnistui."}, 2500);
      } else{
        Alerts.addAlert({type:"danger", msg:"Kategorian vaihto epäonnistui. Virhekoodi: "+status}, 4000);
      }
      // Vaihto onnistui, joten päivitetään hakemuslista
      $scope.pageChangeHandler( $scope.current_page );
    });
  }
  // debounce estää ylimääräiset vahinkoklikkaukset käyttäjältä
  // Odottaa 1000ms ennenkuin funktio voidaan ajaa uudelleen, kun kategorianvaihtoa klikataan
  $scope.changeCategory = _.debounce( changeCategory, 1000, true );


  // Tekijä: Eero 26.10., muokannut Eero 8.11.2014
  // Kalenterivalinnan asetukset hakemuslistan hakuehdoissa.
  $scope.dateOptions = {
    // Määritetään viikko alkamaan maanantaista.
    // Oletus 0, eli sunnunta.
    startingDay: 1
  };

  // Tekijä: Eero 8.11., muokannut Eero 8.11.2014
  // Määritetään event, jossa avataan kalenterinäkymä hakemuslistan
  // hakuehdoissa. Parametreina event, joka on tässä tapauksessa 
  // kalenterin avaus ja opened, joka tarkentaa eventin vain yhteen 
  // kalenteriin.
  $scope.openCalendar = function($event, opened) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope[opened] = true;
  };

  // Tekijä: Eero
  // Muokattu: 15.11.
  // Avaa modal-ikkunan kun klikataan muistiinpanojen nappia
  // etusivun hakemustaulusta.
  $scope.openNotes = function(id) {
    $modal.open({
      // Määritetään ikunan html-template
      templateUrl: 'views/modalnotes.html',
      // Määritetään ikkunan kontrolleri
      controller: 'ModalNotesController',
      // Ikkunan kooksi large
      size: 'lg',
      // Välitetään hakemuksen id modalnoteskontrollerille,
      // jotta osataan hakea oikeat muistiinpanot.
      resolve: {
        application_id: function() {
          return id;
        }
      }
    });
  };

  // Tekijä: Eero Vornanen 2.12.2014
  // Muokannut viimeksi: Tuomas Kunnamo 16.12.2014
  // Apufunktio päivämäärän tyylin muuttamiseen. Ottaa parametrina päivämäärän
  // ja muuttaa sen muotoon yyyy-mm-dd <time>, jollaisena aika pitää antaa tietokannalle
  function formatDate(date, time) {
    
    if( ! date || ! time ){
        return "";
    }
    // Otetaan annetusta päivämäärästä päivä, kuukausi ja vuosi
    var dd = date.getDate();
    // Javascriptissä kuukaudet alkaa nollasta.
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();

    // Jos päivä on alle 10. päivä, lisätään alkuun 0.
    if(dd < 10)
    {
      dd = '0'+dd;
    }

    // Jos kuukause on alle 10., lisätään alkuun 0.
    if(mm < 10)
    {
      mm = '0'+mm;
    }

    // Luodaan päivästä, kuukaudesta ja vuodesta yksi muuttuja
    // oikeassa muodossa ja palautetaan se.
    var newdate = yyyy + '-' + mm + '-' + dd + ' ' + time;
    return newdate;
  };

  // Tekijä: Eero Vornanen 13.12.2014
  // Muokannut viimeksi: Eero Vornanen 13.12.2014
  // Apufunktio joka laskee annetusta päivämäärästä 3kk aikaisemman päivän.
  function countThreeMonths (date) {
    var newdate = new Date();
    newdate.setMonth(date.getMonth() - 3);

    return newdate;
  };

  // Poistaa kaikki valitut hakemukset
  $scope.deleteSelected = function(){
    var jsondata = {};
    jsondata.app_ids = _.pluck( $scope.selected, 'id' );
    Applications.deleteMany( jsondata, function(data, status, successful){

      if( successful ){
        Alerts.addAlert({type:"success", msg:"Hakemusten poisto onnistui."}, 2500);
        $scope.pageChangeHandler($scope.current_page);
      } else{
        Alerts.addAlert({type:"danger", msg:"Hakemusten poisto epäonnistui. Virhekoodi: "+status}, 4000);
      }
    });
  };

  // Sivun latauksen yhteydessä tehtävät toimenpiteet ===========================
  initializeFrontPage();  

  // Tuomas Kunnamo 16.12.2014
  // Muokannut Eero Vornanen 15.1.2015
  // Alustaa kaikki MainControllerin tarvitsemat tiedot
  function initializeFrontPage(){
    // Kirjautunut käyttäjä
    $scope.user = Auth.session;
    $scope.alerts = Alerts.alerts;


    // Alustetaan hakuehdoista päivämääriin oletukseksi viimeiset 3kk
    $scope.default_enddate = new Date();
    $scope.default_enddate.getDate();
    $scope.default_begindate = new Date();
    $scope.default_begindate = countThreeMonths($scope.default_enddate);

    // Hakemustaulukon sivutuksen muuttujat ja default-arvot
    $scope.page_number = 1;
    $scope.page_size = 50;
    $scope.current_page = 1;
    $scope.total_applications = 0;

    // Hakuparametreihin syötetyt tagit
    $scope.search_tags = [];

    // Hakemustaulukon järjestämiseen
    $scope.orderByField = 'timestamp';
    $scope.reverseOrder = true;

    // Hakemustaulukon yllä näytetään latausanimaatio, kun tämä on true
    // Default true, koska heti sivun alussa hakemustaulukkoa ruvetaan hakemaan
    $scope.applications_list_loading = true;

    // Poistetaan vanhat checkbox valinnat jos näitä oli
    $scope.deselectAll();

    // EERO TEHNYT 5.12.2014, muokannut 16.12.
    // Hakuehtojen alustukset:

    // Tagihaun and/or valinta, defaulttina tai-haku
    $scope.search_conditions = {};
    $scope.search_conditions.wordsearch = Applications.returnConditions().wordsearch;
    $scope.search_conditions.destination = Applications.returnConditions().destination;
    $scope.search_conditions.category_id = Applications.returnConditions().category_id;
    $scope.search_conditions.replysent = Applications.returnConditions().replysent;
    $scope.search_conditions.name = Applications.returnConditions().name;
    $scope.search_conditions.sender = Applications.returnConditions().sender;

    if(!angular.isUndefined(Applications.returnConditions().dateto)) {
      $scope.search_conditions.dateto = Applications.returnConditions().dateto;
    }
    else {
      // Tallennetaan default-arvo servicen hakuehtoihin
      $scope.search_conditions.dateto = $scope.default_enddate;
      var conditions = Applications.returnConditions();
      conditions.stringdateto = formatDate( $scope.search_conditions.dateto, '24:00:00+00' );
      Applications.searchConditions(conditions);
    }

    if(!angular.isUndefined(Applications.returnConditions().datefrom)) {
      $scope.search_conditions.datefrom = Applications.returnConditions().datefrom;
    }
    else {
      // Tallennetaan default-arvo servicen hakuehtoihin
      $scope.search_conditions.datefrom = $scope.default_begindate;
      var conditions = Applications.returnConditions();
      conditions.stringdatefrom = formatDate( $scope.search_conditions.datefrom, '00:00:00+00' );
      Applications.searchConditions(conditions);
    }

    $scope.search_conditions.tag_search_mode = 'Or';
    
    // Haetaan kaikki järjestelmän tagit
    Tags.get(function(data, status) {
      $scope.tags = data;
      
      // Haetaan tagihaun tagit ja kirjoitetaan ne näkyviin etusivun hakuehtoihin
      if(!angular.isUndefined(Applications.returnConditions().tag_ids)) {
        var id_list = Applications.returnConditions().tag_ids;

        // Etsitään tagien id:tä vastaavat taginimet ja pushataan search_tag:eihin
        _.each( data, function(tag){
          var tagname = _.find( id_list, function(id){ return id == tag.id } );

          if( tagname ){
            $scope.search_tags.push(tag.body);
          }
        });
      }
    });
  
    // Haetaan serviceltä hakemukset
    Applications.get( function(data) {
      $scope.applications = data.list;
      $scope.applications_list_loading = false;
      $scope.total_applications = data.amount;
    });

    // Haetaan kategoriat serviceltä
    Categories.get( function(data) {
      // Asetetaan kategoriat muistiin
      $scope.categories = data;
      // Poistetaan näkymässä tarpeeton Poistettu-kategoria 
      $scope.change_categories = _.without(data, _.findWhere(data, {category: "Poistettu"}));
    });

    // Haetaan pestit serviceltä
    Jobs.get( function(data) {
      // Asetetaan pestit muistiin.
      $scope.jobs = data;
    });

  }
});
