//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 07.12.2014

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

var dbHandler;
//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function(dbh){
	dbHandler = dbh;
	this.jobList = jobList;
	this.jobCreateNew = jobCreateNew;
	this.jobAutoreply = jobAutoreply;
	this.jobAlias = jobAlias;
};

//Alustetaan kirjastoja
var _ = require('underscore');

// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';


var jobList = function(callback){
	dbHandler.Job.forge()
	.fetchAll()
	.then(function(collection){
		//Luodaan result taulukko ja tyrkitään sinne email vastauksia JSON muodossa
		var result = [];
		_.each( collection.toJSON(), function(job){
			result.push(job);
		});

		callback(200,result);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('jobList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};


var jobCreateNew = function(req_body, callback){
	dbHandler.Job.forge({email: req_body.email, alias: req_body.alias})
	.save()
	.then(function(){
		console.log('Uusi pesti tallennettu.');
		callback(200);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('job Create : '+save_error);
		console.error(err);
		callback(404);
	});
};


var jobAlias = function(job_id, new_alias, callback){
	dbHandler.Job.forge({id: job_id})
	.fetch()
	.then(function(job){
		if(!job){
			console.log('Pestiä ei löytynyt id:llä '+job_id);
			return callback(404);
		}

		job.save({alias: new_alias},{patch: true})
		.then(function(){
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('jobAlias : '+save_error);
			console.error(err);
			callback(404);
		});
	});
};


var jobAutoreply = function(job_id, new_autoreply, callback){
	dbHandler.Job.forge({id: job_id})
	.fetch()
	.then(function(job){
		if(!job){
			console.log('Pestiä ei löytynyt id:llä '+job_id);
			return callback(404);
		}

		job.save({autoreply: new_autoreply},{patch: true})
		.then(function(){
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('jobAutoreply : '+save_error);
			console.error(err);
			callback(404);
		});
	})
	.catch( function(err){ //Virheen käsittely
		console.error('jobAutoreply : '+save_error);
		console.error(err);
		callback(404);
	});
};

var jobDelete = function(req_body, callback){
	dbHandler.Job.forge({email: req_body.email, alias: req_body.alias})
	.save()
	.then(function(){
		console.log('Uusi pesti tallennettu.');
		callback(200);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('job Create : '+save_error);
		console.error(err);
		callback(404);
	});
};