var margin = { top: 40, right: 40, bottom: 60, left: 60 };

var width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg2 = d3.select("#choropleth-crisis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "steelblue");

//Tooltip div element.
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Define projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([600]);

//Color scale with domain and range for population.
var salesColorDomain = [200000, 250000, 300000, 400000, 500000];
var salesColorRange = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];

var salesColor = d3.scaleThreshold()
    .domain(salesColorDomain)
    .range(salesColorRange); 

//Define path generator, using the Albers USA projection
var path = d3.geoPath()
    .projection(projection);

queue()
    .defer(d3.csv, "data/current_sales_by_state_v2.csv")
    .defer(d3.json, "https://d3datafiles.blob.core.windows.net/coursedata/d3finalproject/us-states.json")
    .await(function(error, data, json) {

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

        //Bind data and create one path per GeoJSON feature
        svg2.selectAll("path")
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
                div.html("<div style='background-color:gray;border-style: solid; border-width:thin; border-color:black;'>"
                    + "<strong><span style='color:white;text-transform:capitalize'>"
                    + d.properties.name +
                    "</span></strong></div>")
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
    });

 //}


////Load in agriculture data
//d3.csv("data/current_sales_by_state_v2.csv", function (data) {

//    //Load in GeoJSON data
//    d3.json("https://d3datafiles.blob.core.windows.net/coursedata/d3finalproject/us-states.json", function (json) {

//        //Merge the ag. data and GeoJSON
//        //Loop through once for each ag. data value
//        for (var i = 0; i < data.length; i++) {

//            //Grab state name
//            var dataState = data[i].state;

//            //Grab data value, and convert from string to float
//            var dataValue = parseFloat(data[i].value);

//            //Find the corresponding state inside the GeoJSON
//            for (var j = 0; j < json.features.length; j++) {

//                var jsonState = json.features[j].properties.name;

//                if (dataState == jsonState) {

//                    //Copy the data value into the JSON
//                    json.features[j].properties.value = dataValue;

//                    //Stop looking through the JSON
//                    break;

//                }
//            }
//        }

//        //Bind data and create one path per GeoJSON feature
//        svg2.selectAll("path")
//            .data(json.features)
//            .enter()
//            .append("path")
//            .attr("d", path)
//            .style("fill", function (d) {
//                //Get data value
//                var value = d.properties.value;

//                if (value) {
//                    //If value exists…
//                    return salesColor(value);
//                } else {
//                    //If value is undefined…
//                    return "#ccc";
//                }
//            })
//            .on("mouseover", function (d) {
//                d3.select(this).transition().duration(300).style("opacity", 1);
//                div.transition()
//                    .duration(200)
//                    .style("opacity", 1);
//                div.style("display", "inline");
//                div.html("<div style='background-color:gray;border-style: solid; border-width:thin; border-color:black;'>"
//                        + "<strong><span style='color:white;text-transform:capitalize'>"
//                        + d.state + ": " + "$" + d.value +
//                        "</span></strong></div>")
//                    .style("left", (d3.event.pageX + 10) + "px")
//                    .style("top", (d3.event.pageY - 28) + "px");
//            })
//            .on("mouseout",
//                function () {
//                    d3.select(this)
//                        .transition().duration(300)
//                        .style("opacity", 0.8);
//                    div.transition().duration(300)
//                        .style("opacity", 0);
//                }); 
//    });

//});