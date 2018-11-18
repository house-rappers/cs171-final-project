

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;


let x = d3.scaleTime().range([0, width]);
let x2 = d3.scaleTime().range([0, width]);
let y0 = d3.scaleLinear().range([height, 0]);
let y1 = d3.scaleLinear().range([height, 0]);
let y2 = d3.scaleLinear().range([height2, 0]);

let xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y0);
    yAxis1 = d3.axisRight(y1);

let brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

let zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

let area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.YEAR); })
    .y0(height2)
    .y1(function(d) { return y2(d.USA); });

// define the house price line
let priceLine = d3.line()
    .x(function(d) { return x(d.YEAR); })
    .y(function(d) { return y0(d.USA); });

// define the rates line
let rateLine = d3.line()
    .x(function(d) { return x(d.YEAR); })
    .y(function(d) { return y1(d.RATE); });


svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
//    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("data/data5.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        d.YEAR = new Date(d.YEAR);
        d.USA = +d.USA;
        d.RATE = +d.RATE;
    });

    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    x2.domain(x.domain());
    y0.domain([0, d3.max(data, function(d) {return Math.max(d.USA);})]);
    y1.domain([0, d3.max(data, function(d) {return Math.max(d.RATE); })]);
    y2.domain(y0.domain());


    focus.append("path")
        .data([data])
        .attr("class", "line1")
        .attr("d", priceLine);

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    focus.append("path")
        .data([data])
        .attr('class', 'line2')
        .attr('stroke', 'red')
        .attr('d', rateLine);

    focus.append('g')
        .attr('class', 'axisRed')
        .attr("transform", "translate( " + width + ", 0 )")
        .call(yAxis1);

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

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
    let s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".line1").attr("d", priceLine);
    focus.select(".line2").attr ("d", rateLine);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    let t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".line1").attr("d", priceLine);
    focus.select(".line2").attr("d", rateLine);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}