
var formatYear = d3.timeFormat("%Y");
var formatPercent = d3.format(".1%");
var parseTime = d3.timeParse("%m/%d/%Y");

var moving = false;
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

ChartIncome = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data; //data passed to this
    this.displayData;

    // DEBUG RAW DATA
    console.log("ChartIncome");
    console.log(this.data);

    this.initVis();
}


ChartIncome.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

    vis.width = 720 - vis.margin.left - vis.margin.right;
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

    // SVG drawing bars
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .domain([d3.min(vis.data, function(d) { return d.Year; }),
            d3.max(vis.data, function(d) { return d.Year; }),
        ])
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .domain([d3.min(vis.data, function(d) { return d.realIncPC; }),
            d3.max(vis.data, function(d) { return d.realIncPC; }),
        ])
        .range([vis.height, 0]);

    vis.svg.append("linearGradient")
        .attr("id", "income-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", vis.y(0.1))
        .attr("x2", 0).attr("y2", vis.y(-0.1))
        .selectAll("stop")
        .data([
            {offset: "0", color: "red"},
            {offset: "50%", color: "gray"},
            {offset: "100%", color: "steelblue"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(formatYear);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(formatPercent);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0,0)");


    vis.wrangleData();
}

ChartIncome.prototype.wrangleData = function(){
    var vis = this;

    vis.displayData = vis.data;

    //debug
    console.log("Debug wrangleData");
    console.log(vis.displayData);

    // Update the visualization
    vis.updateVis();
}

ChartIncome.prototype.updateVis = function(){
    var vis = this;

    //debug
    console.log("Entering updateVis");
    console.log(vis.displayData);

    // Update x and y scale domains with updated data
    //define area
    var areaIncome = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.Year); })
        .y1(function(d) { return vis.y(d.realIncPC); })
        .y0(vis.y(0));

    //draw area

    vis.svg.append("path")
        .datum(vis.displayData)
        //.data(vis.displayData)
        //.enter()
        .attr("fill", "steelblue")
        .attr("class", "area")
        .attr("d", areaIncome);

    /*
        .on("mouseover", function(d) {
            var tipAge, tipPop;
            tipYear = "Year: " + d.Year;
            tipIncome = "Growth Rate: " + formatPercent(d.realIncPC);

            incTooltip.transition()
                .duration(200)
                .style("opacity", .8);
            incTooltip.html("<br/>" + tipYear + "<br/>" + tipIncome +  "<br/>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function() {
            incTooltip.transition()
                .duration(600)
                .style("opacity", 0);
        });
        */

        vis.svg.append("line")
        .attr("x1", 0)
        .attr("y1", vis.y(0))
        .attr("x2", vis.width)
        .attr("y2", vis.y(100000))
        .attr("stroke-width", 2.5)
        .attr("stroke", "gray")
        .attr("stroke-dasharray", ("3, 3"));

    vis.svg.append("text")
        .text("0 threshold")
        .attr("x", vis.width - 100)
        .attr("y", vis.y(0) - 5)
        .attr("fill", "gray");

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    console.log("updateVis done");

}
