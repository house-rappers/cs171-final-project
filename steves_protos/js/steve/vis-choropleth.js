
var mapData = [];
var africaGeoData = [];
var africaUNData = []
var countryDataByID = {};
var world = [];
var colorScaleValues = {
    "UN_Population":[1000001, 10000001, 40000001, 60000001, 100000001,150000001, 180000001],
    "Improved_Sanitation_2015":[0, 10, 25, 40, 50, 60,75,90,100],
    "Improved_Water_2015":[0, 10, 25, 40, 50, 60,75,90,100]}

var colorSchemeValues = {
    "UN_Population":colorbrewer.YlOrRd["7"],
    "Improved_Sanitation_2015":colorbrewer.RdYlBu["9"],
    "Improved_Water_2015":colorbrewer.RdYlBu["9"]}

d3.select("#data-view").on("change", updateChoropleth);

// --> CREATE svg DRAWING AREA
margin = { top: 0, right: 0, bottom: 60, left: 60 };

width = 650 - margin.left - margin.right,
height = 710 - margin.top - margin.bottom;

svg = d3.select("#choropleth").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoMercator()
    .center([20, 7])
    .scale(500)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var colorScale = d3.scaleThreshold();

var x = d3.scaleLinear()
    .range([0, 600]);

var xAxis = d3.axisBottom()
    .scale(x)
    .tickSize(13)

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Use the Queue.js library to read two files

queue()
  .defer(d3.json, "data/africa.topo.json")
  .defer(d3.csv, "data/global-water-sanitation-2015.csv")
  .await(function(error, mapTopJson, countryDataCSV){
    
    // --> PROCESS DATA
      mapData = mapTopJson;
      countryDataCSV.forEach(function (d) {
          d.UN_Population = + d.UN_Population;
          d.Improved_Sanitation_2015 = + d.Improved_Sanitation_2015;
          d.Improved_Water_2015 = + d.Improved_Water_2015;
          countryDataByID[d.Code] = d;
      });

      africaUNData = countryDataCSV.filter(d => d.WHO_region == "African");

      console.log(countryDataByID);

      africaGeoData = topojson.feature(mapData, mapData.objects.collection).features;

      console.log(africaGeoData);
    // Update choropleth
    updateChoropleth();
  });
    

function updateChoropleth() {
    var dataView = d3.select("#data-view").property("value");

    if (dataView == "UN_Population"){
        formatValue = d3.format(".2s");
        xAxis.tickFormat(function(d) { return formatValue(d)});
    }else{
        formatValue = d3.format(",.0%");
        xAxis.tickFormat(function(d) { return formatValue(d/100)});
    }
    colorScale
        .range(colorSchemeValues[dataView])
        .domain(colorScaleValues[dataView]);

    x.domain(d3.extent(colorScale.domain()));

    xAxis.tickValues(colorScale.domain())


    var africaMap = svg.selectAll("path")
        .data(africaGeoData)

  // --> Choropleth implementation
    africaMap.enter().append("path")
        .attr("d", path)
        .merge(africaMap)
        .style("fill", function (d) {
            var value = NaN;
            if (d.properties.adm0_a3_is in countryDataByID){
                value = countryDataByID[d.properties.adm0_a3_is][dataView];
            }

            if (!isNaN(value)){
                return colorScale(value);
            }else{
                return "grey";
            }
        })
        .on("mouseover", function(d) {
            d3.select(this).style("fill", "lightblue");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(function(x){
                if (countryDataByID[d.properties.adm0_a3_is]) {
                    return countryDataByID[d.properties.adm0_a3_is]["Country"] + "<p><p> UN Population:" + countryDataByID[d.properties.adm0_a3_is]["UN_Population"] + "<br> Improved Water Access:" + countryDataByID[d.properties.adm0_a3_is]["Improved_Water_2015"] + "%" + "<br> Improved Sanitation Access:" + countryDataByID[d.properties.adm0_a3_is]["Improved_Sanitation_2015"] + "%"
                }else{
                    return "Country Data Not Available"
                }
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", function (d) {
                    var value = NaN;
                    if (d.properties.adm0_a3_is in countryDataByID){
                        value = countryDataByID[d.properties.adm0_a3_is][dataView];
                    }

                    if (!isNaN(value)){
                        return colorScale(value);
                    }else{
                        return "grey";
                    }
                });
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });;


    svg.select('.key').remove();
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-40,0)");


    var rect = g.selectAll("rect")
        .data(colorScale.range().map(function(d, i) {
            return {
                x0: i ? x(colorScale.domain()[i - 1]) : x.range()[0],
                x1: i < colorScale.domain().length ? x(colorScale.domain()[i]) : x.range()[1],
                z: d
            };
        }))


    rect.enter().append("rect")
        .merge(rect)
        .style("opacity", 0.5)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .attr("height", 8)
        .attr("x", function(d) { return d.x0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .style("fill", function(d) { return d.z; });

    rect.exit().remove();


    g.call(xAxis);




}