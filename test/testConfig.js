//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Tekijä: Heikki 14.12.2014
// Tarvittavat alkutiedot testien tekemiselle
// Apufunktiot HTTP-kutsujen tekoon.

var testConfig = {}

// Testiympäristössä ajettavan palvelimen portti
testConfig.port = 3333;

// Testeissä käytetyn master-tason käyttäjän tiedot.
testConfig.masterUserInfo = {
  username: "testi", 
  password: "testi"
};

// Testauksessa käytetyn katselijatason käyttäjän tiedot.
testConfig.spectatorUserInfo = {
  username: "qwe", 
  password: "qwe"
};

// Testeissä käytetyn hakemuksen id. Löydyttävä kannasta.
testConfig.testApplicationId = 575;

// Testeissä käytetyn käyttäjän id. Löydyttävä kannasta.
testConfig.testUserId = 16;


// GET-pyyntöjen tekemiseen käytetyt perusparametrit
testConfig.getOpt = function (path) {
  var options = {
    "host": "localhost",
    "port": testConfig.port,
    "path": path,
    "method": "GET",
  };
  return options;
}

module.exports = testConfig;