var pg = require('pg');

// Set up database
var db = {};

db.config = {}

// db.connect = function(runAfterConnecting) {
//   console.log(process.env.DATABASE_URL);

//   pg.connect(process.env.DATABASE_URL, function(err, client, done){
//     if (err) {
//       console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
//     }
//     runAfterConnecting(client);
//     done();
//   });
// };

db.connect = function(runAfterConnecting) {
  console.log(process.env.DATABASE_URL);

  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    if (err) {
      console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
    }
    runAfterConnecting(client);
    done();
  });
};

db.query = function(statement, params, callback){
  db.connect(function(client){
    client.query(statement, params, callback);
  });
};

module.exports = db;