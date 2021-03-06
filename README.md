# Rekyyli

Rekyyli on selainpohjainen rekrytoinninhallintajärjestelmä ohjelmistoyrityksen rekrytointitarpeisiin.

Rekyylin tarkoitus on helpottaa sähköpostilla lähetettyjen työhakemusten hallintaa ja niihin vastaamista. Yritykseen saapuvat työhakemukset tallennetaan sovelluksen tietokantaan, minkä jälkeen saapuneita hakemuksia voi lajitella ja rajata tiettyjen ehtojen mukaan. Sovelluksella voidaan lähettää automaattivastauksia hakijoille ja luoda sähköpostipohjia.


Rekyyli toteutettiin Tampereen Teknillisen Yliopiston projektikurssin tuotteena.

## Kehittämiäni osa-alueita

- Etusivun työhakemustaulukko (MainCtrl.js, home.html)
- Työhakemuksen tiedot-sivu (Application_detailsCtrl.js, Application_details.html)
- Käyttäjätunnukset ja kirjautuminen (auth_handler.js, user_handler.js, AuthService.js)
- Vastausviestien lähettäminen (ReplyToSelectedCtrl.js, ReplyToSelected.html, email_handler.js)
- Dynaamiset success/error-viestit (AlertService.js)
- Monia muutoksia ja korjauksia pitkin järjestelmää

## Avainteknologiat:
Backend:
- node.js
- express
- postgresql
- bookshelf.js
- passport.js

Frontend:
- angular.js
- bootstrap
- underscore.js



## LICENCE

Rekyyli on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

Rekyylin tekijänoikeudet omistavat seuraavat henkilöt:
- Mikko Nieminen
- Tuomas Kunnamo
- Heikki Känä
- Joni Ollikainen
- Hannu Tuomisto
- Eero Vornanen.
