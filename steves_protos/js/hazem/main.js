var bisectDate = d3.bisector(function (d) { return d.YEAR; }).left;


var mysvg = d3.select("#line-chart").append("svg")
    .attr("width", 960)
    .attr("height", 500),
    margin = { top: 20, right: 20, bottom: 110, left: 40 },
    margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
    width = +mysvg.attr("width") - margin.left - margin.right,
    height = +mysvg.attr("height") - margin.top - margin.bottom,
    height2 = +mysvg.attr("height") - margin2.top - margin2.bottom;


var x = d3.scaleTime().range([0, width]);
var x2 = d3.scaleTime().range([0, width]);
var y0 = d3.scaleLinear().range([height, 0]);
var y1 = d3.scaleLinear().range([height, 0]);
var y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y0);
yAxis1 = d3.axisRight(y1);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) { return x2(d.YEAR); })
    .y0(height2)
    .y1(function (d) { return y2(d.USA); });

// define the house price line
var priceLine = d3.line()
    .x(function (d) { return x(d.YEAR); })
    .y(function (d) { return y0(d.USA); });

// define the rates line
var rateLine = d3.line()
    .x(function (d) { return x(d.YEAR); })
    .y(function (d) { return y1(d.RATE); });


mysvg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
//    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var focus = mysvg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = mysvg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("../data/data5.csv", function (error, data) {
    if (error) throw error;

    data.forEach(function (d) {
        d.YEAR = new Date(d.YEAR);
        d.USA = +d.USA;
        d.RATE = +d.RATE;
    });

    x.domain(d3.extent(data, function (d) { return d.YEAR; }));
    x2.domain(x.domain());
    y0.domain([0, d3.max(data, function (d) { return Math.max(d.USA); })]);
    y1.domain([0, d3.max(data, function (d) { return Math.max(d.RATE); })]);
    y2.domain(y0.domain());


    focus.append("path")
        .data([data])
        .attr("class", "line1")
        .attr("d", priceLine);

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "axis-title")
        // .attr("transform", "rotate(-90)")
        .attr("y", -30).attr("x", width - 100)
        .attr("dy", "1.91em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("(Timeline)");

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -10).attr("x", -30)
        .attr("dy", "1.91em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("(Average House Price)");

    focus.append("path")
        .data([data])
        .attr("class", "line2")
        .attr("stroke", "red")
        .attr("d", rateLine);

    focus.append("g")
        .attr("class", "axisRed")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(yAxis1).append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -30).attr("x", -30)
        .attr("dy", "1.91em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("(Mortgage Interest Rate)");

    // focus.selectAll('.recession')
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //     .attr('class','recession')
    //     .attr('fill', '#777')
    //     .attr('fill-opacity', '0.1')
    //     .attr('x', (d, i) => i + 10)
    //     .attr('y', 0)
    //     .attr('width', 10)
    //     .attr('height', height);

    var tooltip = focus.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    tooltip.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    tooltip.append("circle")
        .attr("r", 7.5);

    tooltip.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");


    focus.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function () { tooltip.style("display", null); })
        .on("mouseout", function () { tooltip.style("display", "none"); })
        .on("mousemove", mousemove);


    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    mysvg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.YEAR > d1.YEAR - x0 ? d1 : d0;
        console.log(d);
        console.log(x(d.YEAR));
        console.log(y0(d.USA));
        tooltip.attr("transform", "translate(" + x(d.YEAR) + "," + y0(d.USA) + ")");
        tooltip.select("text").text(function () { return d.YEAR; });
        tooltip.select(".x-hover-line").attr("y2", height - y0(d.USA));
        tooltip.select(".y-hover-line").attr("x2", width);
    }
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".line1").attr("d", priceLine);
    focus.select(".line2").attr("d", rateLine);
    focus.select(".axis--x").call(xAxis);
    mysvg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".line1").attr("d", priceLine);
    focus.select(".line2").attr("d", rateLine);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}
