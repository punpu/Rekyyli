//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

'use strict';

var config = {};

config.database = {};
config.email = {};
config.rekyyli = {};
config.passport = {};
config.email.imap = {};
config.email.smtp = {};
config.default_categories = [];


//Tämä on oletus sähköpostivastaus saapuville hakemuksille
config.default_autoreply = '';

// Rekyylin node-palvelimen portti
config.rekyyli.port = '3000';

//Tähän postgresql tietokantaan liittyvät tiedot
config.database.address = '';
config.database.port = '';
config.database.username = '';
config.database.password = '';
config.database.default_database = '';

//Tähän sähköpostiasetukset
config.email.address = '';
config.email.password = '';

config.email.imap.server = 'imap.gmail.com';
config.email.imap.server_port = '993';
config.email.imap.server_tls = true;
config.email.imap.default_mailbox = 'INBOX';

config.email.smtp.server = 'smtp.gmail.com';
config.email.smtp.server_port = '465';
config.email.smtp.server_tls = true;

// Password-kirjaston secret sessioiden cookieita varten
config.passport.secret = 'rekyylin defaultsecret';

//Tähän hakemusten oletuskategoriat joita ei voi poistaa ohjelmasta käsin.
//Lisää oletuskategorioita voi lisätä näiden alle
//Lisäksi kategoriat Uusi id=1  ja Kategorisoimaton id=2 lisätään tietokantaa alustettaessa automaattisesti.
config.default_categories.push('Hylätty');


module.exports = config;

