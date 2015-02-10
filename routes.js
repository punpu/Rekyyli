//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 12.01.2015, Heikki Känä 8.12.2014, Tuomas Kunnamo 10.1.2015

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

//Luodaan yhteinen dbHandler olio, jossa on yhtenäiset bookshelf
//alustukset tietokannan käsittelyä varten. Tämä on välitettävä
//parametrina handlereita alustettaes
var dbh = require('./backend/db_handler').dbHandler;
var dbHandler = new dbh();

var aph = require('./backend/application_handler').handler;
var applicationHandler = new aph( dbHandler );

var nth = require('./backend/note_handler').handler;
var noteHandler = new nth(dbHandler,applicationHandler);

var emh = require('./backend/email_handler').handler;
var emailHandler = new emh(dbHandler,applicationHandler, noteHandler);

var cgh = require('./backend/category_handler').handler;
var categoryHandler = new cgh(dbHandler,applicationHandler);

var mth = require('./backend/mailtemplate_handler').handler;
var mailtemplateHandler = new mth(dbHandler);

var tgh = require('./backend/tag_handler').handler;
var tagHandler = new tgh(dbHandler,applicationHandler);

var jobh = require('./backend/job_handler').handler;
var jobHandler = new jobh(dbHandler);

var ush = require('./backend/user_handler').handler;
var userHandler = new ush(dbHandler);

var fs = require('fs');
var _ = require('underscore');

//Tämä funktio suoritetaan aina ohjelman käynnistyessä
exports.initialize = function(){
	categoryHandler.categoriesInitialize();

	var mailListener = emailHandler.imapMailListener;
	mailListener.start();

	

	applicationHandler.countApplications(function(amount){
		console.log('Hakemuksia tietokannassa: '+amount);
	});
	applicationHandler.countAttachments(function(amount){
		console.log('Liitteitä tietokannassa: '+amount);
	});
};


//Apufunktio jonka avulla tietokannasta haettu hakemuslista
//renderöidään halutun näköiseksi ennen sen lähetystä frontille.
//Funktio muutta kategorian ja tagit tekstimuotoiseksi, sekä
//siivoaa bookshelfin jättämät vierasavaimet attachments ja tags
//taulukoista.
var applicationRender = function(app_list, callback){
	categoryHandler.categoryList(
		function(status_code, cat_list){
			if(status_code !== 200){
				console.log('Routes: Ongelmia kategorialistan hakemisessa.');
				return callback(null);
			}
			tagHandler.tagList(
				function(status_code, tag_list){
					if(status_code !== 200){
						console.log('Routes: Ongelmia tagilistan hakemisessa.');
						return callback(null);
					}
						jobHandler.jobList(
							function(status_code, job_list){
								if(status_code !== 200){
									console.log('Routes: Ongelmia pestilistan hakemisessa.');
									return callback(null);
								}

								//Muokataan palautettava hakemuslista halutun näköiseksi
								_.each(app_list, function(app){

									//Bookshelf palautta vierasavaimen kohteestä sekä vierasavaimen,
									//että halutun sarakkeen.
									//Tallennetaan palautettavaan hakemukseen pelkkä haluttu sarake,
									//eli liitteen tapauksessa hash ja tagin tapauksessa tag_id.
									//Koska tageja saattaa olla useampi on ne käytävä toisessa
									//silmukassa läpi
									for(var i = 0; i < app.attachments.length; ++i){
										app.attachments[i] = app.attachments[i].hash;
									}
									for(i = 0; i < app.tags.length; ++i){
										for(var j = 0; j < tag_list.length; ++j){
											if(app.tags[i].tag_id === tag_list[j].id){
												app.tags[i] = tag_list[j].body;
											}
										}
									}

									//Lisätään hakemukseen myös kategoria tekstimuotoisena
				          _.each(cat_list, function(list_category){
								    if( app.category_id === list_category.id){
										  app.category = list_category.category;
										}
									});

				          //Lisätään hakemukseen job_alias kenttä pestin aliasta varten
									_.each(job_list, function(list_job){
										if( app.destination == list_job.email){
											app.job_alias = list_job.alias;
										}
									});
								});

								callback(app_list);
					});
			});
	});
};


// GET
exports.getApplicationList = function(req, res){
	applicationHandler.applicationList(req.query, null,
		function(status_code, app_list, amount){
			if(status_code !== 200){
				res.sendStatus(status_code);
				return console.log('Routes: Hakemuslistan lähetyksessä ongelmia. (applist)');
			}

			applicationRender(app_list, function(parsed_list){
				if(!parsed_list) return res.sendStatus(500);

				res.status(200).send({"amount":amount, "list":parsed_list});
				console.log('Routes: Hakemuslista lähetetty.');
			});
	});
};

exports.getApplication = function(req, res){
	applicationHandler.applicationFetch( req.params.id,
		function(status_code, application){
			if(status_code !== 200){
				res.sendStatus(status_code);
				return console.log('Routes: Hakemuksen lähetyksessä ongelmia. (applicationFetch)');
			}

			applicationRender([application], function(parsed_list){
				if(!parsed_list) return res.sendStatus(500);

				res.status(200).send(parsed_list[0]);
				console.log('Routes: Hakemuksen tiedot lähetetty.');
			});
	});
};


exports.getApplicationNotes = function(req, res){
	if(req.params.noteid){

	}
	else{
		noteHandler.noteList( req.params.id,
			function(status_code, list){
				res.status(status_code).send(list);
				if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' kommentit lähetetty.');
				else console.log('Routes: Hakemuksen '+req.params.id+' kommenttien lähetyksessä ongelmia.');
			});
	}
};

exports.getAttachmentList = function(req, res){
	applicationHandler.attachmentList( req.params.id,
		function(status_code, list) {
				res.status(status_code).send(list);
				if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' liitelista lähetetty.');
				else console.log('Routes: Hakemuksen '+req.params.id+' liitelistan lähetyksessä ongelmia.');
			});
};

exports.getAttachment = function(req, res){
	applicationHandler.attachmentFetch( req.params.hash, req.params.id,
		function(status_code, filetype) {
			if(status_code === 200){
				res.status(status_code).sendFile(__dirname+'/attachments/'+req.params.hash+'.'+filetype,function(){
					fs.unlink(__dirname+'/attachments/'+req.params.hash+'.'+filetype);
					console.log('Routes: Hakemuksen '+req.params.id+' liitetiedosto lähetetty.');
				});
			}
			else{
				res.sendStatus(status_code);
				console.log('Routes: Ongelmia hakemuksen'+req.params.id+' liitetiedoston lähetyksessä.');
			}
		});
};

exports.getCategoryList = function(req, res){
	categoryHandler.categoryList(
		function(status_code, list){
			res.status(status_code).send(list);
			if(status_code === 200) console.log('Routes: Kategorialista lähetetty.');
			else console.log('Routes: Kategorialistan lähetyksessä ongelmia.');
		});
};

exports.getMailtemplateList = function(req, res){
	mailtemplateHandler.mailtemplateList(
		function(status_code, list){
			res.status(status_code).send(list);
			if(status_code === 200) console.log('Routes: Lista sähköpostipohjista lähetetty.');
			else console.log('Routes: Sähköpostipohjalistan lähetyksessä ongelmia.');
		});
};

exports.getTagList = function(req, res){
	tagHandler.tagList(
		function(status_code, list){
			res.status(status_code).send(list);
			if(status_code === 200) console.log('Routes: Lista tageista lähetetty.');
			else console.log('Routes: Tagilistan lähetyksessä ongelmia.');
		});
};

exports.getJobList = function(req, res){
	jobHandler.jobList(
		function(status_code, list){
			res.status(status_code).send(list);
			if(status_code === 200) console.log('Routes: Lista pesteistä lähetetty.');
			else console.log('Routes: Pestilistan lähetyksessä ongelmia.');
		});
};

exports.getUserList = function(req, res){
	userHandler.userList(function(status_code, list){
		res.status(status_code).send(list);
		if(status_code === 200) {
			console.log('Routes: Lista käyttäjistä lähetetty.');
		}
		else {
			console.log('Routes: käyttäjälistan lähetyksessä ongelmia.');
		}
	});
};

// POST
exports.postApplicationSearch = function(req, res){

	applicationHandler.applicationList(req.query, req.body,
		function(status_code, app_list, total_amount){
			if(status_code !== 200){
				res.sendStatus(status_code);
				return console.log('Routes: Hakemusten hakemisessa ongelmia');
			}

			applicationRender(app_list, function(parsed_list){
				if(!parsed_list) return res.sendStatus(500);

				res.status(200).send({"amount":total_amount, "list":parsed_list});
				console.log('Routes: Hakemuslista lähetetty.');
			});
			

			console.log('Routes: Hakuehtojen mukainen hakemuslista lähetetty.');
	});
};

exports.postApplicationNote = function(req, res){
	if(!req.body.note)
	{
		console.log('Routes: Virhe! Pyynössä ei ole JSON tietuetta "note"');
		return res.sendStatus(400);
	}

	if(req.params.noteid){
		// To be implemented
	}
	else{
		noteHandler.noteCreateNew(  req.params.id, req.body,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Uusi kommentti lisätty hakemukselle '+req.params.id+'.');
				else console.log('Routes: Ongelmia uuden kommentin lisäämisessä hakemukselle '+req.params.id+'.');
			});
	}
};

exports.postApplicationTag = function(req, res){
	if(!req.body.tag)
	{
		console.log('Routes: Virhe! Pyynössä ei ole JSON tietuetta "tag"');
		return res.sendStatus(400);
	}

	var tag = req.body.tag.toLowerCase();

	tagHandler.applicationAddTag( req.params.id, tag,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Uusi tagi '+tag+ 'lisätty hakemukselle '+req.params.id+'.');
			else console.log('Routes: Ongelmia uuden tagin '+tag+ ' lisäämisessä hakemukselle '+req.params.id+'.');
		});
};

// Muokattu: Tuomas 31.10.2014, Joni 01.11.2014
// Vaihdoin parametriksi req.body.app_ids, jotta pelkkä id-array menisi parametrina
exports.postApplicationsCategory = function(req, res){
	if(!req.body.categoryid)
	{
		console.log('Routes: Virhe! Pyynössä ei ole JSON tietuetta "categoryid"');
		return res.sendStatus(400);
	}

	if(req.body.app_ids){
		applicationHandler.applicationSetCategory( req.body.app_ids, req.body.categoryid,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Hakemusten '+req.body.app_ids+' kategoria vaihdettu.');
				else console.log('Routes: Ongelmia kategorian vaihtamisessa hakemuksille '+req.body.app_ids+'.');
			});
	}
	else{
		applicationHandler.applicationSetCategory( [req.params.id], req.body.categoryid,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' kategoria vaihdettu.');
				else console.log('Routes: Ongelmia kategorian vaihtamisessa hakemukselle '+req.params.id+'.');
			});
	}

};

// Tehnyt: Eero Vornanen 3.1.2015
// Muokannut: Eero Vornanen 3.1.2015
exports.postApplicationsJob = function(req, res){
	if(!req.body.jobid)
	{
		console.log('Routes: Virhe! Pyynössä ei ole JSON tietuetta "jobid"');
		return res.sendStatus(400);
	}

	applicationHandler.applicationSetJob( req.params.id, req.body.jobid,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' pesti vaihdettu.');
			else console.log('Routes: Ongelmia pestin vaihtamisessa hakemukselle '+req.params.id+'.');
		});
};

exports.postCategory = function(req, res){
	console.log("Nyt ollaan routesissa");
	if(!req.body.category)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "category"');
		return res.sendStatus(400);
	}

	if(req.params.id){
		console.log('Routes: Kategorian mukkaukselle ei ole vielä toteutusta backendissä.');
		res.sendStatus(200);
		// To be implemented
	}
	else{
		categoryHandler.categoryCreateNew(  req.body.category,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Uusi kategoria lisätty.');
				else console.log('Routes: Ongelmia uuden kategorian lisäämisessä.');
			});
	}
};


exports.postMailtemplate = function(req, res){

	if(!req.body.mailtemplate)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON-tietuetta "mailtemplate"');
		return res.sendStatus(400);
	}
	if(!req.body.title)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON-tietuetta "title"');
		return res.sendStatus(400);
	}

	if(!req.body.subject)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON-tietuetta "subject"');
		return res.sendStatus(400);
	}

	// Vanhan sähköpostipohjan muokkaaminen
	if(req.params.id){
		mailtemplateHandler.mailtemplateModify( req.params.id, req.body, function(status_code) {
			res.sendStatus(status_code);
			if (status_code === 200) {
				console.log('Routes: Mailipohja muokattu.');
			}
			else {
				console.log('Routes: Mailipohjan muokkaus ei onnistunut.');
			}
		});
	}

	// Uuden sähköpostipohjan luominen
	else{
		// Heikki 3.12.2014: Annetaan parametrina koko body-olio
		mailtemplateHandler.mailtemplateCreateNew( req.body,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Uusi mailipohja lisätty.');
				else console.log('Routes: Ongelmia uuden mailipohjan lisäämisessä.');
			});
	}
};


exports.postTag = function(req, res){
	if(!req.body.tag)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "tag"');
		return res.sendStatus(400);
	}

	if(req.params.id){
		console.log('Routes: Tagin muokkaukselle ei ole vielä toteutusta backendissä.');
		res.sendStatus(200);
		// To be implemented
	}
	else{
		tagHandler.tagCreateNew( req.body.tag,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Uusi tagi lisätty.');
				else console.log('Routes: Ongelmia uuden tagin lisäämisessä.');
			});
	}
};


exports.postJob = function(req, res){
	if(!req.body.email)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "email"');
		return res.sendStatus(400);
	}

	if(!req.body.alias)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "alias"');
		return res.sendStatus(400);
	}

	if(req.params.id){
		console.log('Routes: Pestin muokkaukselle ei ole vielä toteutusta backendissä.');
		res.sendStatus(200);
		// To be implemented
	}
	else{
		jobHandler.jobCreateNew( req.body,
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Uusi pesti lisätty.');
				else console.log('Routes: Ongelmia uuden pestin lisäämisessä.');
			});
	}
};

exports.postJobAlias = function(req, res){
	if(!req.body.alias)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "alias"');
		return res.sendStatus(400);
	}

	jobHandler.jobAlias( req.params.jobid, req.body.alias,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Pestille lisätty alias.');
			else console.log('Routes: Ongelmia aliaksen lisäämisessä pestille.');
		});
};

exports.postJobAutoreply = function(req, res){
	if(!req.body.autoreply)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "autoreply"');
		return res.sendStatus(400);
	}

	jobHandler.jobAutoreply( req.params.jobid, req.body.autoreply,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Pestille lisätty automaattivastaus.');
			else console.log('Routes: Ongelmia automaattivastauksen lisäämisessä pestille.');
		});
};


// Tekijä: Tuomas
// viimeisimmät muutokset: Tuomas 5.11.2014
// Lähettää sähköpostia yhdelle tai useammalle vastaanottajalle
exports.postSendMail = function(req, res){
	if(!req.body.recipients)
	{
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "recipients"');
		return res.sendStatus(400);
	}

	if(!req.body.subject){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "subject"');
		return res.sendStatus(400);
	}

	if(!req.body.message){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "message"');
		return res.sendStatus(400);
	}
	else{
		emailHandler.sendMail( req.body, function(status){
			res.sendStatus(status);
		});
	}
};

// Tuomas 14.12.2014
// Muuttaa hakemuksen name- ja sender-kentät uusiksi
exports.postApplicationSenderAndName = function(req, res){
	if(!req.body.name){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "name"');
		return res.sendStatus(400);
	}

	if(!req.body.sender){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "sender"');
		return res.sendStatus(400);
	}
	else{
		applicationHandler.applicationSetSenderAndName( req.params.id, req.body.sender, req.body.name, function(status){
			if(status === 200){
				console.log("Routes: Hakemuksen "+req.params.id+" hakijan nimi ja sähköposti muutettu")
			}
			res.sendStatus(status);
		});
	}
};

exports.postUser = function(req, res){
	if(!req.body.username){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "username"');
		return res.sendStatus(400);
	}
	else if(!req.body.name){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "name"');
		return res.sendStatus(400);
	}
	else if(!req.body.password){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "password"');
		return res.sendStatus(400);
	}
	else if(!req.body.email){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "email"');
		return res.sendStatus(400);
	}
	else if(typeof req.body.master === 'undefined'){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "master"');
		return res.sendStatus(400);
	}
	
	else{
		userHandler.userCreateNew( {username: req.body.username,
									name: req.body.name,
									password: req.body.password,
									email: req.body.email,
									is_master: req.body.master, },
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 201) console.log('Routes: Uusi käyttäjä lisätty.');
				else console.log('Routes: Ongelmia uuden käyttäjän lisäämisessä.');
			});
	}
};

exports.postUserModifyInfo = function(req, res){
	if(!req.body.username){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "username"');
		return res.sendStatus(400);
	}
	else if(!req.body.name){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "name"');
		return res.sendStatus(400);
	}
	else if(!req.body.email){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "email"');
		return res.sendStatus(400);
	}
	else if(typeof req.body.master === 'undefined'){
		console.log('Routes: Virhe! Pyynnössä ei ole JSON tietuetta "master"');
		return res.sendStatus(400);
	}
	
	else{
		userHandler.userModifyInfo( req.params.id, 
									{username: req.body.username,
									name: req.body.name,
									password: req.body.password,
									email: req.body.email,
									master: req.body.master, },
			function(status_code){
				res.sendStatus(status_code);
				if(status_code === 200) console.log('Routes: Käyttäjän tiedot muutettu.');
				else console.log('Routes: Ongelmia käyttäjän tietojen muuttamisessa.');
			});
	}
};


// DELETE

//Hakemuksen poistaminen muuttaa sen kategoriaksi "poistettu" jonka kategoria id = 3.
//Tällöin hakemus ei näy enää hakemuslistalla ellei erikseen etsitä poistettujen kategoriasta.
exports.deleteApplications = function(req, res){	

 	var id_list;
	if(!req.params.id){
		if(!req.body.app_ids){
			console.log('Routes: Pyynnöstä ei löydy poistettavaa id:tä');
			return res.sendStatus(400); //Bad request
		}

		id_list = req.body.app_ids;
	}
	else id_list = [req.params.id];

	console.log(id_list);
	applicationHandler.applicationSetCategory( id_list, 3,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Yhden tai useamman hakemuksen kategoria vaihdettu poistetuksi.');
			else console.log('Routes: Ongelmia kategorian vaihtamisessa poistetuksi hakemukselle '+req.params.id+'.');
		});
};

exports.deleteApplicationNote = function(req, res){
	noteHandler.noteDelete(  req.params.noteid,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' kommentti poistettu.');
			else console.log('Routes: Hakemuksen '+req.params.id+' kommentin poistossa ongelmia.');
		});
};

exports.deleteApplicationTag = function(req, res){
	tagHandler.tagId(req.params.tagtext, function(tag_id){
		if(tag_id === null){
			console.log('Routes: Tagia '+req.params.tagtext+' ei löytynyt järjestelmästä');
			return res.sendStatus(403);
		}

		applicationHandler.applicationDeleteTag( req.params.id, tag_id,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Hakemuksen '+req.params.id+' tagi poistettu.');
			else console.log('Routes: Hakemuksen '+req.params.id+' tagin poistossa ongelmia.');
		});
	});	
};

exports.deleteCategory = function(req, res){
	categoryHandler.categoryDelete(  req.params.id,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Kategoria poistettu järjestelmästä.');
			else console.log('Routes: Kategorian poistossa ongelmia.');
		});
};

exports.deleteMailtemplate= function(req, res){
	mailtemplateHandler.mailtemplateDelete(  req.params.id,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Mailipohja poistettu järjestelmästä.');
			else console.log('Routes: Mailipohjan poistossa ongelmia.');
		});
};

exports.deleteTag= function(req, res){
	tagHandler.tagDelete( req.params.id,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Tagi poistettu järjestelmästä.');
			else console.log('Routes: Tagin poistossa ongelmia.');
		});
};

exports.deleteJob = function(req, res){
	jobHandler.jobDelete( req.params.id,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Tagi poistettu järjestelmästä.');
			else console.log('Routes: Tagin poistossa ongelmia.');
		});
};

exports.deleteJobAlias= function(req, res){
	jobHandler.jobAlias( req.params.jobid, null,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Pestin alias poistettu.');
			else console.log('Routes: Ongelmia pestin aliaksen poistossa.');
		});
};

exports.deleteJobAutoreply = function(req, res){
	jobHandler.jobAutoreply( req.params.jobid, null,
		function(status_code){
			res.sendStatus(status_code);
			if(status_code === 200) console.log('Routes: Pestin automaattivastaus poistettu.');
			else console.log('Routes: Ongelmia pestin automaattivastauksen poistossa.');
		});
};

exports.deleteUser = function(req, res){
	userHandler.deleteUser(req.params.id, function(status_code){
		res.sendStatus(status_code);
	});
};
