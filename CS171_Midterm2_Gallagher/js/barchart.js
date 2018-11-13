

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BarChart = function(_parentElement, _data, _config){
	this.parentElement = _parentElement;
	this.data = _data;
	this.config = _config;
	this.displayData = _data;

	this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
	var vis = this;

    vis.margin = {top: 50, right: 80, bottom: 30, left: 120};

    vis.width = 600 - vis.margin.left - vis.margin.right;
	vis.height = 300 - vis.margin.top - vis.margin.bottom;


    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleBand()
        .range([vis.height,0])
        .padding(.1)


    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


	// (Filter, aggregate, modify data)
	vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
	var vis = this;

	// (1) Group data by key variable (e.g. 'electricity') and count leaves
	// (2) Sort columsn descending


	// * TO-DO *
    vis.displayData = vis.data;
    console.log(vis.displayData)
	// Update the visualization
	vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

BarChart.prototype.updateVis = function(){
	var vis = this;

	// (1) Update domains
	// (2) Draw rectangles
	// (3) Draw labels

    vis.x.domain([0,d3.max(vis.displayData.map(function(d) { return d["2015"]}).concat(vis.displayData.map(function(d) { return d["2014"]; })))+10]);
    vis.y.domain(vis.displayData.map(d => d.UNICEF_beneficiaries));

    console.log(vis.displayData.map(function(d) { return d[vis.config]; }))
	// * TO-DO *
    var rect = vis.svg.selectAll("rect")
        .data(vis.displayData,function(d){return d.UNICEF_beneficiaries});


    rect.enter()
        .append("rect")
        .attr("fill", function (d) {
            return "steelblue";
        })
        .attr("class", "bar")
        .merge(rect)
        .attr("y", d => vis.y(d.UNICEF_beneficiaries))
        .attr("height", vis.y.bandwidth())
        .attr("width", d => vis.x(d[vis.config]));

    vis.svg.selectAll("text")
        .data(vis.displayData)
        .enter()
        .append("text")
        .attr("alignment-baseline", "hanging")
        .style("font-size", "12px")
        .style("font-family","Times New Roman")
        .attr("x", d => vis.x(d[vis.config]))
        .attr("y", d => vis.y(d.UNICEF_beneficiaries))
        .text(d => (d[vis.config]));

    var title = vis.config;

	// Update the y-axis
	vis.svg.select(".y-axis").call(vis.yAxis);

    vis.svg.append("text")
        .attr("x", (vis.width/ 2))
        .attr("y", 20 - (vis.margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-family","Times New Roman")
        .text(title);

    rect.exit().remove();
}



/*
 * Filter data when the user changes the selection
 * Example for brushRegion: 07/16/2016 to 07/28/2016
 */

BarChart.prototype.selectionChanged = function(brushRegion){
	var vis = this;

	// Filter data accordingly without changing the original data

	
	// * TO-DO *


	// Update the visualization
	vis.wrangleData();
}
