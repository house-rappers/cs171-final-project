var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%m/%d/%Y");

var hpiHousingTrend;

loadData();

function loadData() {

    queue()
        .defer(d3.csv, "data/hpi_sa.csv")
        .defer(d3.csv, "data/hpi_nsa.csv")
        .await(wrangleData);
}

function wrangleData(error, sa, nsa) {
    if (!error) {

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

        //console.log(saData);
        //console.log(nsaData); 

        createVis();
    }
}

function createVis() {

    //console.log("createVis called"); 
    var housingTrend = new HousingTrend("housing-crisis", hpiHousingTrend, saData, nsaData);
}