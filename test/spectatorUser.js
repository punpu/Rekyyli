//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Autentikointiin liittyvät testit
// Tekijä: Heikki Känä 21.1.2015
// Viimeisimmät muutokset:

var should = require('should');
var request = require('supertest');
var sagent = require('superagent');

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

describe('Katselijatason käyttäjä', function () {

  // Kirjataan käyttäjä sisään ennen varsinaisia testejä
  before(function (done) {
    testAgent
    .post('/api/login')
    .send(tc.spectatorUserInfo)
    .expect(200, done);
  });

  describe ('Sallittu käyttö:', function () {

    it('Hakemuslistan noutaminen', function (done) {
      testAgent
      .get('/api/applications')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    // Tässä polkuna käytetään hakemuksen id:tä, jonka tiedetään löytyvän järjestelmästä
    it('Hakemuksen tiedot', function (done) {
      testAgent
      .get('/api/applications/'+tc.testApplicationId)
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it('Hakemuksen liitteet', function (done) {
      testAgent
      .get('/api/applications/'+tc.testApplicationId+'/attachments')
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it ('Yksittäisen hakemuksen noutaminen', function (done) {
      testAgent
      .get('/api/applications/'+tc.testApplicationId+'/attachments')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        var hash = JSON.parse(res.text.toString('utf8'))[0].hash;
        
        testAgent
        .get('/api/applications/'+tc.testApplicationId+'/attachments'+hash)
        .expect(200, done);
      });
    })
  });

  describe ('Estetty käyttö:', function () {

    it('Hakemuksen muistiinpanot', function (done) {
      testAgent
      .get('/api/applications/'+tc.testApplicationId+'/notes')
      .expect(403, done);
    });

    it('Sähköpostipohjien tarkasteleminen', function (done) {
      testAgent
      .get('/api/mailtemplates')
      .expect(403, done);
    });

    it('Pestien tarkasteleminen', function (done) {
      testAgent
      .get('/api/jobs')
      .expect(403, done);
    });

    it('Käyttäjien tarkasteleminen', function (done) {
      testAgent
      .get('/api/users')
      .expect(403, done);
    });

    it('Käyttäjän luominen', function (done) {
      testAgent
      .post('/api/users/')
      .send(testCreateUser)
      .expect(403, done);
    });

    it('Käyttäjän tietojen muokkaaminen', function (done) {
      testAgent
      .post('/api/users/'+tc.testUserId)
      .send(testCreateUser)
      .expect(403, done);
    });

    it('Käyttäjän poistaminen', function (done) {
      testAgent
      .delete('/api/users/'+tc.testUserId)
      .expect(403, done);
    });

  });
});