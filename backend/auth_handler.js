//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

// Kooditiedoston tekijä: Tuomas Kunnamo 4.1.2015
//Viimeisimmät muutokset: Tuomas Kunnamo 8.1.2015

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

//Alustetaan moduulit
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var dbh = require('./db_handler').dbHandler;
var dbHandler = new dbh();

var ush = require('./user_handler').handler;
var userHandler = new ush(dbHandler);


//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function(){
  this.passport = passport;
  this.login = login;
  this.logout = logout;
  this.requireAuthentication = requireAuthentication;
  this.requireMasterUser = requireMasterUser;
};

// serialisoidaan käyttäjän id sessioon
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialisoidaan käyttäjän tiedot id:n perusteella
passport.deserializeUser(function(id, done) {
  userHandler.findUserById(id, function(err, user){
    done(err, user);
  });
});

// Käytetään localstrategyä autentikointiin
passport.use(new LocalStrategy(function(username, password, done) {
  
  userHandler.verifyPassword(username, password, function(err, user, pwmatch){
    if (err) { 
      return done(err); 
    }
    if (!user) { 
      return done(null, false, { message: 'Tuntematon käyttäjänimi ' + username }); 
    }
    if(pwmatch){
      return done(null, user);
    }
    else{
      return done(null, false, { message: 'Invalid password' });
    }
  });
}));

// Tämä funktio suorittaa kirjautumisen. Kutsutaan rekyyli.js:n POST /login-polussa
var login = function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.sendStatus(401); }
    if (!user) {
      req.session.messages =  [info.message];
      console.log(info);
      return res.sendStatus(401);
    }
    req.logIn(user, function(err) {
      if (err) { return res.sendStatus(401); }
      console.log('Käyttäjä '+user.username+' kirjattu sisään');
      // Lähetetään clientille muut tiedot paitsi salasana
      var userinfo = {username: user.username, name: user.name, email: user.email, id: user.id, master: user.master};
      return res.status(200).send(userinfo);
    });
  })(req, res);
};

// Kirjaa käyttäjän ulos. Kutsutaan rekyyli.js:n GET /logout-polussa
var logout = function(req, res){
  console.log('Käyttäjä '+req.user.username+' kirjattu ulos');
  req.logout();
  res.sendStatus(200);
};

// Tarkistaa että käyttäjä on autentikoitunut ja omaa master-roolin. Käytetään apipyyntöjen yhteydessä
var requireMasterUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    if( req.user.master ){
      console.log("Autentikoitu master-käyttäjä "+req.user.username);
      return next();
    }
    // Forbidden, ei riitä oikeudet
    res.sendStatus(403);
    return;
  }
  console.log("Käyttäjä ei ole kirjautunut");
  res.sendStatus(401);
};

// Tarkistaa että käyttäjä on autentikoitunut. Käytetään apipyyntöjen yhteydessä
var requireAuthentication = function(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("Autentikoitu käyttäjä "+req.user.username);
    return next();
  }
  console.log("Käyttäjä ei ole kirjautunut");
  res.sendStatus(401);
};