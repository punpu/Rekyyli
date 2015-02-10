// Komentoriviohjelma, joka luo admin/admin käyttäjän Rekyyliin
// käyttö komennolla: node create_admin.js

var dbh = require('./backend/db_handler').dbHandler;
var dbHandler = new dbh();

var ush = require('./backend/user_handler').handler;
var userHandler = new ush(dbHandler);

var user = {};
user.username = 'admin';
user.password = 'admin';
user.name = 'Admin';
user.email = 'admin@admin.admin';
user.is_master = true;

userHandler.userCreateNew(user, function(status){
    if(status === 201){
        console.log("admin/admin käyttäjätunnus luotu");    
    }
    
    process.exit();
});

