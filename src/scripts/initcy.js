var cytoscape = require("cytoscape");
const $ = require("jquery");

export function cytoInit(container, graph_props) {
  var g = cytoscape({
    container: container,
    style: getStyle(graph_props),
    minZoom: graph_props.min_zoom,
    maxZoom: graph_props.max_zoom,
  });

  // Create tap handle events on nodes and edges
  g.on("tap", "edge", function(e){
    var parallel_edges = e.target.parallelEdges();
    for (var i = 0; i < parallel_edges.length; i++) {
      console.log(parallel_edges[i].id());
    }
  });
  g.on("tap", "node", function(e){
    // First things first, open up the sidebar
    var wait = false;
    var sidebar_open = $(".sidebar").css("left") !== $("body").css("width");
    console.log(sidebar_open);
    if (!sidebar_open) {
      $(".sidebar").css({
        "left": (sidebar_open ? 100 : 70)+"%",
        "box-shadow": sidebar_open ? "0px 0px 0px 0px #303030" : "0px 0px 10px 3px #303030"
      });
      sidebar_open = true;
      wait = true;
    }
    // Wait for the animation to finish to avoid weird lag glitch
    window.setTimeout(function() {
      // Get nodes and edges from onclick event
      var edges = e.target.connectedEdges();
      var nodes = edges.connectedNodes().filter('[id != "'+e.target.id+'"]');

      // Create sidebar graph, which will display the node clicked on,
      // surrounded by the nodes and edges connected to it
      var sidebar = cytoscape({
        container: $(".sidebar_graph")[0],
        style: [
          {
            selector: "node",
            style: {
              "background-color": graph_props.node_color,
              "label": "data(id)",
              "font-size": "4px",
              "width": 15,
              "height": 15
            }
          },
          {
            selector: "edge",
            style: {
              "width": graph_props.edge_width,
              "line-color": graph_props.edge_color
            }
          }
        ],
        minZoom: graph_props.min_zoom,
        maxZoom: graph_props.max_zoom,
      });

      // This is done to be able to specify the styling of the clicked node,
      // but I'm pretty sure you shouldn't specify styles like this. I don't
      // know the proper way
      const sidebar_node = sidebar.add(e.target);
      sidebar_node.style("background-color", "rgb(100, 158, 226)");

      // I'm doing these two loops separately since I think the edges must refer
      // specifically to existing nodes, which don't exist until they are created
      // in the graph
      for (var i = 0; i < nodes.length; i++) {
        sidebar.add(nodes[i]);
      }
      for (var i = 0; i < edges.length; i++) {
        // the original id names I gave to the edges have the form
        // "source connection-type-with-dashes target"
        // so these three lines create a "clean id" which is stripped
        // of the source and target names and replaces the dashes with
        // spaces.
        var clean_id = edges[i].id().split(" ")[1].split("-").join(" ");
        edges[i].data("clean_id", clean_id);

        sidebar.add(edges[i]); // adds them to the sidebar
      }

      // Change the layout to concentric. I want the clicked node to be the immediate
      // visual focus, so I figured I'd put it in the center of a circle of its
      // neighbours. For some unknown reason, just setting concentric does this
      // automatically. ¯\_(ツ)_/¯
      var layout = sidebar.layout({
        name: "concentric"
      });
      layout.run();

      // This section is going to generate a list of graphs that will display underneath
      // the sidebar graph, and will list off all the connections to and from the clicked
      // node
      var list_items = "";
      for (var i = 0; i < edges.length; i++) {
        list_items += "<div class='connection'></div>";
      }
      $(".connection_list")[0].innerHTML = list_items;

      const colors = graph_props.sidebar_list_colors;
      for (var i = 0; i < edges.length; i++) {
        $(".connection")[i].style.backgroundColor = hexToRgbA(colors[i%colors.length], 0.3);
        var new_graph = cytoscape({
          container: $(".connection")[i],
          style: [
            {
              selector: "node",
              style: {
                "background-color": graph_props.node_color,
                "label": "data(id)",
                "font-size": "75px",
                "width": 200,
                "height": 200
              }
            },
            {
              selector: "edge",
              style: {
                "width": 20,
                "label": "data(clean_id)",
                "font-size": "75px",
                "text-margin-y": "-40px",
                "line-color": graph_props.edge_color
              }
            }
          ],
          minZoom: graph_props.min_zoom,
          maxZoom: graph_props.max_zoom,
          // userZoomingEnabled: true,
          userPanningEnabled: false
        });

        new_graph.add(edges[i].connectedNodes());
        new_graph.add(edges[i]);

        var new_layout = new_graph.layout({
          name: "grid",
          rows: 1,
          avoidOverlap: true,
          avoidOverlapPadding: 1100
        });
        new_layout.run();

      }
    }, wait ? 550 : 0);
  });

  return g;
}

export function getStyle(graph_props){
  return [
    {
      selector: "node",
      style: {
        "background-color": graph_props.node_color,
        "label": "data(id)"
      }
    },
    {
      selector: "edge",
      style: {
        "width": graph_props.edge_width,
        "line-color": graph_props.edge_color
      }
    }
  ]
}

// from https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex, opacity){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
  }
  throw new Error('Bad Hex');
}

hexToRgbA('#fbafff')