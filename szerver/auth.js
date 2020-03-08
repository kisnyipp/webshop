var argon = require("argon2")
var jwt = require("jsonwebtoken");
const fs   = require('fs');

var UserDB = [];    //átírni adatbázisba!

/* var privateKey  = fs.readFileSync('./private.key', 'utf8');
var publicKey  = fs.readFileSync('./public.key', 'utf8'); */

class User{
    constructor(username, passwordHash){
        this.username = username;
        this.passwordHash = passwordHash;
    }
}

async function register(username, password){
    const hash = await argon.hash(password);

    UserDB.push(new User(username, hash));
    console.log(username+" "+ hash);
}

async function login(username, password){
    var verifiedUser = await verifyUser(username, password);
    if(!verifiedUser)
        return '';

    data = {
        id: 0,
        user: username
    }
    const expiration = '6h';
    var jwtToken = jwt.sign(data, privateKey, { algorithm: 'RS256',
                                                expiresIn: expiration}
                            );
    console.log(jwtToken);
    return jwtToken;
}

async function verifyUser(username, password){
    console.log(username);
    console.log(password);
    for(var i=0; i<UserDB.length; i++){
        if(UserDB[i].username == username){
/*             const hash = await argon.hash(password); */
            console.log("Trying hash");
            /* console.log(hash); */
            if(argon.verify(UserDB[i].passwordHash, password)){
                console.log("Found user!");
                return true;
            }
        }
    }
    console.log("Not found user!");
    return false;
}

module.exports = {
    login: login
}


