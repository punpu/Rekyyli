//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 6.1.2015, Tuomas Kunnamo 10.1.2015

'use strict';

var passwordHash = require('password-hash');

var dbHandler;

var _ = require('underscore');

exports.handler = function(dbh){
	dbHandler = dbh;
	this.userCreateNew = userCreateNew;
	this.verifyPassword = verifyPassword;
	this.findUserById = findUserById;
	this.deleteUser = deleteUser;
	this.userList = userList;
	this.userModifyInfo = userModifyInfo;
};

// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';


//Funktio lisää uuden käyttäjän tietokantaan.
//Ottaa sisään json tietueen, jossa
//username, password, master(true/false), name ja email
//Huom. käyttäjätunnuksia voi luoda lisää routes.js tiedoston avulla
//jonka lopussa ohjeet.
var userCreateNew = function(user_info, callback){
	var hashedPW = passwordHash.generate(user_info.password);

	dbHandler.User.forge({username: user_info.username, 
												hashedpassword: hashedPW, 
												master: user_info.is_master,
												name: user_info.name,
												email: user_info.email })
		.save()
		.then(function(){
			console.log('Käyttäjätunnus luotu onnistuneesti.');
			callback(201);
		})
		.catch(function(err){
			console.log(err);
			callback(500);
		});
};

// Muokattu: Tuomas Kunnamo 4.1.2015
// Funktio tarkistaa käyttäjätunnuksen olemassaolon sekä salasanan kelvollisuuden
// Palauttaa
var verifyPassword = function(uname, pword, callback){
	dbHandler.User.forge({username: uname})
		.fetch()
		.then(function(user){
			if(!user) {
				console.log('verifyPassword: Käyttäjätunnusta ei löytynyt.');
				callback(null, null, false);
				return;
			}

			user = user.toJSON();
			var pw_match = passwordHash.verify(pword, user.hashedpassword);
			callback(null, user, pw_match);
		})
		.catch(function(err){
			console.log(err);
			callback(err);
		});
};


//Funktio vaihtaa tietylle käyttäjälle uuden salasanan.
var changePassword = function(userid, new_password){
	var hashedPW = passwordHash.generate(new_password);

	dbHandler.User.forge({id: userid})
		.fetch()
		.then(function(user){
			user.save({hashedpassword: hashedPW},{patch: true})
				.then(function(){
					console.log('Salasana vaihdettu.');
				})
				.catch(function(err){
					console.log(err);
				});
		})
		.catch(function(err){
			console.log(err);
		});
};


// Funktio etsii käyttäjän id:llä
var findUserById = function(userid, callback){

	dbHandler.User.forge({id: userid})
		.fetch()
		.then(function(user){
			user = user.toJSON();
			console.log('user_handler: findUserById löysi käyttäjän ' + user.username);
			callback(null, user);
		})
		.catch(function(err){
			console.log('user_handler, findUserById: tietokantalukuvirhe');
			console.log(err);
			callback(err);
		});
};

var deleteUser = function(userid, callback){
	dbHandler.User.forge({id: userid})
		.destroy()
		.then(function(){
			console.log('Käyttäjä poistettu.');
			callback(200);
		})
		.catch(function(err){
			console.log(err);
			callback(404);
		});
};

// Hakee kaikki käyttäjät tietokannasta ja palauttaa ne JSONina callbackille
var userList = function(callback){
	dbHandler.User.forge()
	.fetchAll()
	.then(function(collection){

		var userlist = collection.toJSON();
		// Poistetaan listasta käyttäjien salasanat, jotta niitä ei lähetetä frontille
		_.each(userlist, function(item, index, list){
			list[index] = _.omit(item, 'hashedpassword');
		});
		callback(200, userlist);
	})
	.catch( function(err){ //Virheen käsittely
		console.error('userList : '+fetch_error);
		console.error(err);
		callback(404, null);
	});
};

// Muuttaa käyttäjän tietoja
var userModifyInfo = function(user_id, new_info, callback){

	dbHandler.User.forge({id: user_id})
	.fetch()
	.then(function(user){
		if( ! user ){
			console.error('userModifyInfo : Käyttäjää id:llä '+user_id+' ei löytynyt.');
			callback(404);
		}
		else {
			// Jos pyynnössä on mukana uusi salasana, niin muutetaan se erikseen
			if( new_info.password ){
				changePassword( user_id, new_info.password );
			}

			user.save( {username: new_info.username, name: new_info.name, 
						email: new_info.email, master: new_info.master}, {patch: true})
			.then(function(){
				callback(200);
			})
			.catch( function(err){ //Virheen käsittely
				console.error('userModifyInfo : '+save_error);
				console.error(err);
				callback(500);
			});
		}
	}).catch( function(err){ //Virheen käsittely
		console.error('userModifyInfo : '+fetch_error);
		console.error(err);
		callback(404);
	});
};

