//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko
// Viimeisimmät muutokset: Hannu 12.10.2014, Tuomas 24.10.2014, Mikko 1.11.2014

// Angularin routet eri hauille

angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// Etusivu(Hakemukset) ja Rekyyli-ikonin route
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		// Vastausnäkymä etusivulla valituille hakemuksille
		.when('/vastaa', {
			templateUrl: 'views/replyToSelected.html',
			controller: 'ReplyToSelectedController'
		})

		// Hakemus-sivun route
		.when('/hakemus/:hakemusId', {
			templateUrl: 'views/application_details.html',
			controller: 'Application_detailsController'
		})
		
		// Asetukset-sivun route
		.when('/asetukset', {
			templateUrl: 'views/settings.html',
			controller: 'SettingsController'
		})

		// Asetukset-sivun route
		.when('/kategoriat', {
			templateUrl: 'views/settings_categories.html',
			controller: 'Settings_categoriesController'
		})

		// Asetukset-sivun route
		.when('/kayttajahallinta', {
			templateUrl: 'views/settings_usermanager.html',
			controller: 'Settings_usermanagerController'
		})

		// Asetukset-sivun route
		.when('/sahkopostipohjat', {
			templateUrl: 'views/settings_mailtemplates.html',
			controller: 'Settings_mailtemplatesController'
		})

		// Pestit-sivun route
		.when('/pestit', {
			templateUrl: 'views/settingsJobs.html',
			controller: 'SettingsJobsController'
		})

		// Asetusten tagisivun route
		.when('/tagit', {
			templateUrl: 'views/settings_tags.html',
			controller: 'Settings_tagsController'
		});

	$locationProvider.html5Mode(true);

}])

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  master: 'master',
  user: 'user'
});
