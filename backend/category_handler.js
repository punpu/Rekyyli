//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 16.11.2014

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

var dbHandler;
var appHandler;
//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function( dbh, aph ){
  dbHandler = dbh;
  appHandler = aph;
  this.categoriesInitialize = categoriesInitialize;
  this.categoryList = categoryList;
  this.defaultCategory = defaultCategory;
  this.categoryCreateNew = categoryCreateNew;
  this.categoryDelete = categoryDelete;
  this.categorycategoryId = categoryId;
};


//Alustetaan kirjastoja
var _ = require('underscore');

// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';

var categoriesInitialize = function(){
	dbHandler.Category.forge()
		.fetchAll()
		.then(function(collection){

			//Luodaan taulukko ja tyrkitään sinne tietokannasta löytyviä kategorioita
			var current_categories = [];
			_.each( collection.toJSON(), function(applic){
				current_categories.push(applic.category.toLowerCase());
			});

			//Käydään läpi kaikki konffi tiedostossa määritellyt oletuskategoriat.
			//Jos joku niistä puuttuu tietokannasta niin se lisätään sinne.
			_.each( dbHandler.config.default_categories, function(d_category){
				if( ! _.contains(current_categories, d_category.toLowerCase()) ){
					categoryCreateNew(d_category, function(){
						console.log('Tietokantaan lisätty oletuskategoria: '+d_category);
					});
				}
			});
		})
		.catch( function(err){ //Virheen käsittely
			console.error('categoriesInitialize : '+fetch_error);
			console.error(err);
		});
};

//Funktio hakee kaikki käytössä olevat hakemusten kategoriat tietokannasta. 
//Kategoriat listataan JSON muodossa ja välitetään calllback funktiolle parametrina.
var categoryList = function(callback){
	dbHandler.Category.forge()
	.fetchAll()
	.then(function(collection){
		callback(200, collection.toJSON());
	})
	.catch( function(err){ //Virheen käsittely
		console.error('categoryList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};

//Funtio laittaa callback funktiolle truen tai falsen sen mukaan onko annettu
//kategoriaid oletuskategoria vai ei.
var defaultCategory = function(id, callback){
	categoryList(function(status_code, list){
		var default_category = false;

		var category = _.find(list, function(cat){
			return cat.id == id;
		});

		if(!category){
			console.log('defaultCategory: Kategoria id:tä '+id+' ei löydy järjestelmästä.');
			return callback(false);
		}

		_.each( dbHandler.config.default_categories, function(d_category){
				if( category.category == d_category) default_category = true;
			});

		callback(default_category);
	});
};

//Funktio luo uuden kategorian hakemuksia varten. Tallennetaan funktio myös muuttiujaan
//jotta sitä voidaan käyttää myös tämän tiedoston sisällä.
var categoryCreateNew = function(new_category, callback){
	dbHandler.Category.forge({category: new_category})
		.save()
		.then(function(){
			console.log('Uusi kategoria '+new_category+' tallennettu.');
			callback(200);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('categoryCreateNew : '+save_error);
			console.error(err);
			callback(404);
		});
};

var categoryDelete = function(id_to_delete, callback){
	//Kopioidaan dbHandlerin vittaus paikalliseen muuttujaan 
	//jotta se näkyvyysalue laajenee myös sisempiin funktioihin.

	//Kovakoodattuja kategorioita on kolme, joten niitä ei voi poistaa.
	//Kts. database_initializer.js rivi 22
	if(id_to_delete < 4){
		console.log('Oletuskategoriaa ei voi poistaa!');
		return callback(403);
	}

	new defaultCategory(id_to_delete, function(is_default){
		if(is_default) {
			console.log('Oletuskategoriaa ei voi poistaa!');
			return callback(403);
		}

		//Mikäli jotkut hakemukset käyttävät poistettavaa kategoriaa
		//niiden kategoria palautetaan arvoon 'kategorisoimaton'
		console.log('Tarkistetaan löytyykö poistettavaa kategoriaa hakemuksista.');

		appHandler.applicationResetCategory(id_to_delete, function(){

			//Id:n perusteella kategoria saadaan poistettua
			dbHandler.Category.forge()
				.where({id: id_to_delete})
				.destroy()
				.then(function(){
					console.log('Kategoria id '+id_to_delete+' poistettu.');
					callback(200);
				})
				.catch( function(err){ //Virheen käsittely
					console.error('categoryDelete : '+delete_error);
					console.error(err);
					callback(404);
				});
		});
	});
};

//Funktio palauttaa tekstimuotoista kategorianimeä vastaavan kategoria id:n
var categoryId = function(category, callback){
	categoryList(function(status_code, result){
		if(status_code == 200){
			var wanted = _.find(result, function(single_category){ 
				return single_category.category == category;
			});

			if(!wanted){
				return callback(null);
			}

			callback(wanted.id);
		}
	});
};