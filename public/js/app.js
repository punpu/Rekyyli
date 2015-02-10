//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Mikko Nieminen
// Viimeisimmät muutokset: Mikko Nieminen 23.1.2015, Eero Vornanen 15.11, Tuomas Kunnamo 8.1.2015

angular.module('RekyyliApp', ['ngRoute', 'appRoutes',

  // Kontrollerit
  'MainCtrl',
  'Application_detailsCtrl',
  'Settings_categoriesCtrl',
  'Settings_usermanagerCtrl',
  'Settings_mailtemplatesCtrl',
  'Settings_tagsCtrl',
  'ReplyToSelectedCtrl',
  'SettingsJobsCtrl',
  'ModalNotesCtrl',
  'LoginCtrl',

  // Servicet
  'ApplicationsService',
  'CategoriesService',
  'NotesService',
  'TagsService',
  'MailService',
  'JobsService',
  'AuthService',
  'UserService',
  'AlertService'
  ]);