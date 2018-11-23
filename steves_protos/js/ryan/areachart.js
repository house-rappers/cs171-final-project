
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

AreaChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];

	this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

AreaChart.prototype.initVis = function(){
	var vis = this;

	// * TO-DO *
    vis.margin = {top: 30, right: 0, bottom: 30, left: 80};

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);


    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")

	// (Filter, aggregate, modify data)
	vis.wrangleData();
}


/*
 * Data wrangling
 */

AreaChart.prototype.wrangleData = function(){
	var vis = this;


	// * TO-DO *
    vis.displayData = vis.data


	// Update the visualization
	vis.updateVis();
}


/*
 * The drawing function
 */

AreaChart.prototype.updateVis = function(){
	var vis = this;
    console.log(d3.extent(vis.displayData, function(d) { return d.date; }));
	vis.x.domain(d3.extent(vis.displayData, function(d) { return d.date; }));
	vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.value; })])

	// * TO-DO *

    // SVG area path generator
    vis.area = d3.area()
        .x(function(d) { return vis.x(d.date); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.value); });

    // Draw area by using the path generator
    vis.svg.append("path")
        .datum(vis.displayData)
        .attr("fill", "#ccc")
        .attr("d", vis.area);


    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.select(".y-axis").call(vis.yAxis);



}

