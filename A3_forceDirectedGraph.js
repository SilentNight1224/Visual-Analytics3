class ForceDirectedGraph {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 800,
      containerHeight: 800,
      margin: {top: 25, right: 20, bottom: 20, left: 35}
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width_l = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height_l = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    vis.Data = JSON.parse(JSON.stringify(vis.data));
    // Define size of SVG drawing area
    vis.local = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)
        .attr('id','local')
        .style("border", "1px solid blue");

    vis.global = d3.select(vis.config.parentElement).append('svg')
        .attr('width', 250)
        .attr('height', 250)
        .attr("transform", "translate(" + -252 + "," + 0 + ")")
        .attr('id','global')
        .style("border", "2px solid black");

    vis.title = vis.local.append("text")
        .attr("text-anchor", "start")
        .attr("x", 5)
        .attr("y", 30)
        .style("fill", "#000")
        .style("font-size", "30px")
        .style("alignment-baseline", "middle")
        .text("Local View")

    vis.Title = vis.global.append("text")
        .attr("text-anchor", "start")
        .attr("x", 5)
        .attr("y", 240)
        .style("fill", "#000")
        .style("font-size", "30px")
        .style("alignment-baseline", "middle")
        .text("Global View")
    // Append group element that will contain our actual chart 
    // and position it according to the given margin config

    // define node and link
    // To DO
    vis.widthScale = d3.scaleLinear()
      .domain([1, 21])
      .range([1, 3]);

    vis.gScale = d3.scaleLinear()
      .domain([0, 800])
      .range([0, 250]);
    
    vis.link = vis.local.append("g")
      .selectAll("line")
      .data(vis.data.links)
      .join("line")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", d => vis.widthScale(d.value));

    vis.node = vis.local.append("g")
      .selectAll("circle")
      .data(vis.data.nodes)
      .join("circle")
        .attr("r", 5)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .style("opacity", 1);
    
    vis.node.on("mouseover", d => vis.fade(d, 0.4))
      .on("mouseout", d => vis.fade(d, 1));

    
    vis.Link = vis.global.append("g")
      .selectAll("line")
      .data(vis.Data.links)
      .join("line")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", d => vis.widthScale(d.value));

    vis.Node = vis.global.append("g")
      .selectAll("circle")
      .data(vis.Data.nodes)
      .join("circle")
        .attr("r", 5)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .style("opacity", 1);

    // define force simulation
    // To DO
    vis.simulation = d3.forceSimulation()                
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-50))         
      .force("center", d3.forceCenter(vis.config.width_l / 2, vis.config.height_l / 2));

    vis.Simulation = d3.forceSimulation()                
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-50))         
      .force("center", d3.forceCenter(400, 400))

    // define a tooltip for showing text
    // To DO
    vis.tooltip = vis.local.selectAll(".tooltip")
      .data(vis.data.nodes)
      .join("text")
        .attr("class", "tooltip")
        .attr("text-anchor", "start")
        .style("fill", "black")
        .style("font-size", "10px")
        .style("alignment-baseline", "middle")
        .style("opacity", 0);

    // Build a dictionary (i.e., linkedByIndex) which will be used in isConnected function
    // To DO
    vis.linkedByIndex = {};
    const keys = [];
    vis.data.links.forEach( d => {
      keys.push(d.source + "," + d.target)
    });
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      vis.linkedByIndex[key] = 1
    };
    //console.log(vis.linkedByIndex)
    vis.updateVis();

  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Add node-link data to simulation
    // To DO
    vis.simulation.nodes(vis.data.nodes)
    vis.simulation.force("link").links(vis.data.links)
    vis.Simulation.nodes(vis.Data.nodes)
    vis.Simulation.force("link").links(vis.Data.links)

    // Map color to the node
    // To DO
    vis.node.attr("fill", d => vis.colorScale(d.group))
    vis.Node.attr("fill", d => vis.colorScale(d.group))

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Visualzie graph
    // To DO
    vis.simulation
      .on("tick", ticked)
      .on("end", ticked)

    vis.Simulation
      .on("tick", Ticked)
      .on("end", Ticked)
    
    function ticked() {
      vis.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
      vis.node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      vis.tooltip
        .attr("x", d => d.x + 6)
        .attr("y", d => d.y - 3)
        .text(d => d.id);

    }

    function Ticked() {
      vis.Link
        .attr("x1", d => vis.gScale(d.source.x))
        .attr("y1", d => vis.gScale(d.source.y))
        .attr("x2", d => vis.gScale(d.target.x))
        .attr("y2", d => vis.gScale(d.target.y));

      vis.Node
        .attr("cx", d => vis.gScale(d.x))
        .attr("cy", d => vis.gScale(d.y));
    }
  }

  
  fade(e, opacity) {
    // To DO
    let vis = this;
    let hovernodeID = "null";

    vis.data.nodes.forEach( d => {
      if (e.offsetX > d.x - 7 && e.offsetX < d.x + 7 && e.offsetY > d.y - 7 && e.offsetY < d.y + 7){
        hovernodeID = d.id
      }
    })

    vis.node.style("opacity", d => {
      if (d.id == hovernodeID || vis.isConnected(d.id, hovernodeID)){
        return 1
      }
      else{
        return opacity
      }
    })
        
    vis.link.attr("stroke-opacity", d => {
      if (d.source.id == hovernodeID || d.target.id == hovernodeID){
        return 1
      }
      else{
        return opacity
      }
    })

    vis.tooltip.style("opacity", d => {
      if ((d.id == hovernodeID || vis.isConnected(d.id, hovernodeID)) && e.type == "mouseover"){
        return 1
      }
      else{
        return 0
      }
    })
    
  }

  isConnected(a, b) {
    // To DO
    let vis = this;
    for (const key in vis.linkedByIndex) {
      if (key == a + "," + b || key == b + "," + a){
        return true
      }
    }
    return false
  }
    
}