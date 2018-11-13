var unicefData = []

addHierarchy()

d3.csv("data/unicef-beneficiaries.csv", function(data){
    unicefData = data;

    unicefData.forEach(function(d){
        d["2015"] = +d["2015"]
        d["2014"] = +d["2014"]
    })
    console.log(unicefData)
    createVis();
});

function createVis(){
    new BarChart("barchart1",unicefData,"2014");
    new BarChart("barchart2",unicefData,"2015");
}