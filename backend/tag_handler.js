//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 25.11.2014

// Kielletään epämääräisen syntaksin käyttö:
'use strict';

var dbHandler;
//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function( dbh ){
  dbHandler = dbh;
  this.tagId = tagId;
  this.tagList = tagList;
  this.tagCreateNew = tagCreateNew;
  this.tagDelete = tagDelete;
  this.applicationAddTag = applicationAddTag;
};


// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';


var tagList = function(callback){
	dbHandler.Tag.forge()
	.fetchAll()
	.then(function(tags){
		callback(200, tags.toJSON());
	})
	.catch( function(err){ //Virheen käsittely
		console.error('tagList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};

//Apufunktio joka palauttaa tekstinä saamansa tagin tag_id numeron.
//Mikäli tagia ei löydy järjestelmästä, palautuu statuskoodi 403.
//Funktion palauttamien statuskoodien avulla voidaan myös selvittää
//löytyykö tiettyä tagia järjestelmästä.
var tagId = function(tag_text, callback){
	tagList(function(status_code, list){
		for(var i=0; i < list.length; ++i){
			if(list[i].body === tag_text) return callback(list[i].id);
		}

		//Jos tagi ei täsmää yhteenkään tagilistan tagiin
		callback(null);
	});
};


//Funktio luo uuden tagin tiettyä hakemuksia varten. 
//Mikäli funktiolle syötetään tagi, joka on jo järjestelmässä
//sitä ei lisätä uudelleen eikä funktio ilmoita virheestä.
//Uuden tai järjestelmästä löydetyn tagin id laitetaan 
//callback-funktiolle toisena parametrina.
var tagCreateNew = function(new_tag, callback){

	tagId(new_tag, function(tag_id){
		//Jos tagId funktio palautta tag_id arvon
		//tagi löytyy jo järjestelmästä ja voidaan lopettaa tähän.
		if(tag_id) return callback(200, tag_id);

		//Muussa tapauksessa luodaan uusi tagi järjestelmään.
		dbHandler.Tag.forge({body: new_tag})
		.save()
		.then(function(created_tag){
			console.log('tagCreateNew: Uusi tagi lisätty järjestelmään.');
			callback(200, created_tag.id);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('tagCreateNew : '+save_error);
			console.error(err);
			callback(404);
		});
	});		
};


//Poistetaan tietty tagi tietokannasta
var tagDelete = function(tag_id, callback){
	dbHandler.Tag.forge({id: tag_id})
	.destroy()
	.then(function(){
		callback(200);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('tagCreateNew : '+delete_error);
		console.error(err);
		callback(404);
	});
};


//Funktio lisää hakemuksen tietoihin uuden tagin. Mikäli tagia ei löydy järjestelmästä,
//se lisätään ensin järjestelmän tagin listaan ja sitten hakemukseen.
var applicationAddTag = function(app_id, tag_text, callback){

	//tagCreateNew luo uuden tagin tai palauttaa olemassaolevan tagin tag_id:n
	tagCreateNew(tag_text, function(status_code, new_tag_id){
		if(status_code != 200) return callback(status_code);

		else dbHandler.Applicationtag.forge({application_id: app_id, tag_id: new_tag_id})
			.save()
			.then(function(){
				callback(200);
			})
			.catch( function(err){ //Virheen käsittely
				console.error('applicationAddTag : '+save_error);
				console.error(err);
				callback(404);
			});
	});
};