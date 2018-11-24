
/*
 * SankeyChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

SankeyChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.year = 2017;

    this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

SankeyChart.prototype.initVis = function(){
    var vis = this;

    // * TO-DO *
    vis.margin = {top: 30, right: 0, bottom: 30, left: 80};

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");




    vis.units = "Widgets";


// format variables
    vis.formatNumber = d3.format(",.0f");    // zero decimal places
    vis.format = function(d) { return vis.formatNumber(d) + " " + vis.units; };
    vis.color = d3.scaleOrdinal(d3.schemeCategory20);


    vis.sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([vis.width, vis.height]);

    vis.path = vis.sankey.link();

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

SankeyChart.prototype.wrangleData = function(){
    var vis = this;


    // * TO-DO *
    vis.displayData = vis.data;


    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

SankeyChart.prototype.updateVis = function(){
    var vis = this;

    vis.sankey
        .nodes(vis.displayData.nodes)
        .links(vis.displayData.links)
        .layout(32);

// add in the links
    var link = vis.svg.append("g").selectAll(".link")
        .data(vis.displayData.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", vis.path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + vis.format(d.value); });

// add in the nodes
    var node = vis.svg.append("g").selectAll(".node")
        .data(vis.displayData.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

// add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", vis.sankey.nodeWidth())
        .style("fill", function(d) {
            return d.color = vis.color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) {
            return d.name + "\n" + vis.format(d.value); });

// add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < vis.width / 2; })
        .attr("x", 6 + vis.sankey.nodeWidth())
        .attr("text-anchor", "start");

// the function for moving the nodes
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                    0, Math.min(vis.height - d.dy, d3.event.y))
                ) + ")");

        vis.sankey.relayout();

        link.attr("d", vis.path);
    }



}

