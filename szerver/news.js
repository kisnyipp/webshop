var fs = require('fs');
var db = require('./connect')

var newsManager = {
    newsPerPage: 4,

    updateNews: function(callback){  //összes cikk sorba rendezése
        let promise = new Promise(function(resolve, reject) {
          fs.readdir('./cikkek/', function(err, files) {
            if(err){
              console.log(err);
            }
            else {
              files.sort(function(a, b) {
                return a > b ? -1 : 1;
              }).forEach(function(file, key) {
                let fileType = file.split('.')[1];
                if (fileType == 'txt'){
                  let sql = `INSERT IGNORE INTO news (text) VALUES ('${file}')`;
                  db.databaseManager.con.query(sql, function (err, result) {
                    if (err)
                      reject(err);
                  });
                }
              });
            }
            resolve(files);
          });
        });
        promise.then(function(files) {
        db.databaseManager.removeData(files, 'news', 'text');
          let dbPromises = [];
          for(let i = 0; i<files.length; i++){
            let fileType = files[i].split('.')[1];
            let onlyName = files[i].split('.')[0];
            if(fileType == 'jpg'){
              let sql = `UPDATE news SET image='${files[i]}' WHERE text='${onlyName}.txt'`;
              dbPromises.push(new Promise(function(resolve, reject){
                db.databaseManager.con.query(sql, function(err, result) {
                  if (err){
                    reject(err);                                              //ez így nem jó
                  }
                  else{
                    resolve();
                  }
                });
              }))
            }
          }
          Promise.all(dbPromises).then(function(results){
            callback(200);
          },
          function(err){
            console.log(err);
            callback(500);
          });
        });
      },

    readNews: function(pageNumber, res){
      var self = this;
      let promise = db.databaseManager.getFromDatabase(`SELECT* FROM news ORDER BY text desc`)
      promise.then(function(articles){
        var newsnumber = pageNumber * self.newsPerPage; 
          var actualNewsPerPage;
          if (pageNumber * self.newsPerPage+self.newsPerPage > articles.length)    //utolsó oldal
          {
            if(articles.length < self.newsPerPage)   //ha csak egy oldal van
            {
              actualNewsPerPage = articles.length;
            }
            else
            {
              actualNewsPerPage = articles.length % self.newsPerPage;  // ha több oldal van
            }
          }
          else   //nem utolsó oldal
          {
            actualNewsPerPage = self.newsPerPage;
          }
          let newsInfo = {};
          let promises = [];
            for (var i = 0; i<actualNewsPerPage; i++)
            {
              newsInfo[i] = articles[newsnumber];
              console.log(articles[newsnumber].text)
                promises.push(new Promise (function(resolve, reject) {
                  fs.readFile(`./cikkek/${articles[newsnumber].text}`, 'utf8', function(err, contents) {
                    if(err){
                      reject(err);
                    }
                    else{
                        resolve(contents);
                      }   
                  });
              }))
              newsnumber++;
            }
            newsInfo['articlePerPage'] = actualNewsPerPage;
            newsInfo['buttonNumber'] = Math.ceil(articles.length / self.newsPerPage);
  
          Promise.all(promises).then( function(contents){
            for (let i = 0; i<contents.length; i++)
            {
              newsInfo[i].text = contents[i];
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
            res.end(JSON.stringify(newsInfo));
          });
        });
    },

    uploadNews: function(req, res){
        var self = this;
        var content = req.get('content');
        let image;
        try{
            image = req.files.photo;
        }
        catch{
            image = undefined;
        }
    
        var promise = new Promise( function(resolve, reject){
            db.databaseManager.setFilename('news','text', function(result){
                console.log(result);
                resolve(result);
            });
        });
    
        promise.then(function(results){
            let textName = results+'.txt';
            
            return new Promise(function(resolve, reject){
                fs.writeFile(`./cikkek/${textName}`, content, function (err) {
                if (err){
                    reject(err);
                }
                resolve(results);
                });
            });
        }).then(function(results){
            if (image != undefined){
                let imageName=results+'.jpg';
                return new Promise(function(resolve, reject){
                    image.mv(`${__dirname}/cikkek/${imageName}`, (error) => {
                        if (error) {
                        reject(error);
                        }
                        resolve();
                    })
                })  
            }
        }).then( function(result){
            return new Promise(function(resolve, reject){
                self.updateNews(function(result){
                    console.log(result);
                    if (result == 200){
                        res.statusCode = 200;
                        res.end(); 
                        resolve(result);
                    }
                    else{
                        reject(err);
                    }
                });
            });
        }).catch(function(error){
            res.statusCode = 500;
            res.end();
            console.log(error);
        });
        return;
    }
}

module.exports = {
    newsManager: newsManager
}