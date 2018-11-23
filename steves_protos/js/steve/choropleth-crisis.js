var margin = { top: 10, right: 10, bottom: 10, left: 20 };

var width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#choropleth-crisis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "steelblue");

var lgnd = svg.append("g");
var txt = svg.append("g"); 

//Tooltip div element.
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Define projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([850]);

var lsW = 20, lsH = 20;

//Color scale with domain and range for population.
var salesColorDomain = [200000, 250000, 300000, 400000, 500000];
var salesColorRange = ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f']; 
var salesLegendLabel = ["< 200K", "250K+", "300K+", "400K+", "500K+"];     

var salesColor = d3.scaleThreshold()
    .domain(salesColorDomain)
    .range(salesColorRange); 

//Define path generator, using the Albers USA projection
var path = d3.geoPath()
    .projection(projection);

queue()
    .defer(d3.csv, "data/current_sales_by_state_v2.csv")
    .defer(d3.json, "https://d3datafiles.blob.core.windows.net/coursedata/d3finalproject/us-states.json")
    .defer(d3.csv, "data/top_25_us_cities_for_sales.csv")
    .await(function(error, data, json, topcities) {

        if (error) throw error;

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {

            //Grab state name
            var dataState = data[i].state;

            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].value);

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

                    //Stop looking through the JSON
                    break;

                }
            }
        }

        //console.log(json); 

        //Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                //Get data value
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return salesColor(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }
            })
            .on("mouseover", function (d) {
                d3.select(this).transition().duration(300).style("opacity", 1);
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.style("display", "inline");
                div.html("<div><span><p><strong>State: </strong>" + d.properties.name + "</p>" +
                    "<p><strong>AVG Value: </strong>" + "$" + d.properties.value + "</p>" +
                        "</span></div>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout",
            function () {
                d3.select(this)
                    .transition().duration(300)
                    .style("opacity", 0.8);
                div.transition().duration(300)
                    .style("opacity", 0);
            });

        svg.selectAll("circle")
            .data(topcities)
            .enter()
            .append("circle")
            .attr("cx",
                function(d) {
                    return projection([d.Long, d.Lat])[0];
                })
            .attr("cy",
                function(d) {
                    return projection([d.Long, d.Lat])[1];
                })
            .attr("r",
                function(d) {
                    return Math.sqrt(parseInt(d.Sales) * 0.0004);
                })
            .style("fill", "black")
            .style("stroke", "white")
            .style("stroke-width", 0.25)
            .style("opacity", 0.4)
            .append("title")
            .text(function(d) {
                return d.City + ": " + "$" + d.Sales; 
            }); 

        //Draw the legend for the population choropleth.

        var legend = lgnd.selectAll("rect")
            .data(salesColorDomain);

        legend.enter().append("rect")
            .merge(legend)
            .attr("class", "legend")
            .attr("x", 20)
            .attr("y", function (d, i) { return height - (i * lsW) - 2 * lsH; })
            .attr("width", lsW)
            .attr("height", lsH)
            .style("fill", function (d, i) { return salesColor(d); })
            .style("opacity", 0.8)
            .attr("transform", "translate(650, 40)");

        legend.exit().remove();

        var legendLabels = txt.selectAll("text")
            .data(salesLegendLabel);

        legendLabels.enter().append("text")
            .merge(legendLabels)
            .attr("x", 50)
            .attr("y", function (d, i) { return height - (i * lsH) - lsH - 4; })
            .text(function (d, i) { return salesLegendLabel[i]; })
            .attr("transform", "translate(650,40)");

        legendLabels.exit().remove(); 
    });