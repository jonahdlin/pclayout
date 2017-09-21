var $ = require("jquery");
var initcy = require("./initcy.js");
var cy = require("cytoscape");

var props = {
  graph_loaded: false,
  error: {
    timeout_wait: 10000,
    timout_wait_inc: 1000,
    timeout: "Error: The search timed out.",
    timeout_var_assign: "Error: The graph object couldnot be assigned in time.",
    incorrect_data: "Error: Either the data received didn't make sense, or the URI was invalid.",
    no_connect: "Error: Could not connect. Check network connection.",
    not_found: "Error: Could not find requested page (404).",
    internal_server: "Error: Internal server error (500).",
    service_unavailable: "Error: Service unavailable (503)",
    abort: "Ajax request aborted."
  }
};

// Loads the data from a given URI using AJAX and the pathway commons GET service
export function renderGraph(uri, container, graph_props) {
  // l("render.js has received the graph container div:");
  // l(container);
  // l("render.js has received the URI "+uri);
  // l(graph_props);
  var wait_for_load = loadData(uri, container, graph_props);
  return wait_for_load;
}

export function reStyleGraph(g, graph_props) {
  g.style(initcy.getStyle(graph_props));
}

function l(message) {console.log(message);}
  
function loadData(uri, container, graph_props) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "http://www.pathwaycommons.org/pc2/get?uri="+uri+"&format=sif",
      timeout: props.error.timeout_wait,
      success: (result) => {resolve(result);},
      error: (jqXHR, exception) => {reject(jqXHR, exception);}
    });
  });
}

export function handleError(jqXHR, exception) {
  // error parsing gotten from
  // https://stackoverflow.com/questions/6792878/jquery-ajax-error-function
  var msg = "";
  if (jqXHR.status == 404) {
    msg = this.props.error.not_found;
  } else if (jqXHR.status == 500) {
    msg = this.props.error.internal_server;
  } else if (jqXHR.status == 503) {
    msg = this.props.error.service_unavailable;
  } else if (exception === "timeout") {
    msg = this.props.error.timeout;
  } else if (exception === "abort") {
    msg = this.props.error.abort;
  } else {
    msg = "Uncaught Error: " + jqXHR.responseText;
  }
  alert(msg);
}

export function parseAndAddData(raw, container, graph_props) {
  // I don't understand this regex. I got it from stackoverflow somewhere
  var raw_array = raw.replace(/\n/ig, "\t").split("\t");

  // Tiny bit of input validation. Usually used to catch any weird data sent that
  //   that is all one long random string with no spaces. This occurs when pathway
  //   commons sends data for a garbage URI
  if (raw_array.length % 3 !== 0) {
    alert(props.error.incorrect_data);
    return;
  }

  var data = [];
  var edges = [];

  var g = initcy.cytoInit(container, graph_props);

  for (var i = 0; i < raw_array.length; i += 3) {
    addIfNew(g, data, raw_array[i]);
    addIfNew(g, data, raw_array[i+2]);
    var edge_id = raw_array[i]+" "+raw_array[i+1]+" "+raw_array[i+2];
    if (edges.indexOf(edge_id) === -1) {
      g.add({
        group: "edges",
        data: {
          id: edge_id,
          source: raw_array[i],
          target: raw_array[i+2]
        }
      });
      edges.push(edge_id);
    } else {
      // As of now, all edges are printed, though some may be hidden completely
      //   underneath another one, so this code should not ever log anything
      //   to the console.
      console.log("Did not print edge '"+edge_id+"'");
    }
  }
  //l("Finished getting graph.");

  updateLayout(g, graph_props);

  return g;
}

// Auxiliary function that adds a node with id "name" to the graph g only if
//   it is not already in the array "arr"
function addIfNew(g, arr, name) {
  if (arr.indexOf(name) === -1) {
    arr.push(name);
    g.add({group: "nodes", data: {id: name}});
  }
}

// Updates the layout on the graph g to whatever the current props dictate
export function updateLayout(g, graph_props) {
  var layout;
  if (graph_props.layout === "grid") {
    layout = g.layout({
      name: graph_props.layout,
      rows: graph_props.grid_rows
    });
  } else {
    layout = g.layout({
      name: graph_props.layout
    });
  }
  layout.run();
}