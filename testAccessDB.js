const accessDB = require('./accessDB.js');

function runTest(){
  const fakeData = {
    layout : 'how about words instead',
    username : 'admin',
    password : 'admin',
    uri : 'test'
  }
  // Establish connection to the database
  accessDB.save(fakeData,function(){console.log('I faked data');})
}

function testLoad(){
  var uri = "howdy";
  accessDB.load(uri, console.log);
}

runTest();
testLoad();