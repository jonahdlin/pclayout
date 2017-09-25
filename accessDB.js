const r = require('rethinkdb');

var uriID = null;
var usrID = null;



// Hack of a function to check if the credentials for admin access were correct
function correctCredentials(username, password){
  return username === "admin" && password === "admin";
}

/* writeURI(connection, data, callback) accepts data to be written
to the connected database and the calls callback upon completion.
It writes the uri info to the uri table of the database.

*/
function writeURI(connection, data, callback){
  // Create the data to be saved
  var uriData = {
    uri : data['uri'],
    date : new Date()
  };

  // Only one instance of each uri should be in the database
  // Check if one already exists.
  r.db('layouts')
  .table('uris')
  .filter({uri:data.uri})
  .run(connection,function(err,cursor){
    if(err) throw err;

    // Convert filter results to array
    cursor.toArray(function(err,result){
      if (err) throw err;

      // If this is a new URI, create a new entry
      if(result.length === 0){
        r.table('uris')
        .insert(uriData)
        .run(connection, function(err,result){
          if (err) throw err;
          uriID = result.generated_keys[0]; // Save the uriID to link with other tables
          writeUser(connection,data, callback);
        });
      } else if (result.length > 1) { // a uri should never have more than one entry
        throw Error;
      } else {
        // update the existing uri
        r.table('uris')
        .filter({uri:data['uri']})
        .update({'date': uriData.date}, {returnChanges: true})
        .run(connection, function(err,result){
          if (err) throw err;
          
          uriID = result.changes[0].new_val.id;
          // call next data extraction function
          writeUser(connection,data,callback);
        });
      }

    })

  }); 

}

/*
WriteUser(connection, data, callback) writes the user info from data to 
the user table in the database specified by connection then calls callback.
*/
function writeUser(connection, data, callback){
  // Create object to be saved to table
  // This will need to be overhauled once a real login system is created
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
            writeLayout(connection,data, callback);
          });
        // Yes: pull the user id from the entry.
        } else {
          usrID = result[0].id; 
          // call next data extraction function
          writeLayout(connection,data, callback);
        }
      })

    }); 
}

/*
WriteLayout(connection, data, callback) writes the layout data from data to 
the submissions table in the database specified by connection then calls callback.
*/
function writeLayout (connection,data, callback){
  // Create the new object that must be saved to the table
  var layoutData = {
    uriID : uriID,
    layout : data['layout'],
    date : new Date(),
    userID : usrID
  };

  // Save the entry
  r.table('submissions')
  .insert(layoutData)
  .run(connection,function(err,result){
    if (err) throw err;
    // Call the next data extraction function
    runHeuristics(connection, layoutData.uriID, callback);
  });
}

function fakeHeuristics(layouts){
  return layouts[0]; // Just take the first one
}

function runHeuristics(connection, uriID,callback){
  r.db('layouts')
  .table('submissions')
  .filter({uriID:uriID})
  .orderBy(r.desc('date'))
  .run(connection,function(err,result){
    if (err) throw err;

    var newCache = fakeHeuristics(result);
    cacheLayout(connection, newCache, uriID, callback);
  });
}

/*
cacheLayout(connection, uri, callback) runs the algorithms to determine what the 
desired layout for a uri and saves it to the cachedLayouts table

I should separate 'heuristics' from the rest of the cache process to increae portability
*/
function cacheLayout(connection, newCache, uriID, callback){

  r.db('layouts')
  .table('cachedLayouts')
  .filter({uriID: newCache})
  .run(connection,function(err,cursor){
    cursor.toArray(function(err,result){
      // Yes? Then update it
      if(result.length===0){
        r.db('layouts')
        .table('cachedLayouts')
        .insert(newCache)
        .run(connection,function(err,result){
          if (err) throw err;
          callback("New data was saved");
        });
      }else{
        // No? Then create it
        r.db('layouts')
        .table('cachedLayouts')
        .filter({uriID: newCache.uriID})
        .update({
          date: newCache.date,
          layout: newCache.layout
        })
        .run(connection, function(err,result){
          if (err) throw err;
          callback("New data was saved");
        });
      }
    });
  });
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

// --------------------------------------------------
// ---------------- Load Function -------------------
// --------------------------------------------------



function pull(connection, uri, callback){
  r.db('layouts')
  .table('cachedLayouts')
  .eqJoin('uriID', r.table('uris'))
  .zip()
  .filter({uri: uri})
  .run(connection, function(err,cursor){
    if (err) throw err;
    cursor.toArray(function(err,result){
      if (result.length === 0) callback({});
      if (result.length > 1) throw Error; // This should never happen
      callback(result[0]);
    });
  });
}

module.exports.load = function (uri, callback){
  var connection = null;
  r.connect({db: 'layouts', host: 'localhost', port: 28015}, function(err, conn){
      if (err) throw err;
      connection = conn;
      pull(connection, uri, callback);
  });

}


