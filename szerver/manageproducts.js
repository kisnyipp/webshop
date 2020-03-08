var Vibrant = require('node-vibrant');
var db = require('./connect');
var fs = require('fs');

var productManager = {

    productCount: 0,
    productPerPage: 4,

    filterProductsForActualPage: function (filenames, pageNumber){
        this.productCount = filenames.length;
        var productnumber = pageNumber * this.productPerPage;
        var actualproductPerPage;
        if (pageNumber * this.productPerPage + this.productPerPage>filenames.length){
            if(filenames.length<this.productPerPage){
            actualproductPerPage = filenames.length;
            }
            else{
            actualproductPerPage = filenames.length % this.productPerPage;
            }
        }
        else{
            actualproductPerPage = this.productPerPage;
        }
        var values = [];
        for(var i = 0; i<actualproductPerPage; i++)
        {
            values[i] = filenames[productnumber].filename;
            productnumber++;
        }
        return values;
    },

    jsonifyResults: function (results){
        var self = this;
        return new Promise(function(resolve, reject){
            var productInfo = {};
            var products = [];
            for (var i = 0; i<results.length; i++){
            products[i] = {
                filename: results[i].filename,
                name: results[i].name,
                color: results[i].color,
                price: results[i].price,
                labels: results[i].labels
            }
            }

            let buttonNumber = Math.ceil(self.productCount / self.productPerPage);
            console.log(buttonNumber);
            productInfo.products = products;
            productInfo.buttonNumber = buttonNumber;
            resolve(productInfo);
        });
    },
    
    setColor: function(){
        var sql = `SELECT filename FROM products WHERE color='0'`;
        var promises = [];
        var arr = [];
        db.databaseManager.con.query(sql, function (err, result) {
          if (err) throw err;
      
          for (var i = 0; i<result.length; i++){
            var img = result[i].filename;
            arr[i] = img;
            promises.push(new Promise( function(resolve, reject) {
              fs.readFile(`./kesz_termekek/${img}`, function(err, contents) {
                const buffer = new Buffer(contents);
                let vibrant = new Vibrant(buffer);
                var color = vibrant.getPalette().then((palette) => {return palette.Vibrant._rgb})
                if(err){
                  reject(err);
                }
                else{
                  resolve(color);
                }    
              });  
            }));
          }
        
          Promise.all(promises).then( function(results){
            for(var i = 0; i<results.length; i++){
              var sql = `UPDATE products SET color='${results[i]}' WHERE filename='${arr[i]}'`;
              db.databaseManager.con.query(sql, function (err, result) {
                if (err) throw err;

                console.log('color updated');
              });
            }
          }, function(err){
            console.log(err);
          });
        })  
        return;
      },

    uploadProduct: function(req, res){
        var self = this;
        var name = req.get('name');
        var category = req.get('category');
        var price = req.get('price');
        var labels = req.get('labels');
    
        const file = req.files.photo;
    
        var promise = new Promise( function(resolve, reject){
            db.databaseManager.setFilename('products','filename', function(result){
                resolve(result);
            });
        });
    
        promise.then(function(results){
            var fileName = results+'.jpg';
            var path = __dirname + '/kesz_termekek/' + fileName;
    
            file.mv(path, (error) => {
                if (error) {
                    console.error(error)
                    res.writeHead(500, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify({ status: 'error', message: error }))
                    return;
                }
                var sql = `INSERT INTO products (filename, name, category, price, labels) VALUES ('${fileName}','${name}','${category}', '${price}', '${labels}')`;
                db.databaseManager.con.query(sql, function (err, result) {
                    if (err){
                        res.statusCode = 500;
                        res.end();
                        console.log(err);
                        return;
                    }
                    else{
                        self.setColor();
                        res.statusCode = 200;
                        res.end();
                    }
                });
            });
        });
      return;
    },

    viewProduct: function(req, res){
        let filename = req.get('filename');
        let sql = `UPDATE products SET viewed =  viewed+1 WHERE filename='${filename}'`;
        db.databaseManager.con.query(sql, function (err, result) {
            if (err){
                res.statusCode = 500;
                res.end();
                console.log(err);
                return;
            }
            else{
                db.databaseManager.con.query(`SELECT viewed FROM products WHERE filename='${filename}'`, function (err, result) {
                    if (err) 
                    {
                        res.statusCode = 500;
                        res.end();
                        console.log(err);
                        return;
                    }
                    else{
                        console.log(result[0].viewed);
                        let info = {
                            'viewed': result[0].viewed
                        }
                        res.statusCode = 200;
                        res.end(JSON.stringify(info));
                    }
                });
            }
        });
    },

    listProducts: function(req, res){
        var self = this;
        req.on('data', chunk => {
            var requestInfo = JSON.parse(chunk);
            let order = requestInfo.order;
            let keyword = requestInfo.keyword;
            console.log('order ' + order);
            console.log('keyword ' + keyword);
            let sql;
            if(keyword != undefined){
                keyword = requestInfo.keyword;
                sql = `SELECT filename FROM products WHERE (labels LIKE '%${keyword}%') OR (name LIKE '%${keyword}%') ORDER BY ${order}`;
            }
            else{
                sql = `SELECT filename FROM products order by  ${order}`;
            }
        
            db.databaseManager.getFromDatabase(sql)
            .then(filenames => self.filterProductsForActualPage(filenames, requestInfo.pageNumber))
            .then(values => db.databaseManager.getFromDatabase(`SELECT* FROM products WHERE filename IN (?) ORDER BY  ${order}`, values))
            .then(results => self.jsonifyResults(results))
            .then(productInfo => {
                res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
                res.end(JSON.stringify(productInfo));
            }).catch(error => {
                console.log(error);
                res.writeHead(500);
                res.end(); 
            })
            return;
        })
    }
}

module.exports = {
    productManager: productManager
}