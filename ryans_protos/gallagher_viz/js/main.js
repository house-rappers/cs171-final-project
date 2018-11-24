var studenLoanData = {'series':[]}
var homeAgeData = {};

var allHomeAgeData = [];
var stdDemoHomeData = [];
var totalHomePercentage = [];
var barchart = null;
var sankeyGraph = [];

queue()
    .defer(d3.csv, "data/FRB_G19.csv")
    .defer(d3.csv, "data/home_ownership_by_age.csv")
    .defer(d3.json, "data/sankey.json")
    .await(function(error, frbData,homeData,graph){

        // --> PROCESS DATA
        console.log(error);


        console.log(homeData);

        homeData.forEach(function(d,i){
            if (i==0){
                return;
            }
            allHomeAgeData.push(d);
            if (i >= homeData.length - 5){
                stdDemoHomeData.push(d);
            }
            homeAgeData[d["Group"]] = {};
            for (x=2000;x<=2017;x++){
                homeAgeData[d["Group"]][x.toString()] = {"owned":+d[x + " Owner"],"total":+d[x + " Total"]}
                if (d["Group"] == "Total"){
                    totalHomePercentage.push({"date":new Date(Date.parse(x)),"value":+(+d[x + " Owner"]/+d[x + " Total"]).toFixed(2)})
                }
            }



        });


        console.log("cleaned",allHomeAgeData);
        console.log("total",totalHomePercentage);

        frbData.forEach(function(d){
            if (isNaN(Date.parse(d["Series Description"]))){
                studenLoanData[d["Series Description"]] = d["Student loans owned and securitized, not seasonally adjusted level"];
            }else{
                if (!isNaN(d["Student loans owned and securitized, not seasonally adjusted level"]) && d["Student loans owned and securitized, not seasonally adjusted level"] != "") {
                    studenLoanData['series'].push({
                        "date": new Date(Date.parse(d["Series Description"])),
                        "value": +d["Student loans owned and securitized, not seasonally adjusted level"]
                    })
                }
            }
        });


        sankeyGraph = graph;

        console.log("student",studenLoanData);
        createVis()

    });

function updateBarchart(year){
    console.log(year)
    barchart.year = year
    barchart.updateVis()
}

function createVis(){

    linechart = new LineChart("line-chart",totalHomePercentage);
    barchart = new StackedBarChart("bar-chart",stdDemoHomeData);
    areachart = new AreaChart("area-chart",studenLoanData["series"]);
    sankeychart = new SankeyChart("sankey-chart",sankeyGraph);

}