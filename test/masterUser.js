//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Autentikointiin liittyvät testit
// Tekijä: Heikki Känä 21.1.2015
// Viimeisimmät muutokset:

var should = require('should');
var request = require('supertest');

// Haetaan testien asetukset ja apufunktiot
var tc = require('./testConfig');

var testAgent = request.agent('http://localhost:'+tc.port);

var testCreateUser = {
  name: 'Ahto Simakuutio', 
  username: 'ahmatti', 
  password: 'ahtoonparas', 
  email: 'ahto@ahto.com', 
  master: '1'
};

describe('Mastertason käyttäjä', function () {

  // Kirjataan käyttäjä sisään ennen varsinaisia testejä
  before(function (done) {
    testAgent
    .post('/api/login')
    .send(tc.masterUserInfo)
    .expect(200, done);
  });

  describe ('Masterille sallittu käyttö:', function () {

    it('Hakemuksen muistiinpanot', function (done) {
      testAgent
      .get('/api/applications/'+tc.testApplicationId+'/notes')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it('Sähköpostipohjien tarkasteleminen', function (done) {
      testAgent
      .get('/api/mailtemplates')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it('Pestien tarkasteleminen', function (done) {
      testAgent
      .get('/api/jobs')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it('Käyttäjien tarkasteleminen', function (done) {
      testAgent
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });
  });
});