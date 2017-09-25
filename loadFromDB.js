const r = require('rethinkdb');

function testLoad(){
  var uri = "howdy";
  load(uri, console.log);
}

function pull(connection, uri, callback){
  r.db('layouts')
  .table('cachedLayouts')
  .eqJoin('uriID', r.table('uris'))
  .zip()
  .filter({uri: uri})
  .run(connection, function(err,cursor){
    if (err) throw err;
    cursor.toArray(function(err,result){
      console.log(result);
      if (result.length === 0) callback({});
      if (result.length > 1) throw Error; // This should never happen
      callback(result[0]);
    });
  });
}

module.exports.load = function (uri, callback){
  var connection = null;
  console.log('hello');
  console.log(uri);
  r.connect({db: 'layouts', host: 'localhost', port: 28015}, function(err, conn){
      if (err) throw err;
      connection = conn;
      pull(connection, uri, callback);
  });

}

//testLoad();