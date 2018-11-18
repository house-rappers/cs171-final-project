var margin = { top: 40, right: 40, bottom: 60, left: 60 };

var width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#housing-crisis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var d = svg.append("g");

var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%m/%d/%Y");

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis");

var yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

var saData;
var nsaData; 

//Core function to load the FIFA data. 
loadData();

//Data loading and creation of a merged JSON object (using unused JSON properties).
function loadData() {

    queue()
        .defer(d3.csv, "data/hpi_sa.csv")
        .defer(d3.csv, "data/hpi_nsa.csv")
        .await(function (error, sa, nsa) {

            if (error) throw error;

            sa.forEach(function (d) {
                d.YEAR = parseDate(d.YEAR);

                d.USA = +d.USA;
                d.USA = Math.round(d.USA); 
            });

            nsa.forEach(function (d) {
                d.YEAR = parseDate(d.YEAR);

                d.USA = +d.USA;
                d.USA = Math.round(d.USA); 
            });

            saData = sa;
            nsaData = nsa;

            updateVisualization();

        });
}

//Core function that is called to update the visualization. 
function updateVisualization() {

    //Scoped variables for the time ranges.
    var timeRangePick = handlesSlider.noUiSlider.get();

    var lowerRange = Math.round(timeRangePick[0]);
    var upperRange = Math.round(timeRangePick[1]);

    //Gets the user selection from the select box.
    var selectBoxValue = document.getElementById("crisis");
    var selectedChartValue = selectBoxValue.options[selectBoxValue.selectedIndex].value;

    //console.log(selectedChartValue); 

    //Conditional execution based on user selections. 
    //Includes filtering logic to re-paint based on selected slider time range.
    if (selectedChartValue == "sa") {

        //console.log(saData);

        var filteredData = saData.filter(checkSelection);

        function checkSelection(data) {
            return formatDate(data.YEAR) >= lowerRange && formatDate(data.YEAR) <= upperRange;
        }

        console.log(filteredData);

        filteredData.sort(function (a, b) {
            return a.YEAR - b.YEAR;
        });

        //Line object.
        var lineChart = d3.line()
            .x(function (d) { return x(d.YEAR); })
            .y(function (d) { return y(d.USA); });

        //Scale domain and range
        x.domain([
            d3.min(filteredData, function (d) { return d.YEAR; }),
            d3.max(filteredData, function (d) { return d.YEAR; })
        ]);

        //x.domain([lowerRange, upperRange]); 
        y.domain([0, d3.max(filteredData, function (d) { return d.USA; })]);

        //X & y axes configuration, data binding and call to add to DOM.
        var xAxis = d3.axisBottom()
            .scale(x)
            .ticks(function (d) {
                return d.YEAR;
            })
            .ticks(5);

        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(function (d) {
                return d.USA;
            })
            .ticks(10);

        svg.select(".y-axis")
            .attr("transform", "translate(60,0)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(yAxis);

        svg.select(".x-axis")
            .attr("transform", "translate(60,400)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(xAxis);

        //Line graph creation (using path), data binding and addition to DOM.
        var group = g.selectAll("path")
            .data([filteredData]);

        group.enter().append("path")
            .merge(group)
            .transition()
            .duration(800)
            .attr("d", lineChart)
            .style("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 1);

        group.exit().remove();

        //Circles on line graph--with tooltip functionality.
        //Note that tooltip pattern is optimized for Internet Explorer.
        var dotChart = d.selectAll("circle")
            .data(filteredData);

        //console.log(dotChart);

        dotChart.enter().append("circle")
            .merge(dotChart)
            .attr("r", 1)
            .style("fill",
                function(d) {
                    if (d.USA < 200) {
                        return "red";
                    } else if (d.USA > 200) {
                        return "green";
                    }
                })
            .attr("cx", function(d) { return x(d.YEAR); })
            .attr("cy", function(d) { return y(d.USA); })
            .attr("transform", "translate(60,40)")
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.style("display", "inline");
                div.html("<div><span><p><strong>Year: </strong>" + formatDate(d.YEAR) + "</p>"
                    + "<p><strong>HPI: </strong>" + d.USA + "</p></span></div>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.style("display", "none");
            })
            .on("click", function (d) {
                //showEdition(d);
        });

        dotChart.exit().remove();

    } else if (selectedChartValue == "nsa") {

        var filteredData = nsaData.filter(checkSelection);

        function checkSelection(data) {
            return formatDate(data.YEAR) >= lowerRange && formatDate(data.YEAR) <= upperRange;
        }

        console.log(filteredData);

        filteredData.sort(function (a, b) {
            return a.YEAR - b.YEAR;
        });

        var lineChart = d3.line()
            .x(function (d) { return x(d.YEAR); })
            .y(function (d) { return y(d.USA); });

        x.domain([
            d3.min(filteredData, function (d) { return d.YEAR; }),
            d3.max(filteredData, function (d) { return d.YEAR; })
        ]);

        y.domain([0, d3.max(filteredData, function (d) { return d.USA; })]);

        var xAxis = d3.axisBottom()
            .scale(x)
            .ticks(function (d) {
                return d.YEAR;
            })
            .ticks(5);

        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(function (d) {
                return d.USA;
            })
            .ticks(10);

        svg.select(".y-axis")
            .attr("transform", "translate(60,0)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(yAxis);

        svg.select(".x-axis")
            .attr("transform", "translate(60,400)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(xAxis);

        var group = g.selectAll("path")
            .data([filteredData]);

        group.enter().append("path")
            .merge(group)
            .transition()
            .duration(800)
            .attr("d", lineChart)
            .style("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 1);

        group.exit().remove();

        var dotChart = d.selectAll("circle")
            .data(filteredData);

        dotChart.enter().append("circle")
            .merge(dotChart)
            .attr("r", 1)
            .style("fill", function (d) {
                if (d.USA < 200) {
                    return "red";
                } else if (d.USA > 200) {
                    return "green";
                }
            })
            .attr("cx", function (d) { return x(d.YEAR); })
            .attr("cy", function (d) { return y(d.USA); })
            .attr("transform", "translate(60,40)")
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.style("display", "inline");
                div.html("<div><span><p><strong>Year: </strong>" + formatDate(d.YEAR) + "</p>"
                        + "<p><strong>HPI: </strong>" + d.USA + "</p></span></div>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.style("display", "none");
            })
            .on("click", function (d) {
                //showEdition(d);
            });

        dotChart.exit().remove();
    } 
}

