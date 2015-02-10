//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Autentikointiin liittyvät testit
// Tekijä: Heikki Känä 21.1.2015
// Viimeisimmät muutokset:

var should = require('should');
var request = require('supertest');
var app = require('../rekyyli.js');

// Haetaan testien asetukset ja apufunktiot
var tc = require('./testConfig');

var testAgent = request.agent('http://localhost:'+tc.port);
var testApplicationId = 575;

var testMail = {
  message: "Testi", 
  subject: "Testiotsikko",
  recipients: [
    {email: "testi@example.com",
    id: testApplicationId, 
    name : "Testisetä"}
  ]
};


describe('Autentikointi', function () {

  it('Kirjautuminen testikäyttäjällä palauttaa statuksen 200', function (done) {
    testAgent
    .post('/api/login')
    .send(tc.masterUserInfo)
    .end(function (err, res) {
      res.status.should.eql(200);
      done();
    });
    
  });

  it ('Kirjautuneen käyttäjän uloskirjautuminen palauttaa 200', function (done) {
    testAgent
    .post('/api/login')
    .send(tc.masterUserInfo)
    //.expect(200)
    .end(function (err, res) {
      if (err) console.log(err);
      testAgent
      .get('/api/logout')
      .end( function (err, res) {
        res.status.should.eql(200);
      });

      done();
    });
  });

  describe('Järjestelmän kokoelmien noutaminen ilman kirjautumista palauttaa 401', function () {
    it('Hakemukset', function (done) {
      request(app).get('/api/applications')
      .expect(401, done);
    });

    it('Kategoriat', function (done) {
      request(app).get('/api/categories')
      .expect(401, done);
    });

    it('Tagit', function (done) {
      request(app).get('/api/tags')
      .expect(401, done);
    });

    it('Sähköpostipohjat', function (done) {
      request(app).get('/api/mailtemplates')
      .expect(401, done);
    });

    it('Käyttäjät', function (done) {
      request(app).get('/api/users')
      .expect(401, done);
    });
  });

  describe('Yksittäisen hakemuksen tietojen noutaminen ilman autentikointia palauttaa 401', function () {
    
    it('Hakemuksen tiedot', function (done) {
      request(app).get('/api/applications/'+testApplicationId)
      .expect(401, done);
    });

    it('Liitteet', function (done) {
      request(app).get('/api/applications/'+testApplicationId+'/attachments')
      .expect(401, done);
    });

    it('Muistiinpanot', function (done) {
      request(app).get('/api/applications/'+testApplicationId+'/notes')
      .expect(401, done);
    });
  });
});