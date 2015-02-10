//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 14.01.2015, Heikki Känä 28.10.2014

// Kielletään epämääräisen syntaksin käyttö:
'use strict';

var _ = require('underscore');
var dbHandler;
var appHandler;

//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function( dbh, aph ){
  dbHandler = dbh;
  appHandler = aph;
  this.noteList = noteList;
  this.noteCreateNew = noteCreateNew;
  this.noteModify = noteModify;
  this.noteDelete = noteDelete;
};


// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';


//Funktio hakee tietokannasta kaikki tietyn hakemuksen kommentit.
var noteList = function(app_id,callback){

	dbHandler.Note.forge()
	.query({where: {application_id: app_id}})
	.fetchAll()
	.then(function(notes){

		callback(200, notes);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('noteList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};


//Funktio luo uuden kommentint tiettyä hakemuksia varten.
var noteCreateNew = function(app_id, body, callback){
	appHandler.applicationExists(app_id, function(exists){
		if(!exists){
			console.log('noteCreateNew: Virhe! Hakemusta ei löydy id numerolla '+app_id);
			return callback(404);
		}
		else{
			dbHandler.Note.forge({application_id: app_id, body: body.note, writer:body.user })
			.save()
			.then(function(){
				callback(200);
			})
			.catch( function(err){ //Virheen käsittely
				console.error('noteCreateNew : '+save_error);
				console.error(err);
				callback(404);
			});
		}
	});
};


//Tallennetaan tiettyyn kommenttiin uusi sisältö
var noteModify = function(note_id, text, callback){
	dbHandler.Note.forge({id: note_id})
	.fetch()
	.then(function(current_note){
		current_note.save({body: text},{patch:true}).then(function(){
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('noteModify, noteid '+note_id+', '+save_error);
			console.error(err);
			callback(404);
		});
	})
	.catch( function(err){ //Virheen käsittely
		console.error('noteModify : '+fetch_error);
		console.error(err);
		callback(404);
	});
};


//Poistetaan tietty kommentti tietokannasta
var noteDelete = function(note_id, callback){
	dbHandler.Note.forge({id: note_id})
	.destroy()
	.then(function(){
		callback(200);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('noteCreateNew : '+delete_error);
		console.error(err);
		callback(404);
	});
};
