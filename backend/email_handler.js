//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni Ollikainen
//Viimeisimmät muutokset: Joni Ollikainen 16.11.2014, Tuomas Kunnamo 10.12.2014

// http://www.w3schools.com/js/js_strict.asp
// Kielletään epämääräisen syntaksin käyttö:
'use strict';

var appHandler;
var noteHandler;
var dbHandler;

// Error viestien valmispohjat
// Näitä tulostetaan bookshelf.js funktioiden .catch() poikkeusten käsittelyssä
var fetch_error = 'Virhe haettaessa tietoja tietokantannasta!';
var save_error = 'Virhe tallennettaessa tietokantaan!';

//Rakentajafunktio jonka avulla saadaan alustettua jäsenmuuttujat
//new avainsanalla luotuja instansseja varten. Kaikki tämän funktion
//ulkopuolella oleva on tämän luokan sisäistä toteutusta.
//Aiemmin exportatut funktiot ovat nyt luokan jäsenfunktioita.
exports.handler = function(dbh, aph, nth){
    dbHandler = dbh;
    appHandler = aph;
    noteHandler = nth;
    this.imapMailListener = mailListener;
    this.sendMail = sendMail;
};

var _ = require('underscore');
var config = require('../config');

//Emailien käsittelyyn liittyvät moduulit
var MailListener = require('mail-listener2');
var nodemailer = require('nodemailer');

// Luodaan SMTP viestinvälitys olio, SSL suojattu yhteys
var transporter = nodemailer.createTransport({
    host: config.email.smtp.server,

    service: 'Gmail',
    auth: {
        user: config.email.address,
        pass: config.email.password,
        port: config.email.smtp.server_port,
        secure: config.email.smtp.server_tls
    }
});

//Imap laatikon olio
var mailListener = new MailListener({
  username: config.email.address,
  password: config.email.password,
  host: config.email.imap.server,
  port: config.email.imap.server_port,
  tls: config.email.imap.server_tls,
  mailbox: config.email.imap.default_mailbox,
  markSeen: true, // Haetut viestit merkitään luetuiksi
  fetchUnreadOnStart: true, // Haetaan kaikki lukemattomat viestit ohjelman käynnistyessä
  attachments: true,
  attachmentOptions: { directory: 'attachments/' }
});

//Exportataan imap laatikko pääohjelmaa varten


/////////////////////////////////////////////////
//Seuraavassa imap laatikon eventit:

//server connected
mailListener.on('server:connected', function() {
    console.log('Yhteys muodostettu imap laatikkoon.');
});

// Luonut: Joni Ollikainen
// Muokannut: Eero Vornanen 2.1.2015
//mail: Lukematon sähköposti laatikossa
mailListener.on('mail', function(mail){
  console.log('Email saapunut.');

  // Tallennetaan maili tietokantaan aluksi.
  appHandler.emailToDB(mail, function(){
    mailListener.imap.move('*', 'application_archive', function(){
        console.log('Email käsitelty ja siirretty alikansioon application_archive');
      });
  });

  //Kaivellaan lähettäjän säpo osoite
  var sender = mail.from[0].address;
  console.log('Lähettäjä: ' + sender);
  console.log(mail.subject);
  
  // Haetaan ensin pestin tiedot saapuneen postin kohdeosoitteella
  dbHandler.Job.forge({email: mail.to[0].address})
    .fetch()
    .then(function(job){
      // Muutetaan pestin tiedot JSONiksi
      if(job){
        job = job.toJSON();  
      } else {
        job = {};
      }
      
      // Muuttuja johon tallennetaan automaattivastaus
      var reply = '';

      // Jos pestillä on autoreply määritetty, käytetään sitä
      if( job.autoreply ) {
        reply = job.autoreply;
      }
      
      // Jos ei, niin otetaan käyttöön conffitiedoston automaattivastaus.
      else{
        reply = dbHandler.config.default_autoreply;
      }

      
      // Tässä tehdään varsinainen lähetys.
      if (sender !== config.email.address) {
        //Lähetetään vastausviesti
        transporter.sendMail({
          from: job.email,
          to: sender,
          subject: 'Kiitos hakemuksestasi',
          text: reply
        }, function(error, success){
          if(error){
            console.log(error);
          }
          else console.log('Emailiin lähetetty vastaus.');
        });
      }
      
      else console.log('Posti tuli omasta osoitteesta, ei vastata');
      
    });
});


////////////////////////////////////
// Funktio sähköpostivastauksien lähettämiseen
// Tehnyt Tuomas Kunnamo, 20.10.2014
// Tästä puuttuu vielä merkkaaminen tietokantaan että hakemuksiin on vastattu
// sekä virheenhallinta, koska asynkronista toimintaa

// Lisää koodauksia 20.12.2014 by Joni Ollikainen.
// Vastaus merkitään nyt hakemukseen ja lähetetty viesti tallennetaan hakemuksen muistiinpanoihin.
// Luotu rekursiivinen systeemi usean vastaanottajan viestin lähetystä varten jotta callback saa
// oikean status koodin vain yhden kerran kun kaikki viestin on saatu lähetettyä.

var sendMail = function(data, callback, index){

  //Index saa arvon 0 ensimmäisellä kierroksella
  index = index || 0;

  //Rekursio päättyy kun uusi indeksi ei enää palauta
  //kelvollista vastaanottajaa.
  if(!data.recipients[index]){
    return callback(200);
  }

  var recipient = data.recipients[index]; 

  transporter.sendMail({
    from: data.sender,
    to: recipient.email,
    subject: data.subject,
    text: data.message
  }, function(error){
    if(error){
      console.log('sendMail : Viestin lähetyksessä virhe: '+error);
      return callback(500);
    }

    console.log('sendMail : Lähettäjänä näkyy: ' + data.sender);
    console.log('sendMail : Lähetetty vastaus osoitteeseen: ' + recipient.email);

    // Merkataan hakemukselle "vastattu" tietokantaan
    dbHandler.Application.forge({ id: recipient.id })
      .fetch()
      .then(function(applic){
        if(!applic){
            console.error('sendMail : Hakemusta id:llä '+recipient.id+' ei löytynyt.');
        }
        else{
          applic.save({replysent: true},{patch: true}).then(function(){

            // Lisätään lähetetty viesti kyseisen hakemuksen muistiinpanohin.
            var new_note = {note:'Sähköpostivastaus:'+'\n'+data.subject+'\n'+data.message, user: data.sender};
            noteHandler.noteCreateNew(recipient.id, new_note, function(status_code){
              if(status_code != 200) return console.log('sendMail : Vastausviestiä ei saatu tallennettua muistiinpanoihin.');

              console.log('sendMail : Vastausviesti tallennettu muistiinpanoihin.');

              //Uusi rekursio kierros seuraavalla indeksin arvolla.
              sendMail(data, callback, index+1 );
            });
          })
          .catch( function(err){ //Virheen käsittely
              console.error('sendMail : '+save_error);
              console.error(err);
          });
        }

      })
      .catch(function(err){ //Virheen käsittely
        console.error('sendMail : '+fetch_error);
        console.error(err);
      });

  });
};



