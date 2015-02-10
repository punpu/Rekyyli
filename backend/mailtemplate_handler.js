//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 16.11.2014, Heikki Känä 3.12.2014

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
  this.mailtemplateCreateNew = mailtemplateCreateNew;
  this.mailtemplateList = mailtemplateList;
  this.mailtemplateDelete = mailtemplateDelete;
  this.mailtemplateModify = mailtemplateModify;
};


//Alustetaan kirjastoja
var _ = require('underscore');


// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';


// Heikki 3.12.2014: Otetaan parametrina koko body-olio, lisätty subject
var mailtemplateCreateNew = function(req_body, callback){
	dbHandler.MailTemplate.forge({body: req_body.mailtemplate, title: req_body.title, subject: req_body.subject})
	.save()
	.then(function(){
		console.log('Uusi sähköpostipohja tallennettu.');
		callback(200);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('mailtemplateCreate : '+save_error);
		console.error(err);
		callback(404);
	});
};

var mailtemplateList = function(callback){
	dbHandler.MailTemplate.forge()
	.fetchAll()
	.then(function(collection){
		//Luodaan result taulukko ja tyrkitään sinne email vastauksia JSON muodossa
		var result = [];
		_.each( collection.toJSON(), function(email_res){
			result.push(email_res);
		});

		callback(200,result);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('mailtemplateList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};

// Heikki 28.10.2014: Muutettu nyt vielä käyttämään headeria, jotta pääsee kokeilemaan
var mailtemplateDelete = function(id_to_delete, callback){
	dbHandler.MailTemplate.forge()
		.where({id: id_to_delete})
		.destroy()
		.then(function(){
			console.log('Email vastaus id:llä '+id_to_delete+' poistettu.');
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('mailtemplateDelete : '+delete_error);
			console.error(err);
		callback(404);
	});
};

// Heikki 3.12.2014: Muutettu HTTP-bodyn nimi req_bodyksi, lisätty subject
var mailtemplateModify = function(template_id, req_body, callback){
	dbHandler.MailTemplate.forge({title: req_body.title, body: req_body.mailtemplate, subject: req_body.subject})
		.where({id: template_id})
		.save([], {method: 'update'})
		.then(function(){
			console.log('Sähköpostivastauksen '+req_body.title+' muutokset tallennettu.');
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('mailtemplateList : '+save_error);
			console.error(err);
		callback(404);
	});
};
