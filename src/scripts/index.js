const React = require('react');
const ReactDOM = require('react-dom');
const h = require('react-hyperscript');

import { SketchPicker } from 'react-color';

const render = require('./render.js');
const customize = require('./customize.js');
const submit = require('./submit.js');

var valid_uri_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=`.".split("");

function l(message) {console.log(message);}

window.addEventListener("DOMContentLoaded", function() {
  ReactDOM.render(h(Page, {}), document.getElementById("root"));
}); 

// Page
// - Generate Page content (header, graph, sidebar, everything)
// - Initialize all properties of the sidebar (done in another file with JQuery)
// - Creates the initial graph with the initial uri in its state
// - Maintain the graph properties (visual characteristics) and the graph object
// - Can update the graph properties and re-render the graph, and passes that function
//   down to its children (the re-rendering is complete, GET included, I should change that)
class Page extends React.Component {
  constructor() {
    super();
    this.state = {
      initial_uri: "http%3A%2F%2Fidentifiers.org%2Freactome%2FR-HSA-70171",
      current_uri: "http%3A%2F%2Fidentifiers.org%2Freactome%2FR-HSA-70171",
      uri_displayed: null,
      node_displayed: null,
      layout_options: ["Concentric", "Circle", "Grid", "Random", "Breadthfirst", "COSE"],
      graph: {
        object: null,
        g_props: {
          layout: "circle",
          grid_rows: 10,
          min_zoom: 0.2,
          max_zoom: 5,
          node_color: "#FF383F",
          edge_width: 2,
          edge_color: "#c1c1c1",
          // colors taken from running js function at http://www.nikolay.rocks/2015-10-29-rainbows-generator-in-javascript
          sidebar_list_colors: [
            "#8012ed", "#bf01bf", "#ed1280", "#ff4040",
            "#ed7f12", "#bfbf01", "#80ed12", "#40ff40",
            "#12ed7f", "#01bfbf", "#1280ed", "#4040ff"
          ]
        }
      }
    };
  }
  componentDidMount() {
    customize.customizeInit();
  }
  handleLayoutSubmit() {
    submit.submitNewLayout(this.state.graph.object, this.state.current_uri);
  }
  createGraph(input) {
    // What renderGraph returns is a Promise, since the AJAX call has yet to
    // finish when assignment should happen here. If we just returned a graph
    // object, it would be undefined, since the assignment occurs right away,
    // before AJAX can load the data (and thus doesn't return anything).
    // To avoid this, a Promise is returned that must be resolved here. To get
    // the error handling out of here for simplicity, it is also part of
    // render.js.
    var wait_for_load = render.renderGraph(input, document.getElementsByClassName("graph_container")[0], this.state.graph.g_props);
    wait_for_load.then(
      (result) => {
        var new_graph = render.parseAndAddData(result, document.getElementsByClassName("graph_container")[0], this.state.graph.g_props);
        this.setState({
          current_uri: input,
          graph: {
            object: new_graph,
            g_props: this.state.graph.g_props
          }
        });
      },
      (jqXHR, exception) => {
        return render.handleError(jqXHR, exception);
      }
    );
  }
  
  updateGraphProps(field, value) {
    var new_props = this.state.graph.g_props;
    new_props[field] = value;
    this.setState({
      graph: {
        object: this.state.graph.object,
        g_props: new_props
      }
    });
    if (field === "layout") {
      render.updateLayout(this.state.graph.object, new_props);
    } else {
      render.reStyleGraph(this.state.graph.object, this.state.graph.g_props);
    }
  }
  
  render() {
    return (
      <div className='page_container'>
        <div className='left_content_container'>
          <Header
            submit={(input) => this.createGraph(input)}
            submitNewLayout={() => this.handleLayoutSubmit()}
            uri={this.state.current_uri}
            placeholder={'e.g. ' + this.state.initial_uri}
          />
          <Graph
            onload={() => this.createGraph(this.state.initial_uri)}
            graph_props={this.state.graph.g_props}
          />
        </div>
        <Sidebar
          display={this.state.node_displayed}
          layout_options={this.state.layout_options}
          updateGraphProps={(field, change) => this.updateGraphProps(field, change)}
          graph={this.state.graph.object}
          g_props={this.state.graph.g_props}
        />
      </div>
    )
  }
}

// Header
// - Creates the top of the page content
// - Mainly serves as a container so that the URI box class doesn't have to worry about
//   setting up any other visual content (like the page title)
class Header extends React.Component {
  render() {
    return (
      <div className='header'>
        <div className='header_text'>Input a Pathway Commons URI</div>
        <URIBox
          value={this.props.uri}
          placeholder={this.props.placeholder}
          submit={(input) => this.props.submit(input)}
          submitNewLayout={() => this.props.submitNewLayout()}
        />
      </div>
    );
  }
}

// URIBox
// - Creates the URI input box and can send off whatever is entered back up to the Page
//   if enter is pressed or if the Go button is pressed
// - Does not do any input validation whatsoever
// - Has fancy resizing if the page is shrinked :)
class URIBox extends React.Component {
  constructor() {
    super();
    this.state = {
      value: null,
      dynamic: false
    };
    this.updateDynamic = this.updateDynamic.bind(this);
  }

  componentWillMount() {
    this.setState({value: this.props.value});
    this.updateDynamic();
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateDynamic);
  }
  componentWillUnmount() {window.removeEventListener("resize", this.updateDynamic);}

  updateDynamic() {
    var hw = document.documentElement.offsetWidth;
    this.setState({
      dynamic: 0.8 * hw < 550
    });
  }
  
  handleSubmitClick() {this.props.submit(this.state.value);}
  
  handleKeyUp(e) {
    this.setState({
      value: e.target.value
    });
    if (e.key === "Enter") {
      this.props.submit(this.state.value);
    }
  }
  
  render() {
    return (
      <div className='URIBox_container'>
        <input
          placeholder={this.props.placeholder}
          className={"linear_trans URIBox" + (this.state.dynamic ? " URIBox_dynamic" : "")}
          onKeyUp={(e) => this.handleKeyUp(e)}
        />
        <div
          className='submit_button center linear_trans no_select'
          onClick={() => this.handleSubmitClick()}
        >Go</div>
        <div
          className='layout_submit_button center linear_trans no_select'
          onClick={() => this.props.submitNewLayout()}
        >Submit Layout</div>
      </div>
    );
  }
}

// Graph
// - Generates the div for the graph and sends up the cue for Page to load the initial
//   graph. That should only happen once, once the Graph class has rendered
class Graph extends React.Component {
  componentDidMount() {
    //l("Mounted graph container component. Div for graph is: ");
    //l(document.getElementsByClassName("graph_container")[0]);
    this.props.onload();
  }

  render() {
    return (
      <div className='graph_wrapper'>
        <div className='graph_container'></div>
      </div>
    )
  }
}

// Sidebar
// - Creates the sidebar (with a mess of HTML, most of which I copied and pasted from
//   my non-React version of this app)
// - Makes changes to graph properties and sends them up to Page for the graph to re-render
// - I should split the two menus into two classes I think
class Sidebar extends React.Component {
  handleNodeChangeComplete(color) {
    this.props.updateGraphProps("node_color", color.hex);
  }

  handleEdgeChangeComplete(color) {
    this.props.updateGraphProps("edge_color", color.hex);
  }

  render() {
    const layout_buttons = this.props.layout_options.map((layoutName) => {
      return (
        <div
          key={layoutName}
          className='layout_button linear_trans no_select center'
          onClick={() => this.props.updateGraphProps("layout", layoutName.toLowerCase())}
        >{layoutName}</div>
      );
    });
    
    return (
      <div className='sidebar ease_trans'>
        <div className='menu_icon_container center'>
          <img
            src='src/style/exchange.svg'
            alt='O'
            className='menu_icon'
          />
        </div>
        <div className='extras_panel'>
          <div className='tab_select'>
            <div className='sidebar_tab center linear_trans no_select'>Node Viewer</div>
            <div className='customization_tab center linear_trans no_select'>Customization</div>
          </div>
          <div className='node_viewer'>
            <div className='sidebar_graph'></div>
            <div className='connection_list'></div>
          </div>
          <div className='customization'>
            <div className='layout'>Graph Layout
              {layout_buttons}
            </div>
            <div className='colour'>
              <div className='colour_box'>
                <span className='colour_label'>Node Colour</span>
                <SketchPicker
                  className='colour_selector'
                  color={this.props.g_props.node_color}
                  onChangeComplete={(color) => this.handleNodeChangeComplete(color)}
                />
              </div>
              <div className='colour_box'>
                <span className='colour_label'>Edge Colour</span>
                <SketchPicker
                  className='colour_selector'
                  color={this.props.g_props.edge_color}
                  onChangeComplete={(color) => this.handleEdgeChangeComplete(color)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}