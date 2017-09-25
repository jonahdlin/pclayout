var cytoscape = require("cytoscape");
var $ = require('jquery');

function l(message) {console.log(message);}

var sprops = {
  ip: "potato",
  port: "2001",
  send_api: "/sendlayout",
  retrieve_api: "/retrievelayout"
}

export function getLayout(uri) {
  // l("Getting graph for URI: "+uri);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "http://"+sprops.ip+":"+sprops.port+sprops.retrieve_api,
      crossDomain: true,
      data: {uri: uri},
      timeout: 5000,
      success: (result) => {
        // l("-------------------------------------\nRetrieve successful. JSON retrieved is:");
        // l(result);
        // l("-------------------------------------");
        resolve(result);
      },
      error: (jqXHR, exception) => {
        l("Get failure :(");
        reject(jqXHR, exception);
      }
    });
  });
}

export function parseAndRunLayout(raw_layout, graph) {
  var lo_unpack;
  try {
    lo_unpack = JSON.parse(raw_layout.layout);
  } catch(ex) {
    l("Error unpacking layout (JSON.parse()): "+ex);
  }
  // l({
  //   x: lo_unpack[0].pos.x,
  //   y: lo_unpack[0].pos.y
  // });
  var set_layout = graph.layout({
    name: "preset",
    positions: (node) => {
      const id = node.id();
      for (var i = 0; i < lo_unpack.length; i++) {
        if (id === lo_unpack[i].id) {
          var node_obj = lo_unpack.splice(i, 1)[0];
          //l(node_obj);
          return {
            x: node_obj.pos.x,
            y: node_obj.pos.y
          }
        }
      }
    }
  })
  set_layout.run();
}