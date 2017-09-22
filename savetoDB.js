const r = require('rethinkdb');

var uriID = null;
var usrID = null;

function runTest(){
  const fakeData = {
    layout : 'how about words instead',
    username : 'admin',
    password : 'admin',
    uri : 'test'
  }
  // Establish connection to the database
  var connection = null;
  r.connect({db: 'layouts', host: 'localhost', port: 28015}, function(err, conn){
      if (err) throw err;
      connection = conn;

      // call what you need from here.
      save(connection, fakeData);
  });
}

// Hack of a function to check if the credentials for admin access were correct
function correctCredentials(username, password){
  return username === "admin" && password === "admin";
}

function writeURI(connection, data, callback){
  var uriData = {
    uri : data['uri'],
    date : new Date()
  };

  // Does the db contain this uri?
  r.db('layouts')
  .table('uris')
  .filter({uri:data['uri']})
  .run(connection,function(err,cursor){
    if(err) throw err;

    cursor.toArray(function(err,result){
      if (err) throw err;

      if(result.length === 0){
        r.table('uris')
        .insert(uriData)
        .run(connection, function(err,result){
          if (err) throw err;
          uriID = result.generated_keys[0];
          writeUser(connection,data, callback);
        });
      } else {
        // Yes: Update the related entry
        r.table('uris')
        .filter({uri:data['uri']})
        .update({'date': uriData.date}, {returnChanges: true})
        .run(connection, function(err,result){
          if (err) throw err;
          
          uriID = result.changes[0].new_val.id;
          writeUser(connection,data,callback);
        });
      }

    })

  }); 

}

function writeUser(connection, data, callback){
  var usrInfo = {
    userType : correctCredentials(data['username'], data['password']) ? 'admin' : 'commoner'
  }
  
    // Does the db contain this user?
    r.db('layouts')
    .table('users')
    .filter({userType: usrInfo.userType })
    .run(connection,function(err,cursor){
      if(err) throw err;
      // No: create a new entry. 
      cursor.toArray(function(err,result){
        if(result.length === 0){
          r.table('users')
          .insert(usrInfo)
          .run(connection, function(err,result){
            if (err) throw err;
            usrID = result.generated_keys[0];
            console.log(result.generated_keys[0]);
            writeLayout(connection,data, callback);
          });
        } else {
          console.log(result[0].id);
          usrID = result[0].id; 
          writeLayout(connection,data, callback);
        }
      })

    }); 
}

function writeLayout (connection,data, callback){

  var layoutData = {
    uriID : uriID,
    layout : data['layout'],
    date : new Date(),
    userID : usrID
  };

  r.table('submissions')
  .insert(layoutData)
  .run(connection,function(err,result){
    if (err) throw err;
    cacheLayout(connection, callback);
  });
}

function cacheLayout(connection, callback){
  // this is a complete hack.
  r.db('layouts')
  .table('submissions')
  .orderBy(r.desc('date'))
  .limit(1)
  .run(connection, function(err,result){
    if (err) throw err;
    callback();
  })
}

// Parse data received from the front end and update database accordingly
module.exports.save = function (data, callback){
  var connection = null;
  r.connect({db: 'layouts', host: 'localhost', port: 28015}, function(err, conn){
      if (err) throw err;
      connection = conn;

      // call what you need from here.
      writeURI(connection, data, callback);
  });

}

