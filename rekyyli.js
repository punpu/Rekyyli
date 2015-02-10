//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 02.01.2015, Tuomas Kunnamo 10.1.2015

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

//Alustetaan moduulit
var express = require('express');
var app = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var stylus = require('stylus');
var routes = require('./routes');
var auth_handler = require('./backend/auth_handler').handler;
var auth = new auth_handler();

var cfg = require('./config');

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));

// Passportin tarvitsemat alustukset
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');

app.use(session({
  secret: cfg.passport.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: (3600 * 8 * 1000) } // session maksimipituus 8 tuntia millisekunteina
}))

app.use(auth.passport.initialize());
app.use(auth.passport.session());


// Stylusta varten
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile}));
function compile(str, path) {
  return stylus(str)
    .set('filename', path);
}


//Ladataan ja käynnistetään rekyylin backend
routes.initialize();


// api -rajapinnan reititykset
// GET
app.get('/api/applications', auth.requireAuthentication, function(req,res){ routes.getApplicationList(req, res); });
app.get('/api/applications/:id', auth.requireAuthentication, function(req,res){ routes.getApplication(req, res); });
app.get('/api/applications/:id/notes', auth.requireMasterUser, function(req,res){ routes.getApplicationNotes(req, res); });
app.get('/api/applications/:id/attachments', auth.requireAuthentication, function(req, res){ routes.getAttachmentList(req,res); });
app.get('/api/applications/:id/attachments/:hash', auth.requireAuthentication, function(req,res){ routes.getAttachment(req, res); });

app.get('/api/categories', auth.requireAuthentication, function(req,res){ routes.getCategoryList(req, res); });

app.get('/api/mailtemplates', auth.requireMasterUser, function(req, res){ routes.getMailtemplateList(req, res); });

app.get('/api/tags', auth.requireAuthentication, function(req, res){ routes.getTagList(req, res); });

app.get('/api/jobs', auth.requireMasterUser, function(req, res){ routes.getJobList(req, res); });

app.get('/api/users', auth.requireMasterUser, function(req, res){ routes.getUserList(req, res); });

// POST
app.post('/api/applications', auth.requireAuthentication, function(req,res){ routes.postApplicationSearch(req, res); });
app.post('/api/applications/:id/notes', auth.requireMasterUser, function(req,res){ routes.postApplicationNote(req, res); });
app.post('/api/applications/:id/notes/:noteid', auth.requireMasterUser, function(req,res){ routes.postApplicationNote(req, res); });
app.post('/api/applications/:id/tags', auth.requireMasterUser, function(req,res){ routes.postApplicationTag(req, res); });
app.post('/api/applications/:id/category', auth.requireMasterUser, function(req,res){ routes.postApplicationsCategory(req, res); });
app.post('/api/applications/:id/job', auth.requireMasterUser, function(req,res){ routes.postApplicationsJob(req, res); });
app.post('/api/applications/:id/info', auth.requireMasterUser, function(req,res){ routes.postApplicationSenderAndName(req, res); });
app.post('/api/applications/category/', auth.requireMasterUser, function(req,res){ routes.postApplicationsCategory(req, res); });

app.post('/api/categories', auth.requireMasterUser, function(req,res){ routes.postCategory(req,res); });
app.post('/api/categories/:id', auth.requireMasterUser, function(req,res){ routes.postCategory(req,res); });

app.post('/api/mailtemplates', auth.requireMasterUser, function(req, res){ routes.postMailtemplate(req, res); });
app.post('/api/mailtemplates/:id', auth.requireMasterUser, function(req, res){ routes.postMailtemplate(req, res); });

app.post('/api/sendmail', auth.requireMasterUser, function(req, res){ routes.postSendMail(req, res); });

app.post('/api/tags', auth.requireMasterUser, function(req, res){ routes.postTag(req, res); });
app.post('/api/tags/:id', auth.requireMasterUser, function(req, res){ routes.postTag(req, res); });

app.post('/api/jobs', auth.requireMasterUser, function(req, res){ routes.postJob(req, res); });
app.post('/api/jobs/:jobid/alias', auth.requireMasterUser, function(req, res){ routes.postJobAlias(req, res); });
app.post('/api/jobs/:jobid/autoreply', auth.requireMasterUser, function(req, res){ routes.postJobAutoreply(req, res); });

app.post('/api/users', auth.requireMasterUser, function(req, res){ routes.postUser(req, res); });
app.post('/api/users/:id', auth.requireMasterUser, function(req, res){ routes.postUserModifyInfo(req, res); });

// DELETE
app.delete('/api/applications', auth.requireMasterUser, function(req,res){ routes.deleteApplications(req, res); });
app.delete('/api/applications/:id', auth.requireMasterUser, function(req,res){ routes.deleteApplications(req, res); });
app.delete('/api/applications/:id/notes/:noteid', auth.requireMasterUser, function(req,res){ routes.deleteApplicationNote(req, res); });
app.delete('/api/applications/:id/tags/:tagtext', auth.requireMasterUser, function(req,res){ routes.deleteApplicationTag(req, res); });

app.delete('/api/categories/:id', auth.requireMasterUser, function(req,res){ routes.deleteCategory(req,res); });

app.delete('/api/mailtemplates/:id', auth.requireMasterUser, function(req, res){ routes.deleteMailtemplate(req, res); });

app.delete('/api/tags/:id', auth.requireMasterUser, function(req, res){ routes.deleteTag(req, res); });

app.delete('/api/jobs', auth.requireMasterUser, function(req, res){ routes.deleteJob(req, res); });
app.delete('/api/jobs/:jobid/alias', auth.requireMasterUser, function(req, res){ routes.deleteJobAlias(req, res); });
app.delete('/api/jobs/:jobid/autoreply', auth.requireMasterUser, function(req, res){ routes.deleteJobAutoreply(req, res); });

app.delete('/api/users/:id', auth.requireMasterUser, function(req,res){ routes.deleteUser(req,res); });

app.post('/api/login', function(req, res, next){
    auth.login(req, res, next);
});

app.get('/api/logout', function(req, res, next){
    auth.logout(req, res);
});

// Frontti tarkistaa tämän avulla, onko kirjautumissessio olemassa.
app.get('/api/checksession', auth.requireAuthentication, function(req, res, next){
    // Lähetetään käyttäjädata, mutta ei salasanaa
    var userinfo = {username: req.user.username, name: req.user.name, email: req.user.email, id: req.user.id, master: req.user.master};
    res.status(200).send(userinfo);
});

// Mikko 8.10.2014
// Kaikillä juurihauilla lähetetään perusnäkymä
app.get('*', function(req, res) {
  res.sendFile('public/index.html', { root: path.join(__dirname) });
});


// Heikki 14.12.2014
// Exportataan sovellus, jotta voidaan ajaa ulkopuolelta
module.exports = app;