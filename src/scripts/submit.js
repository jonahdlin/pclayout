var cytoscape = require("cytoscape");
var $ = require('jquery');

function l(message) {console.log(message);}

/*
Will save to database in form (in this module, this form is called a layout):
{
  uri: "http%....",
  positions: [
    {
      id: "a_node_id",
      pos: {x: 123, y: 456}
    },
    {
      id: "another_node_id",
      pos: {x: 314, y: 159}
    }
  ]
}
*/

export function submitNewLayout(graph, graph_uri) {
  const nodes = graph.nodes();
  var pos_arr = [];
  for (var i = 0; i < nodes.length; i++) {
    pos_arr.push({
      id: nodes[i].id(),
      pos: nodes[i].position()
    });
  }
  var layout_json = {
    uri: graph_uri,
    positions: pos_arr
  }
  upload(layout_json);
}

function upload(layout) {
  l(layout);
  $.ajax({
    type: "POST",
    url: "http://localhost:28015/layout",
    crossDomain: true,
    data: layout,
    dataType: "json",
    timeout: 5000,
    success: (result) => {
      l("Success!");
    },
    error: (jqXHR, exception) => {
      l("Failure :(\n"+jqXHR+"\n"+exception);
    }
  });
}

// // initialize connection variable
// var connection = null;
// r.connect( {host: "localhost", port: 28015}, function(err, conn){
//   if (err) throw err;
//   connection = conn
// });

// // initialize pathways database with a table called layouts
// r.db("pathways").tableCreate("layouts").run(connection, function(err, result) {
//   if (err) throw err;
// })

// function uploadLayout(layout) {
//   r.table("layouts").insert([
//     layout
//   ]).run(connection, function(err, result) {
//     if (err) throw err;
//     l(JSON.stringify(result, null, 2));
//   })
// }