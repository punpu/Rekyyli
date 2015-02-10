//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Root suite, joka ajetaan ennen muita testejä
// Tekijä: Heikki Känä 14.12.2014
// Viimeisimmät muutokset: 

var http = require('http');

var app = require('../rekyyli.js')
var testConfig = require('./testConfig')
var server = '';


// Käytetään root suitea palvelimen käynnistämiseen ja sulkemiseen
before(function (done) {
	server = app.listen(testConfig.port, function (err, res) {
		if (err) {
			done(err);
		}
		else {
      console.log('Testipalvelin käynnissä...');
			done();
		}
	});
});

// Testien jälkeen suljetaan palvelin
after(function (done) {
  console.log('Suljetaan testipalvelin...');
	server.close();
  done();
});

