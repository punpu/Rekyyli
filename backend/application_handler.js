//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 12.01.2015 Tuomas Kunnamo 16.12.2014, Heikki Känä 19.1.2015

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

//Vakio kategoria id kategorisoimattomalle
var KATEGORISOIMATON = 2;

var dbHandler;
//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function(dbh){
	dbHandler = dbh;

	this.countApplications = countApplications;
	this.countAttachments = countAttachments;
	this.emailToDB = emailToDB;
	this.applicationList = applicationList;
	this.applicationFetch = applicationFetch;
	this.applicationSetCategory = applicationSetCategory;
	this.applicationResetCategory = applicationResetCategory;
	this.applicationExists = applicationExists;
	this.applicationDelete = applicationDelete;
	this.applicationDeleteTag = applicationDeleteTag;
	this.attachmentFetch = attachmentFetch;
	this.attachmentList = attachmentList;
	this.applicationSetSenderAndName = applicationSetSenderAndName;
	this.applicationSetJob = applicationSetJob;
};


//Alustetaan kirjastoja
var _ = require('underscore');
var fs = require('fs');

// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';
var delete_error = 'Virhe poistettaessa tietokannasta!';



//Laskurifunktiot hakemusten ja liitteiden lukumäärän hakemiselle
var countApplications = function (callback)
{
	dbHandler.Application.query()
		.count('id as CNT')
		.from('attachments')
		.then(function(amount){
				callback(amount[0].CNT);
		})
		.catch( function(err){
   			console.error('countApplications : '+fetch_error);
   			console.error(err);
		});
};


var countAttachments = function (callback)
{
	dbHandler.Attachment.query()
		.count('id as CNT')
		.from('attachments')
		.then(function(amount){
			callback(amount[0].CNT);
		})
		.catch( function(err){
			console.error('countAttachments : '+fetch_error);
			console.error(err);
		});
};


//Funktio emailin tietokantatallennusta varten
//Funktio ottaa sisään nodemailerin luoman email olion sekä callback funktion.
var emailToDB = function(email, callback)
{
	//Kerätään liitetiedostojen hash tunnisteet talteen taulukkoon
	var hash_list = [];

  if( email.attachments){
  	_.each( email.attachments, function(attac){
  		hash_list.push( attac.checksum);
  	});
  }

	//Luodaan uusi pesti tietokantaa mikäli sitä ei jo ennestään löydy
	dbHandler.Job.forge({email: email.to[0].address})
		.fetch()
		.then(function(result){
			//Jos pestiä ei löydy, luodaan sellainen ja tallennetaan aliakseksi email osoite
			if(!result){
				dbHandler.Job.forge({email: email.to[0].address, 
														 alias: email.to[0].address,
														 autoreply: dbHandler.config.default_autoreply})
					.save()
					.then(function(){
						application_save();
					})
					.catch(function(err){
						console.error('emailToDB : '+save_error);
						console.error(err);
					});
			}
			else application_save();
		})
		.catch( function(err){ //Virheen käsittely, if any
 			console.error('emailToDB : '+fetch_error);
 			console.error(err);
 		});


	var application_save = function(){	
		if(!email.subject) email.subject = '<ei aiheitta>';

    dbHandler.Application.forge(
    	{sender: email.from[0].address,
			 name: email.from[0].name,
			 destination: email.to[0].address,
			 subject: email.subject,
			 body: email.text
			})
   		.save()
   		.then(function(model){ //Tietokantatallennuksen jälkeen suoritettava funktio
				console.log('emailToDB : Email tallennettu tietokantaan. ' + model.id);

				//Siirretään tässä kohtaa email INBOX kansiosta application_archive kansioon
				//MailListener voi vielä käyttää omaa paikallista kopiotaan siirrosta huolimatta
				callback();

				_.each(email.attachments, function(att){
					dbHandler.Attachment.forge(
						{hash: att.checksum,
						 body: att.content,
						 filename: att.fileName,
						 filetype: att.fileName.substring(att.fileName.lastIndexOf('.')+1,att.fileName.length),
						 application_id: model.id})
						.save()
						.then(function(){
							console.log('emailToDB : Liite tallennettu tietokantaan');
							fs.unlink(__dirname+'/../attachments/'+att.fileName, function(err){
                                // Jos tulee error, niin liitetiedosto on jo poistettu
                                // ja sitä yritetään poistaa uudelleen. Ei siis tarvitse tehdä toimenpiteitä
                                if(err) console.log(err);
                            });
						})
						.catch( function(err){ //Virheen käsittely, if any
	   						console.error('emailToDB : '+save_error);
	   						console.error(err);
	   					});
				});
			})
   		.catch( function(err){ //Virheen käsittely, if any
   			console.error('emailToDB : '+save_error);
   			console.error(err);
   		});
  };
};



//Funktio hakee hakemuslistan joko body osassa saaduilla hakuparametreilla tai ilman.
//Funktio antaa callback funktiolle statuskoodin, parametreilla rajoitetun tuloslistan 
//sekä tulosten kokonaislukumäärän.
// Muokattu: Tuomas Kunnamo 16.12.2014, Joni Ollikainen 06.01.2015, Heikki Känä 06.01.2015
// Heikki Känä 19.1.2015: Lisätty kommenteista haku
var applicationList = function(query, body, callback){
	//Aloitus indexi laittaan nollaksi jos sitä ei ole määritelty
	var from = query.from || 0;

	// default sivunkoko 50
	var page_size = query.page_size || 50;

	//Hakufunktio hakemuslistaa varten. Funktio hakee tietokannasta annetuilla parametereilla hakemuslistan.
	//Ainut pakollinen parametri on ensimmäinen, jossa kerrotaan 

	var search_query = function(json_query, id_limits, sender, name, wordsearch){

		//Tehdään erillinen tietokantakysely jossa tulosten lukumäärä ei ole rajoitettu.
		//Näin saadaan tietää montako hakemusta kyseisillä hakuparametreilla yhteensä löytyy.
		//Tietokanta palauttaa tästä hausta vain kokonaislukumäärän jota frontendin sivutus tarvitsee.
		var count_query = dbHandler.Application.forge()
			.query()
			.count('sender')
			.from('applications');

		//Varsinainen tietokanta kysely jolla haetaan rajattu määrä hakemuksia. Jokaiselle hakemukselle
		//haetaan nyt kaikki tiedot.
		var main_query = dbHandler.Application.forge();	
		//Kontrollirakenteet mahdollisia parametreja varten.
		if(json_query && id_limits) {
			count_query.where(json_query);
			count_query.andWhereRaw(id_limits);
			main_query.query({where: json_query, andWhereRaw: id_limits, orderByRaw: 'timestamp DESC'});
		}
		else{
			if(id_limits) {
				count_query.whereRaw(id_limits);	
				main_query.query({whereRaw: id_limits, orderByRaw: 'timestamp DESC'});	
			}
			else if(json_query) {
				count_query.where(json_query);	
				main_query.query({where: json_query, orderByRaw: 'timestamp DESC'});	
			}
			else main_query.query({orderByRaw: 'timestamp DESC'});	
		}

		// Lisätään hakijan nimen ja emailin LIKE-queryt
		if(sender){
			count_query.andWhere('sender', 'ILIKE', '%'+sender+'%');
			// main_query.query() palauttaa knexin query builderin, jolle voidaan kutsua andWhere
			main_query.query().andWhere('sender', 'ILIKE', '%'+sender+'%');
		}
		if(name){
			count_query.andWhere('name', 'ILIKE', '%'+name+'%');
			// main_query.query() palauttaa knexin query builderin, jolle voidaan kutsua andWhere
			main_query.query().andWhere('name', 'ILIKE', '%'+name+'%');
		}


		// Lisätään aikavälihaun queryt
		if(date_from && date_to){
			count_query.andWhere('timestamp', '>=', date_from);
			count_query.andWhere('timestamp', '<=', date_to);
			main_query.query().andWhere('timestamp', '>=', date_from);
			main_query.query().andWhere('timestamp', '<=', date_to);
		}

		//Jos kategoriaa tai koko json_queryä ei ole määritelty, niin estetään poistettujen hakemusten näkyminen listalla.
		//Muutoin näytetään vain määrätyn kategorian hakemukset. Poistetut hakemukset saa haettu 
		//määräämällä kategoria id:n 3.
		if(!json_query){
			count_query.andWhere('category_id', '!=', 3);
			main_query.query().andWhere('category_id', '!=', 3);
		}
		else if(!json_query.category_id){
			count_query.andWhere('category_id', '!=', 3);
			main_query.query().andWhere('category_id', '!=', 3);
		}

		count_query.then(function(amount){

      // Ei sanahakua, lähetetään tulokset suoraan front endille
      if (!wordsearch) {
      	main_query.query({offset: from, limit: page_size});
        main_query.fetchAll({withRelated: {'attachments' : function(qb){qb.select('application_id', 'hash');}, 
                                           'tags' : function(qb){qb.select('application_id',  'tag_id');} }})
        .then(function(app_list){  
          console.log('Lähetetään '+app_list.length+' hakemusta.');
          callback(200, app_list.toJSON(),amount[0].count);   
        })
        .catch( function(err){ //Virheen käsittely
          console.error('applicationList : '+fetch_error);
          console.error(err);
          callback(404);
        });
      }

      // Sanahaku annettu, haetaan kommenteista ja yhdistetään tulokset
      else {

        // Hakukyselyn tulos-id:t
        var main_query_ids = [];
        // Sanahaun tulokset kommenteista
        var comment_application_ids = [];
        // Sanahaun tulokset hakemusten tekstistä ja otsikosta
        var result_applic_ids = [];

        // Haetaan pääkyselyn tuloshakemusten id:t
        main_query.fetchAll({columns: ['id']})
        .then(function (ids) {
           _.each(ids.toJSON(), function (applic) {
             main_query_ids.push(applic.id);
           });
            console.log('Päähausta löytyi tuloksia',main_query_ids.length);

          // Haetaan sanahaun hakusanaan sopivien kommenttien hakemukset
          dbHandler.Note.forge()
          // Käytetään postgresin ILIKE-operaattoria, joka ei välitä kirjainkoosta
          .where('body', 'ILIKE', '%'+wordsearch+'%')
          // Haetaan kommentin vierasavaimena oleva hakemus
          .fetchAll({withRelated: {'application': function(qb){qb.select('id');}}})
          .then(function (note_list) {
            

              // Haetaan kommenttien hakemuksien id:t
            _.each(note_list.toJSON(), function (note) {
              comment_application_ids.push(note.application.id);
            });
            console.log('Kommenttihaun tuloksia löytyi', comment_application_ids.length);
            
            // Haetaan hakemusten joukosta sellaiset, joiden viestin rungossa tai otsikossa on haettu sana
            dbHandler.Application.forge()
            .query(function (qb) {
              qb.where('subject', 'ILIKE', '%'+wordsearch+'%')
              .orWhere('body', 'ILIKE', '%'+wordsearch+'%');
            })
            .fetchAll({columns: ['id']})
            .then(function (app_list) {
              // Otetaan hakemusten id:t talteen
              _.each(app_list.toJSON(), function (app) {
              result_applic_ids.push(app.id);
              });

              console.log('Sanahaun tuloksia (viestistä ja otsikosta) löytyi', result_applic_ids.length);
              // Yhdistetään hakujen tulokset
              // pääkysely (main_query_ids) AND (kommenttikysely (comment_applic_ids) OR hakemuskysely (res_app_ids))
              var combined_wordsearch_ids = _.union(result_applic_ids, comment_application_ids);
              console.log('Kommenttihaku OR Sanahaku, tuloksia',combined_wordsearch_ids.length)
              var combined_ids = _.intersection(combined_wordsearch_ids, main_query_ids);
              console.log('(Kommenttihaku OR Sanahaku) AND Päähaku, tuloksia', combined_ids.length);
              
              // combined_ids-taulukossa on haun tuloshakemusten id:t
              // Tehdään taulukon id:istä SQL-kysely, jolla haettavat hakemukset rajataan
              // Alustetaan nulliksi, mikäli tulosjoukko on tyhjä
              var rawIdQuery = 'NULL';

              if (combined_ids.length > 0) {
                rawIdQuery = '(';

                for(var i = 0; i < combined_ids.length; ++i){
                  rawIdQuery += 'id = '+combined_ids[i]+' OR ';
                }


                if( combined_ids.length > 0 ){
                  // Poistetaan ylimääräinen OR lopusta
                  rawIdQuery = rawIdQuery.substr(0,rawIdQuery.length-4);
                  rawIdQuery += ')';
                }
              }

              // Varsinaiset hakemukset hakeva kysely, jonka tulokset lähetetään frontille
              dbHandler.Application.forge()
              .query(function (qb) {
              	qb.whereRaw(rawIdQuery);
              	qb.offset(from);
              	qb.limit(page_size);
              })
              .fetchAll({withRelated: {'attachments' : function(qb){qb.select('application_id', 'hash');}, 
                                             'tags' : function(qb){qb.select('application_id',  'tag_id');} }})
              .then(function (app_list) {

                // Haku, jolla saadaan selville tuloshakemusten kokonaismäärä
                // Lähetetään frontille sivutusta varten
              	dbHandler.Application.forge()
                .query()
                .whereRaw(rawIdQuery)
                .count('sender')
                .from('applications')
              	.then(function (applications) {
                  console.log('Lähetetään '+app_list.length+' hakemusta.');
                  callback(200, app_list.toJSON(), applications[0].count);
              	})
              	//.catch()   
              })
              .catch( function(err){ //Virheen käsittely
                console.error('search_query (Varsinainen haku): '+fetch_error);
                console.error(err);
                callback(404);
              });
            })
            .catch( function(err){ //Virheen käsittely
              console.error('search_query: '+fetch_error);
              console.error(err);
              callback(404);
            });
          })
          .catch (function (error) {
            console.error('search_query:' + error);
          });
        });
        
      }

			})
			.catch( function(err){ //Virheen käsittely
				console.error('applicationList(count) : '+fetch_error);
				console.error(err);
				callback(404);
			});
	}; 
	// search_query


	//Jos pyynnössä on body kenttä, niin kyseessä on haku ja 
	//hakuparametrit täytyy ottaa talteen.
	if(body){
		//Poimitaan hakupyynnösta kaikki löytyvät kentät
		var json_query = {};
		var tag_search_mode = 'Or'; // Tagihaun AND/OR-valinta. Arvona joko 'Or' tai 'And'
		// Muut hakumuuttujat, jotka eivät mene suoraan json_query:ssä tietokantahakuun
		var wordsearch, sender, name, date_from, date_to;
		if(body.replysent) json_query.replysent = body.replysent;
		if(body.category_id) json_query.category_id = body.category_id;
		if(body.destination) json_query.destination = body.destination;
		if(body.sender) sender = body.sender;
		if(body.name) name = body.name;
    if(body.wordsearch) wordsearch = body.wordsearch;
		if(body.subject) json_query.subject = body.subject;
		if(body.tag_search_mode) tag_search_mode = body.tag_search_mode;
		if(body.stringdatefrom) date_from = body.stringdatefrom;
		if(body.stringdateto) date_to = body.stringdateto;
		
		console.log('Muut hakuparametrit: '+JSON.stringify(json_query));
		console.log('Aikavälin alku '+date_from);
		console.log('Aikavälin loppu '+date_to);
		
		//Jos pyynnön bodyssä on tageja, niin ensin täytyy hakea tageja vastaavat
		//hakemusid:t joilla esisuodatetaan hakutuloksia.
		if(body.tag_ids){

			//Generoidaan ensin tagilistasta tietokantakyselyn osa
			var tag_query_string = '(tag_id IN (';
			_.each(body.tag_ids, function(tag){
				tag_query_string += tag+',';
			});

			tag_query_string = tag_query_string.substring(0,tag_query_string.length-1);
			tag_query_string += '))';


			//Etsitään tageja vastaavat hakemusid:t
			var tag_query = dbHandler.knex
				.select('application_id')
				.from('applicationtags')
				.whereRaw(tag_query_string)
				.groupBy('application_id');

			//Jos halutaan AND operaatio tagejen haulle niin lisätää having -osa kyselyyn
			console.log('Search mode: '+body.tag_search_mode);
			if(body.tag_search_mode == 'And') tag_query.havingRaw('COUNT (tag_id) = '+body.tag_ids.length);

			console.log(tag_query_string);
			tag_query
				.then(function(results){
					//Luodaan uusi kyselyn osa hakemusten id:stä.
					// NULL, jotta ei lähetetä kaikkia hakemuksia, jos results tässä tyhjä
					var id_limits =  'NULL';
					if( results.length > 0 ){
						id_limits =  '(';
					}

					for(var i = 0; i < results.length; ++i){
						id_limits += 'id = '+results[i].application_id+' OR ';
					}

					//Poistetaan loppusta ylimääräinen OR, jos hakemuksia löytyi
					if( results.length > 0 ){
						id_limits = id_limits.substr(0,id_limits.length-4);
						id_limits += ')';
					}
					

					//Tehdään varsinainen haku hakuparametreilla sekä esisuodatetuilla 
					//hakemusid numeroilla.
					search_query(json_query, id_limits, sender, name, wordsearch);			
				})
				.catch( function(err){ //Virheen käsittely
						console.error('applicationList : '+fetch_error);
						console.error(err);
						callback(404);
				});
		}
		//Jos tageja ei ollut, niin haku tehdään pelkästään muilla parametereilla
		else search_query(json_query, null, sender, name, wordsearch);
	}
	//Jos pyynnössä ei ollut body osaa, niin haetaan hakemuslista ilman hakurajauksia
	else search_query();
};


// Funktio hakee yhden hakemuksen tiedot kannasta. Funktio lisää
// category kentän johon se etsii categoryid:tä vastaavan kategorian nimen.
// Syö hakemuksen id:n ja callback-funktion.
var applicationFetch = function(applicId, callback) {
	dbHandler.Application.forge({id: applicId})
		.fetch({withRelated: {'attachments' : function(qb){qb.select('application_id', 'hash');}, 
		                      'tags' : function(qb){qb.select('application_id', 'tag_id');} }})
		.then(function(application) {
			// Hakemusta ei löytynyt
			if (!application) {
				console.error('applicationFetch : Hakemusta id:llä '+applicId+' ei löytynyt');
				callback(404, null);
			}
			// Hakemus löytyi
			else {
				callback(200, application.toJSON());
			}
		})
		.catch( function(err){ //Virheen käsittely
			console.error('applicationFetch : '+fetch_error);
			console.error(err);
			callback(404, null);
		});
};


// Funtio vaihtaa app_id_list funktiossa listattuja hakemusid numeroita vastaavien
// hakemustan kategorian new_category_id:tä vastaavaksi. Funktio toimii rekursiivisesti
// ja suorittaa callback funktion vasta kun kaikki on muutettu tai jos virhe ilmenee.
var applicationSetCategory = function(app_id_list, new_category_id, callback, index){
	//Määritetään index muuttujalle oletusarvo ensimmäistä kierrosta varten
	index = index || 0;
	//console.log('index: '+index);

	//Jos app_id:n indeksointi on ylittänyt listan pituuden
	//on koko lista käyty läpi ja voidaan lopetella
	if(index == app_id_list.length){
		callback(200);
		return;
	}

	dbHandler.Application.forge({ id: app_id_list[index] })
		.fetch()
		.then(function(applic){
			if(!applic){
				console.error('applicationSetCategory : Hakemusta id:llä '+app_id_list[index]+' ei löytynyt.');
				callback(404);
			}
			else{
				// Tallennetaan uusi kategoriaid hakemuksen tietoihin
				applic.save({category_id: new_category_id},{patch: true}).then(function(){
					console.log('Hakemuksen '+app_id_list[index]+' kategoria vaihdettu.');

					//Jatketaan rekursiivisesti samalla funktiolla
					index = index + 1;
					applicationSetCategory(app_id_list, new_category_id, callback, index);
				})
				.catch( function(err){ //Virheen käsittely
					console.error('applicationSetCategory : '+save_error);
					console.error(err);
					callback(404);
				});
			}
		})
		.catch( function(err){ //Virheen käsittely
			console.error('applicationSetCategory : '+fetch_error);
			console.error(err);
			callback(404);
		});
};


//Funktio 'nollaa' kaikkien hakemusten kategoriaksi 'kategorisoimaton' joilla
//on parametrina saatu category_to_delete kategorianaan. Funktio etsii hakemuksia
//yksi kerrallaan ja aina kun hakemus on löytynyt se kutsuu itseään rekursiivisesti
//uudelleen. Rekursio loppuu kun hakemuksia ei enää löydy.
var applicationResetCategory = function(id_to_delete, callback){
	dbHandler.Application.forge()
		.where({category_id: id_to_delete})
		.fetchAll()
		.then(function(applications){
			var ids = [];
			_.each(applications.toJSON(), function(applic){ 
				ids.push(applic.id);
			});
			
			applicationSetCategory(ids, KATEGORISOIMATON, callback);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('applicationResetCategory : '+fetch_error);
			console.error(err);
		});
};


//Funktio selvittää onko onko tietokannassa hakemusta annetulla id numerolla
//Funktio syöttää true tai false arvon callback functiolle parametrina.
var applicationExists = function(id, callback){
	dbHandler.Application.forge()
		.fetchAll()
		.then(function(applications){
			var exists = false;

			_.each(applications.toJSON(), function(app){
				if(app.id == id){
					exists = true;
				}
			});

			callback(exists);
		})
		.catch(function(err){
			console.error('applicationExists : '+fetch_error);
			console.error(err);
		});
};


// Poistaa app_id:n mukaisen hakemuksen tietokannasta.
// Tätä funktiota ei kutsu kukaan.
var applicationDelete = function(app_id, callback) {
	applicationExists(app_id, function(exists) {
		// Hakemusta ei olemassa
		if (!exists) return callback(400);

		dbHandler.Application.forge({id: app_id})
		.destroy()
		.then(function() {
			console.log('applicationDelete: Hakemus ' + app_id + ' poistettu.');
			callback(200);
		})
		.catch(function(err){
			console.error('applicationDelete: ' + delete_error);
			console.error(err);
			callback(404);
		});
		
	});
};

//Hakemuksen tiedoista poistetaan yksi tagi
var applicationDeleteTag = function(app_id, tag_id_to_delete, callback){
	console.log('app_id: '+app_id+', tag_id: '+tag_id_to_delete);
	applicationExists(app_id, function(exists){
		if(!exists) return callback(400);

		dbHandler.Applicationtag.forge()
			.where({application_id: app_id, tag_id: tag_id_to_delete})
			.destroy()
			.then(function(){

				callback(200);
			})
			.catch(function(err){
				console.error('applicationDeleteTag : '+delete_error);
				console.error(err);
			});
	});
};

//Funktio ottaa sisään nodemailerin generoiman contentid tunnisteen
//sekä callback funktion. Contentid:n perusteella etsitään tietokantarivi
//ja nyhdetään sieltä pdf tiedostoa vastaava streamdata ulos. Tämä sitten
//tallennetaan /temp/ kansion alle. Callback kutsutaan toimenpiteiden jälkeen.
var attachmentFetch = function(hash, app_id,callback){
	dbHandler.Attachment.forge()
	.query(function(qb){
		qb.whereRaw('application_id = ?',[app_id]);
		qb.andWhereRaw('hash = ?',[hash]);
	})
	.fetch()
	.then(function(attachment){
		if(!attachment){
			console.log('Tietokannasta ei löytynyt haluttua hakemusta ');
			callback(404, null);
			return;
		}
		attachment = attachment.toJSON();
		fs.writeFile('attachments/'+hash+'.'+attachment.filetype, attachment.body, function(err){
			if(err){
				console.error('writeFile error: '+err);
				callback(404);
			}
			else{
				callback(200,attachment.filetype);
			}
		});
	})
	.catch( function(err){ //Virheen käsittely
		console.error('attachmentFetch : '+fetch_error);
		console.error(err);
		callback(404);
	});
};

// Palauttaa yksittäiseen hakemukseen liittyvät liitteet
// Tietokanta haku ei hae hakemuksen body osaa. Haku on näin nopeampi.
// Heikki 10.11.2014: Muutettu funktio käyttämään pelkkää bookshelfia.
// Nyt pitäisi hakea aina kaikki liitteet
var attachmentList = function(applic_id, callback){

	dbHandler.Application.forge({id: applic_id})
		// Noudetaan hakemukseen liittyvät liitteet
		.fetch({withRelated: [{
			'attachments': function(qb) {
				// Otetaan liitteistä mukaan vain nämä sarakkeet
				qb.select('application_id', 'hash', 'filename');
			}
		}]})
		.then(function(app) {
			// Tuikataan kaikki hakemuksen liitteet muuttujaan
			var attachment_list = app.related('attachments');
			// Lähetetään liitteet frontille
			callback(200, attachment_list);
		})
		.catch( function(err){ //Virheen käsittely
			console.error('attachmentList : '+fetch_error);
			console.error(err);
			callback(404);
		});
			// Tuikataan hakemuksen liitteet taulukkoon
};

// Tuomas Kunnamo 14.12.2014
// Muuttaa hakemuksen lähettäjän nimen ja sähköpostiosoitteen uudeksi
var applicationSetSenderAndName = function(applic_id, new_sender, new_name, callback){

	dbHandler.Application.forge({id: applic_id})
	.fetch()
	.then(function(applic){
		if( ! applic ){
			console.error('applicationSetSenderAndName : Hakemusta id:llä '+applic_id+' ei löytynyt.');
			callback(404);
		}
		else {
			// Tallennetaan uusi sender ja name hakemuksen tietoihin
			applic.save({sender: new_sender, name: new_name},{patch: true}).then(function(){
				callback(200);
			})
			.catch( function(err){ //Virheen käsittely
				console.error('applicationSetSenderAndName : '+save_error);
				console.error(err);
				callback(500);
			});
		}
	}).catch( function(err){ //Virheen käsittely
		console.error('applicationSetSenderAndName : '+fetch_error);
		console.error(err);
		callback(404);
	});
};

// 
var applicationSetJob = function(app_id, new_job_id, callback){
	console.log("Nyt ollaan application_handlerissa");
	dbHandler.Application.forge({ id: app_id })
		.fetch()
		.then(function(applic){
			if(!applic){
				console.error('applicationSetJob : Hakemusta id:llä '+app_id+' ei löytynyt.');
				callback(404);
			}
			else{
				dbHandler.Job.forge({ id: new_job_id })
					.fetch()
					.then(function(job){
						job = job.toJSON();

						if(!job){
							console.error('applicationSetJob : Pestiä id:llä '+new_job_id+' ei löytynyt.');
							callback(404);
						}

						else{
							console.log(job.alias);
							console.log(job.id);
							console.log(job.email);
							// Tallennetaan uusi kategoriaid hakemuksen tietoihin
							applic.save({destination: job.email},{patch: true}).then(function(){
								console.log('Hakemuksen '+app_id+' pesti vaihdettu.');
								callback(200);
							})
							.catch( function(err){ //Virheen käsittely
								console.error('applicationSetJob : '+save_error);
								console.error(err);
								callback(404);
							});
						}
					})
					.catch( function(err){ //Virheen käsittely
						console.error('applicationSetJob (find job) : '+fetch_error);
						console.error(err);
						callback(404);
					});
				}
		})
		.catch( function(err){ //Virheen käsittely
			console.error('applicationSetJob : '+fetch_error);
			console.error(err);
			callback(404);
		});
};
