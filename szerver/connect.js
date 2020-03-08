var mysql = require('mysql');
  
var databaseManager = {
    con : mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "232122",
        database:"teszt_db"
      }),
      
    connectToDatabase: function(){
      this.con.connect(function(err) {
        if (err) throw err;
        console.log("MySQL Connected!");
      })
    },

    getFromDatabase: function (selectScript, values){
        var self = this;
        return new Promise(function (resolve, reject){
            self.con.query( selectScript, [values], function (err, result) { 
                if (err) 
                reject(err);
                else{
                console.log(result.length);
                resolve(result);
                }
            });
        });
    },

    addData: function(values){
        var sql = `INSERT IGNORE INTO products (filename, color) VALUES ?`;
        this.con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records added: " + result.affectedRows);
        });
    },
    
    removeData: function(values, table, column){
        var sql = `DELETE FROM ${table} WHERE ${column} NOT IN (?)`;
        this.con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records deleted: " + result.affectedRows);
        });
    },

    setFilename: function(table, column, callback){
        var self = this;
        var datetime = new Date();
        var currentDate = datetime.toISOString().slice(0,10);
      
        var promise = new Promise (function(resolve, reject){
          var sql =`SELECT ${column} FROM ${table} WHERE ${column} LIKE '${currentDate}%'`;
          self.con.query(sql, function (err, result) {
            if (err) throw err;
          
            if(err){
                console.log(err);
                reject(err);
            }
            else{
              resolve(result.length);
            }
          });
        });
      
        promise.then(function(results){
          var fileName = 0;
          if (results<10){
            fileName = currentDate+'-0'+ results;           //még nincs kiterjesztése!
          }
          else{
            fileName = currentDate+'-'+ results;
          }
          callback(fileName);
        });
      }
}

module.exports = {
    databaseManager: databaseManager
}