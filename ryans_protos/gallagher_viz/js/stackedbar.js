
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

StackedBarChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];
    this.year = 2017;

	this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

StackedBarChart.prototype.initVis = function(){
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

    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.05)
        .align(0.1);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    // set the colors
    vis.color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

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

StackedBarChart.prototype.wrangleData = function(){
	var vis = this;


	// * TO-DO *
    vis.displayData = vis.data;


	// Update the visualization
	vis.updateVis();
}


/*
 * The drawing function
 */

StackedBarChart.prototype.updateVis = function(){
	var vis = this;
	vis.x.domain(vis.displayData.map(d => d.Group));
	vis.y.domain([0, 35000])

	// * TO-DO *

    var totalbars = vis.svg.selectAll(".totalbar")
        .data(vis.displayData);


    totalbars.enter().append("rect")
        .attr("class", "totalbar")

        .merge(totalbars)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) { return vis.height - vis.y(+d[vis.year + " Total"]); })
        .attr("x", function(d) { return vis.x(d["Group"]); })
        .attr("y", function(d) { return vis.y(+d[vis.year + " Total"]); })
        .style("fill", "black");

    totalbars.exit().remove();



        var bars = vis.svg.selectAll(".bar")
            .data(vis.displayData);


        bars.enter().append("rect")
            .attr("class", "bar")

            .merge(bars)
            .transition()
            .attr("width", vis.x.bandwidth())
            .attr("height", function(d) { return vis.height - vis.y(+d[vis.year + " Owner"]); })
            .attr("x", function(d) { return vis.x(d["Group"]); })
            .attr("y", function(d) { return vis.y(+d[vis.year + " Owner"]); })
            .style("fill", "red");

        bars.exit().remove();



    /*



         bars.enter().append("rect")
             .attr("class", "bar")
             .attr("x", function(d) { return vis.x(d["Group"]); })
             .attr("width", vis.x.bandwidth())
             .attr("y", function(d) { return vis.y(+d[vis.year + " Total"]); })

         vis.svg.selectAll(".bar2")
             .data(vis.displayData)
             .enter().append("rect")
             .attr("class", "bar2")
             .attr("x", function(d) { return vis.x(d["Group"]); })
             .style("fill", "red")
             .attr("width", vis.x.bandwidth())
             .attr("y", function(d) { return vis.y(+d[vis.year + " Owner"]); })
             .attr("height", function(d) { return vis.height - vis.y(+d[vis.year + " Owner"]); });
     */

    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.select(".y-axis").call(vis.yAxis);



}

