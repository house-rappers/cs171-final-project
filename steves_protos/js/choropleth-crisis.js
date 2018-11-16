var margin = { top: 40, right: 40, bottom: 60, left: 60 };

var width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg2 = d3.select("#choropleth-crisis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "steelblue");

//Define projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([600]);

//Define color
var color = d3.scaleQuantize()
    .range([
        "rgb(237,248,233)", "rgb(186,228,179)",
        "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"
    ]);

//Define path generator, using the Albers USA projection
var path = d3.geoPath()
    .projection(projection);

//Load in agriculture data
d3.csv("data/us-ag-productivity.csv", function (data) {

    //Set input domain for color scale
    color.domain([
        d3.min(data, function (d) { return d.value; }),
        d3.max(data, function (d) { return d.value; })
    ]);

    //Load in GeoJSON data
    d3.json("https://d3datafiles.blob.core.windows.net/coursedata/d3finalproject/us-states.json", function (json) {

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
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }
            });
    });

});