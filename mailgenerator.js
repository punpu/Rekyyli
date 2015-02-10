//Tämä tiedosto on lisensoitu Creative Commons BY-NC-ND 4.0 -lisenssillä. 
//Tarkastele käyttölupaa osoitteessa http://creativecommons.org/licenses/by-nc-nd/4.0/

//Kooditiedoston tekijä: Joni
//Viimeisimmät muutokset: Joni 14.10.2014


'use strict';

var nodemailer = require('nodemailer');

var names = ['Adiena','Adoliina','Alumina','Alenia','Aravis','Arlaana','Arnamia','Asda','Begonia','Belene','Beline','Besla',
'Biata','Birgiina','Caronia','Cassine','Cermine','Cinti','Damina','Deralia','Diia','Dolia','Doranne','Edeleena','Edeliina',
'Edeline','Emeriikke','Emmadora','Emmaliia','Emmia','Enika','Enneliina','Esda','Essike','Eveka','Evinna','Famine','Fanine',
'Fenda','Fiinikki','Fione','Florana','Gaija','Garla','Greata','Grida','Hannae','Heliel','Helmiisa','Helmikuu','Hemilia',
'Hennike','Hirella','Ianna','Inia','Iraliia','Irla','Irmaine','Irmine','Isanne','Jarelia','Jasmilda','Jeesia','Jemia',
'Jemillia','Jenya','Jine','Karilia','Karinne','Kasendra','Katriikka','Keelis','Lilijaana','Limoona','Lisia','Lunanne','Marieele',
'Marjuuna','Marlii','Marsilea','Melinne','Merinne','Meripihka','Mettine','Mileja','Milija','Milje','Minelle','Mirael',
'Miralia','Miraliia','Miralla','Mireena','Miriska','Monanna','Naanu','Nadinna','Natusanne','Nevina','Niinuli','Ninelde',
'Norelia','Norelle','Odinne','Ofalda','Olda','Onilia','Onnu','Opaali','Osmana','Pea','Perenna','Pesiina','Petruusa','Pihkatar',
'Piira','Pinda','Reanne','Rienne','Riinukka','Roosia','Roselda','Roselta','Sadel','Sadetar','Sadine','Safriikka','Sanike',
'Sanine','Sanira','Saralea','Sarinne','Senya','Sinnu','Sinnukka','Siriella','Sirielle','Sirietta','Syys','Sädie','Taijaana',
'Teane','Tianne','Tilhia','Tipina','Tumiina','Ulvine','Unetar','Unnika','Usvatar','Veelia','Veira','Velinda','Verasia','Vernissa',
'Vidanne','Vienne','Viivianne','Vimona','Virella','Wanilia','Wileena','Xanda','Xara','Xarmine','Xerafine','Ylvanna','Ylvina',
'Yria','Ysa','Zanne','Zaranna','Zavinda','Zenilie'];




// Luodaan SMTP viestinvälitys olio
var transporter = nodemailer.createTransport({
    host: 'smtp.kolumbus.fi',
});


var random = 100000000000*Math.random();


var sender = function( random ){

	var generated_filename = random.toString(36);
	console.log(generated_filename);

	var name1 = names[Math.floor( Math.random()*(names.length - 1))];
    var name2 = names[Math.floor( Math.random()*(names.length - 1))];

    var from_field =  name1+' '+name2+'<'+name1.toLowerCase()+'.'+name2.toLowerCase()+'@kalaverkko.tontut.fi>';
	console.log( from_field );

	transporter.sendMail({
	    from: from_field,
	    to: 'rekyyli-testi@netti.fi',
	    subject: 'Työpaikkahakemus',
	    text: 'Hei! Tässä olisi minun työhakemus',
	    attachments: [{
	    	filename: generated_filename+'.pdf',
	    	path: 'http://www.education.gov.yk.ca/pdf/pdf-test.pdf'
	    }]
	}, function(error, success){
	    if(error){
	        console.log(error);
	    }
	    else{
	        console.log(success);

	        sender(random+1);
	    }
	});
};


sender(random);