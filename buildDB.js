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
