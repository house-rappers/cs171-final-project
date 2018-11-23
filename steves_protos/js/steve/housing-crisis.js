
HousingTrend = function (_parentElement, _data, _saData, _nsaData) {
    this.parentElement = _parentElement;
    this.data = _data; //data passed to this

    this.saData = _saData;
    this.nsaData = _nsaData; 

    this.initVis();
}

HousingTrend.prototype.initVis = function () {

    var vis2 = this;

    vis2.margin = { top: 40, right: 40, bottom: 60, left: 60 };

    vis2.width = 1000 - margin.left - margin.right;
    vis2.height = 500 - margin.top - margin.bottom;

    vis2.svg = d3.select("#housing-crisis").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    vis2.x = d3.scaleTime().range([0, width]);
    vis2.y = d3.scaleLinear().range([height, 0]);

    vis2.g = vis2.svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    vis2.d = vis2.svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

    vis2.xAxisGroup = vis2.svg.append("g")
        .attr("class", "x-axis axis");

    vis2.yAxisGroup = vis2.svg.append("g")
        .attr("class", "y-axis axis");

//    vis.updateVisualization();
//}

//HousingTrend.prototype.initVis = function () {

    var timeRangePick = handlesSlider.noUiSlider.get();

    var lowerRange = Math.round(timeRangePick[0]);
    var upperRange = Math.round(timeRangePick[1]);

    var selectBoxValue = document.getElementById("crisis");
    var selectedChartValue = selectBoxValue.options[selectBoxValue.selectedIndex].value;

    if (selectedChartValue == "sa") {

        //console.log(selectedChartValue);

        var filteredData = saData.filter(checkSelection);

        function checkSelection(data) {
            return formatDate(data.YEAR) >= lowerRange && formatDate(data.YEAR) <= upperRange;
        }

        filteredData.sort(function (a, b) {
            return a.YEAR - b.YEAR;
        });

        //console.log(filteredData);

        //Line object.
        var lineChart = d3.line()
            .x(function (d) { return vis2.x(d.YEAR); })
            .y(function (d) { return vis2.y(d.USA); });

        //Scale domain and range
        vis2.x.domain([
            d3.min(filteredData, function (d) { return d.YEAR; }),
            d3.max(filteredData, function (d) { return d.YEAR; })
        ]);

        //x.domain([lowerRange, upperRange]); 
        vis2.y.domain([0, d3.max(filteredData, function (d) { return d.USA; })]);

        //X & y axes configuration, data binding and call to add to DOM.
        var xAxis = d3.axisBottom()
            .scale(vis2.x)
            .ticks(function (d) {
                return d.YEAR;
            })
            .ticks(5);

        var yAxis = d3.axisLeft()
            .scale(vis2.y)
            .ticks(function (d) {
                return d.USA;
            })
            .ticks(10);

        vis.svg.select(".y-axis")
            .attr("transform", "translate(60,0)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(yAxis);

        vis.svg.select(".x-axis")
            .attr("transform", "translate(60,400)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(xAxis);

        var group = vis2.g.selectAll("path")
            .data([filteredData]);

        group.enter().append("path")
            .merge(group)
            .transition()
            .duration(800)
            .attr("d", lineChart)
            .attr("transform", "translate(20,0)")
            .style("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 1);

        group.exit().remove();

        var dotChart = vis2.d.selectAll("circle")
            .data(filteredData);

        dotChart.enter().append("circle")
            .merge(dotChart)
            .attr("r", 1)
            .style("fill",
            function (d) {
                if (d.USA < 200) {
                    return "red";
                } else if (d.USA > 200) {
                    return "green";
                }
            })
            .attr("cx", function (d) { return vis.x(d.YEAR); })
            .attr("cy", function (d) { return vis.y(d.USA); })
            .attr("transform", "translate(20,0)")
            .on("mouseover",
            function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.style("display", "inline");
                div.html(
                    "<div style='background-color:black;border-style: solid; border-width:thin; border-color:gray;'>" +
                    "<strong><span style='color:white;text-transform:capitalize'>" +
                    formatDate(d.YEAR) +
                    ": " +
                    d.USA +
                    "</span></strong></div>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout",
            function (d) {
                div.style("display", "none");
            });

        dotChart.exit().remove();

    } else if (selectedChartValue == "nsa") {

        console.log(selectedChartValue);

        var filteredData = nsaData.filter(checkSelection);

        function checkSelection(data) {
            return formatDate(data.YEAR) >= lowerRange && formatDate(data.YEAR) <= upperRange;
        }

        filteredData.sort(function (a, b) {
            return a.YEAR - b.YEAR;
        });

        console.log(filteredData);

        var lineChart = d3.line()
            .x(function (d) { return vis2.x(d.YEAR); })
            .y(function (d) { return vis2.y(d.USA); });

        vis2.x.domain([
            d3.min(filteredData, function (d) { return d.YEAR; }),
            d3.max(filteredData, function (d) { return d.YEAR; })
        ]);

        vis2.y.domain([0, d3.max(filteredData, function (d) { return d.USA; })]);

        var xAxis = d3.axisBottom()
            .scale(vis2.x)
            .ticks(function (d) {
                return d.YEAR;
            })
            .ticks(5);

        var yAxis = d3.axisLeft()
            .scale(vis2.y)
            .ticks(function (d) {
                return d.USA;
            })
            .ticks(10);

        vis2.svg.select(".y-axis")
            .attr("transform", "translate(60,0)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(yAxis);

        vis2.svg.select(".x-axis")
            .attr("transform", "translate(60,400)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .call(xAxis);

        var group = vis2.g.selectAll("path")
            .data([filteredData]);

        group.enter().append("path")
            .merge(group)
            .transition()
            .duration(800)
            .attr("d", lineChart)
            .attr("transform", "translate(20,0)")
            .style("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 1);

        group.exit().remove();

        var dotChart = vis2.d.selectAll("circle")
            .data(filteredData);

        dotChart.enter().append("circle")
            .merge(dotChart)
            .attr("r", 1)
            .style("fill",
            function (d) {
                if (d.USA < 200) {
                    return "red";
                } else if (d.USA > 200) {
                    return "green";
                }
            })
            .attr("cx", function (d) { return vis2.x(d.YEAR); })
            .attr("cy", function (d) { return vis2.y(d.USA); })
            .attr("transform", "translate(20,0)")
            .on("mouseover",
            function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.style("display", "inline");
                div.html(
                    "<div style='background-color:black;border-style: solid; border-width:thin; border-color:gray;'>" +
                    "<strong><span style='color:white;text-transform:capitalize'>" +
                    formatDate(d.YEAR) +
                    ": " +
                    d.USA +
                    "</span></strong></div>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout",
            function (d) {
                div.style("display", "none");
            });

        dotChart.exit().remove();
    }
}