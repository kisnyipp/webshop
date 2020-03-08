var fs = require('fs');
var express = require('express');
const server = express();
var authService = require('./auth');
var db = require('./connect')
var pm = require('./manageproducts')
var nm = require('./news')
var emailSender = require('./email');
const fileupload = require('express-fileupload');

server.use(fileupload());
server.use(express.static('frontend'));
server.use(express.static('kesz_termekek'));
server.use('/cikkek', express.static('cikkek'));

server.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/webshop.html'); 
})

server.get('/loadpage', (req, res) => {
  req.on('data', chunk => {
    reqPage=chunk.toString('utf8');
    console.log(reqPage);
    fs.readFile(`./${reqPage}.html`, 'utf8', function (err, data){
      if(err){
        console.log(err);
        res.statusCode = 404;
        res.end();
      }
      else{
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data, 'utf8');
        res.end();
      }
    });
  
  });
  return;
})

server.post('/email', (req, res) => {
  req.on('data', chunk => {
      requestJson = JSON.parse(chunk);
      console.log(`Data: ${requestJson.name} ${requestJson.address} ${requestJson.text} ${requestJson.copy}`);
      emailSender.sendMail(requestJson.name, requestJson.address, requestJson.text, requestJson.copy, res);
  })
  req.on('end', () => {
  })
  return;
})

server.post('/readtext', (req, res) => {
  req.on('data', chunk => {
    var requestInfo = JSON.parse(chunk);
    let updateNewsPromise = new Promise(function(resolve, reject){
      nm.newsManager.updateNews(function(result){
        console.log(result);
        resolve();
      });
    });
    updateNewsPromise.then(function(){
      nm.newsManager.readNews(requestInfo.pageNumber, res);
    })
  });
 return;
})

server.post('/listproducts', (req, res) => {
  pm.productManager.listProducts(req, res);
})

server.post('/viewProduct', (req, res) => {
  pm.productManager.viewProduct(req, res)
})

server.post('/uploadProduct', (req, res) => {
  pm.productManager.uploadProduct(req, res);
});

server.post('/uploadNews', (req, res) => {
  nm.newsManager.uploadNews(req, res);
});

server.post('/login', (req, res) => {
  req.on('data', chunk => {
    data = JSON.parse(chunk);
    console.log(data);
    var promise = new Promise(function(resolve, reject){
      resolve(authService.login(data.username, data.password));
    });
    promise.then(function(result){
      var jwtToken = result;
      if (jwtToken != ''){
        res.statusCode=200;
        res.end(jwtToken);
      }
      else{
        res.statusCode=401;
        res.end("Hibás adatok!");
      }
    });
  });
});

db.databaseManager.connectToDatabase();

server.listen(80);
