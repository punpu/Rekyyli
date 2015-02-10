//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 02.01.2015

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//ja funktiot. 
exports.dbHandler = function(){

	//Jäsenmuuttujat
	this.config = cfg;
	this.Application = application;
	this.Attachment = attachment;
	this.Category = category;
	this.Applicationtag = applicationtag;
	this.Tag = tag;
	this.Note = note;
	this.Job = job;
	this.MailTemplate = mailtemplate;
	this.User = user;
	this.knex = knex;

};


var cfg = require('../config');

var knex = require('knex')({
		client: 'pg',
		connection: {
			host: cfg.database.address,
			port: cfg.database.port,
			user: cfg.database.username,
			password: cfg.database.password,
			database: cfg.database.default_database,
			charset: 'utf8'
		}
	});

var bookshelf = require('bookshelf')(knex);

var application = bookshelf.Model.extend({
	tableName: 'applications',
	attachments: function() {
		return this.hasMany(attachment);
	},
	notes: function() {
		return this.hasMany(note);
	},
	tags: function() {
		return this.hasMany(applicationtag);
	},
	category: function() {
		return this.belongsTo(category);
	}
});


var category = bookshelf.Model.extend({
	tableName: 'categories',
	application: function() {
		return this.hasMany(application);
	}
});


var attachment = bookshelf.Model.extend({
	tableName: 'attachments',
});


var tag = bookshelf.Model.extend({
	tableName: 'tags',
	applicationtag: function() {
		return this.hasMany(applicationtag);
	}
});

var applicationtag = bookshelf.Model.extend({
	tableName: 'applicationtags',
	application: function() {
		return this.belongsTo(application);
	}
});


var note = bookshelf.Model.extend({
	tableName: 'notes',
	application: function() {
		return this.belongsTo(application);
	}
});

var mailtemplate = bookshelf.Model.extend({
	tableName: 'mailtemplates'
});

var job = bookshelf.Model.extend({
	tableName: 'jobs'
});

var user = bookshelf.Model.extend({
	tableName: 'users'
});