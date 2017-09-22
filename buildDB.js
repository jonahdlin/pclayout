r = require('rethinkdb');

r.dbCreate('layouts');

var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

r.db('layouts').tableCreate('uris').run(connection, function(err, result) {
    if (err) throw err;
    console.log('Created uri table.');
})

r.db('layouts').tableCreate('submissions').run(connection, function(err, result) {
    if (err) throw err;
    console.log('Created submissions table.');
})

r.db('layouts').tableCreate('users').run(connection, function(err, result) {
    if (err) throw err;
    console.log('Created users table.');
})

r.db('layouts').tableCreate('cachedLayouts').run(connection, function(err, result) {
    if (err) throw err;
    console.log('Created cached layouts table.');
})
