//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 25.11.2014

//Tämä tiedosto alustaa postgresql tietokantaan Rekyyli sovelluksen tarvitsemat tietokantataulut.
//Tietokantaan yhdistetään config.js tiedoston parametreilla. Postgressissa pitää olla luotuna
//config.js tiedostoon syötettävä oletustietokanta, johon taulut luodaan.


'use strict';

var config = require('./config');

var pg = require('pg');
var conString = 'postgres://'+config.database.username+':'+config.database.password+'@'+config.database.address+':'+config.database.port+'/'+config.database.default_database;

//CATEGORIES(@id, body)
var create_categories = 
	'CREATE TABLE categories('+
		'id serial primary key NOT NULL,'+
		'category text NOT NULL UNIQUE);';

var insert_categories = "INSERT INTO categories(category) VALUES ('Uusi'), ('Kategorisoimaton'), ('Poistettu');";

//APPLICATIONS(@id, timestamp, replysent, category_id, destination, sender, name, subject, body)
var create_applications = 
	'CREATE TABLE applications('+
		'id serial primary key NOT NULL,'+
		'timestamp timestamp DEFAULT now(),'+
		'replysent boolean NOT NULL DEFAULT false,'+
		'category_id integer NOT NULL DEFAULT 1 REFERENCES categories(id) ON DELETE NO ACTION ON UPDATE CASCADE,'+
		'destination text NOT NULL REFERENCES jobs(email) ON DELETE NO ACTION ON UPDATE CASCADE,'+
		'sender text NOT NULL,'+
		'name text NOT NULL,'+
		'subject text,'+
		'body text);';

//ATTACHMENTS(@id, timestamp, hash, body, filename, filetype, application_id)
var create_attachments = 
	'CREATE TABLE attachments('+
		'id serial primary key NOT NULL,'+
		'hash text NOT NULL,'+
		'body bytea NOT NULL,'+
		'filename text NOT NULL,'+
		'filetype text NOT NULL,'+
		'application_id int NOT NULL REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE);';

//TAGS(@id, body)			
var create_tags =
	'CREATE TABLE tags('+
		'id serial primary key NOT NULL,'+
		'body text NOT NULL UNIQUE);';

//APPLICATIONTAGS(@id, application_id->APPLICATIONS, tag_id->TAGS)
var create_applicationtags =
	'CREATE TABLE applicationtags('+
		'id serial primary key NOT NULL,'+
		'application_id int NOT NULL REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,'+
		'tag_id int NOT NULL REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE,'+
    'UNIQUE(application_id, tag_id) );';

//NOTES(@id, timestamp, application_id, body)
var create_notes =
	'CREATE TABLE notes('+
		'id serial primary key NOT NULL,'+
		'timestamp timestamp DEFAULT now(),'+
		'writer text NOT NULL,'+
		'application_id int NOT NULL REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,'+
		'body text);';

//MAILTEMPLATES(@id, body, title, subject)
var create_mailtemplates =
	'CREATE TABLE mailtemplates('+
		'id serial primary key NOT NULL,'+
		'body text NOT NULL,'+
		'subject text NOT NULL,'+
		'title text NOT NULL);';

var create_jobs =
	'CREATE TABLE jobs('+
		'id serial primary key UNIQUE NOT NULL,'+
		'email text UNIQUE NOT NULL,'+
		'alias text UNIQUE,'+
		'autoreply text);';

var create_users = 
	'CREATE TABLE users('+
		'id serial primary key UNIQUE NOT NULL,'+
		'username text UNIQUE NOT NULL,'+
		'hashedpassword text NOT NULL,'+
		'name text,'+
		'email text,'+
		'master boolean NOT NULL DEFAULT false);';

//Poistetaan samannimiset tietokantataulut, jos sellaisia löytyy.
//Lisätään uudet taulut. Jokaisessa luonnissa virheentarkistus.
pg.connect(conString, function(err, client) {
	if(err) return console.error('Error: tietokantaan ei saatu yhteyttä \n', err);

	client.query('DROP TABLE IF EXISTS applications, applicationtags,'+ 
																		 'attachments, categories,'+ 
																		 'tags, mailtemplates, notes, jobs, users CASCADE;', function(err){
		if(err) return console.error(err);

		client.query(create_categories, function(err){
			if(err) return console.error(err);

			client.query(insert_categories, function(err){
				if(err) return console.error(err);

				client.query(create_jobs, function(err){
					if(err) return console.error(err);

					client.query(create_applications, function(err){
						if(err) return console.error(err);

						client.query(create_attachments, function(err){
							if(err) return console.error(err);	

							client.query(create_tags, function(err){
								if(err) return console.error(err);

								client.query(create_applicationtags, function(err){
									if(err) return console.error(err);

									client.query(create_notes, function(err){
										if(err) return console.error(err);

										client.query(create_mailtemplates, function(err){
											if(err) return console.error(err);

											client.query(create_users, function(err){
												if(err) return console.error(err);

												console.log('Tietokanta alustettu.');
												client.end();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
