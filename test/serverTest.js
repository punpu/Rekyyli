//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Palvelimen toimintaan liittyvät testit
// Tekijä: Heikki Känä 14.12.2014
// Viimeisimmät muutokset:

var http = require('http');
var should = require('should');

var app = require('../rekyyli.js');

// Haetaan testien asetukset ja apufunktiot
var tc = require('./testConfig');
 

describe('Rekyyli', function () {
	it('Moduuli löytyy', function (done) {
		should.exist(app);
		done();
	});

  it('Palvelin kuuntelee porttia localhost:' + tc.port, function (done) {
    http.request(tc.getOpt('/'), function (res) {
      res.statusCode.should.eql(200);      
    });
    done();
  });

});