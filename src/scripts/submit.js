var cytoscape = require("cytoscape");
var $ = require('jquery');

function l(message) {console.log(message);}

var sprops = {
  ip: "potato",
  port: "2001",
  send_api: "/sendlayout"
}

/*
Will save to database in form (in this module, this form is called a layout):
{
  uri: "http%....",
  layout: [
    {
      id: "a_node_id",
      edges: [
        {
          n1: "a_node_id",
          n2: "a_different_node_id",
          type: "connection type"
        },
        .
        .
        .
      ],
      pos: {x: 123, y: 456}
    },
    {
      id: "another_node_id",
      pos: {x: 314, y: 159}
    }
  ],
  username: "username"
  password: "password"
}
*/

// Takes in a graph and graph_uri to process and upload to database. Requires
// the IDs of the edges in the graph to be of the form:
// "node1_id edge_type node2_id"
// where both the node IDs are exactly the same as its incident node's IDs
export function submitNewLayout(graph, graph_uri) {
  // Handle error where graph hasn't loaded yet or doesn't exist
  if (graph == null) {
    l("No graph.");
    return;
  }

  const nodes = graph.nodes();
  var pos_arr = [];

  for (var i = 0; i < nodes.length; i++) {
    var curr_id = nodes[i].id();
    var incident_edges = nodes[i].connectedEdges();
    var formatted_edges = [];

    for (var j = 0; j < incident_edges.length; j++){
      // split edge id into an array where [0] and [2] are nodes and
      // [1] is a connection type.
      var curr_edge = incident_edges[j].id().split(" ");

      // push to the formatted edges array and make sure the 1st neighbour
      // is the current node
      formatted_edges.push({
        n1: curr_id,
        n2: (curr_edge[0] === curr_id ? curr_edge[2] : curr_edge[0]),
        type: curr_edge[1]
      });
    }

    pos_arr.push({
      id: curr_id,
      edges: formatted_edges,
      pos: nodes[i].position()
    });
  }
  var layout_json = {
    uri: graph_uri,
    layout: JSON.stringify(pos_arr),
    username: "admin",
    password: "admin"
  }

  upload(layout_json);
}

function upload(layout) {
  $.ajax({
    type: "POST",
    url: "http://"+sprops.ip+":"+sprops.port+sprops.send_api,
    crossDomain: true,
    data: layout,
    dataType: "json",
    timeout: 5000,
    success: (result) => {
      l("-------------------------------------\nUpload successful. JSON uploaded is:");
      l(result);
      l("-------------------------------------");
    },
    error: (jqXHR, exception) => {
      l("Upload failure :(");
    }
  });
}

// // initialize connection variable
// var connection = null;
// r.connect( {host: "localhost", port: 28015}, function(err, conn){
// if (err) throw err;
// connection = conn
// });

// // initialize pathways database with a table called layouts
// r.db("pathways").tableCreate("layouts").run(connection, function(err, result) {
// if (err) throw err;
// })

// function uploadLayout(layout) {
// r.table("layouts").insert([
//   layout
// ]).run(connection, function(err, result) {
//   if (err) throw err;
//   l(JSON.stringify(result, null, 2));
// })
// }