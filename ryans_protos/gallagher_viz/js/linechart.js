
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

LineChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];

	this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

LineChart.prototype.initVis = function(){
	var vis = this;

	// * TO-DO *
    vis.margin = {top: 30, right: 5, bottom: 30, left: 80};

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
        .scale(vis.x)
        .ticks(vis.data.length);

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

LineChart.prototype.wrangleData = function(){
	var vis = this;


	// * TO-DO *
    vis.displayData = vis.data


	// Update the visualization
	vis.updateVis();
}


/*
 * The drawing function
 */

LineChart.prototype.updateVis = function(){
	var vis = this;
    console.log(d3.extent(vis.displayData, function(d) { return d.date; }));
	vis.x.domain(d3.extent(vis.displayData, function(d) { return d.date; }));
	vis.y.domain([0, 1])

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // SVG area path generator
    vis.line = d3.line()
        .defined(d => !isNaN(d.value))
        .x(d => vis.x(d.date))
        .y(d => vis.y(d.value))

    // Draw area by using the path generator
    vis.svg.append("path")
        .datum(vis.displayData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", vis.line);

    vis.svg.selectAll("circle")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "data-circle")
        .attr("r", 3)
        .attr("cx", function(d) { return vis.x(d.date); })
        .attr("cy", function(d) { return vis.y(d.value); })
        .on("click", function(d) {
            updateBarchart(d.date.getFullYear()+1);
        })
        .on("mouseover", function(d) {
            vis.div.transition()
                .duration(200)
                .style("opacity", .9);
            vis.div.html(d.date.getFullYear()+1 + "<br/>" + (d.value*100) + "% Total Home Ownership")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            vis.div.transition()
                .duration(500)
                .style("opacity", 0);
        });


    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.select(".y-axis").call(vis.yAxis);



}

