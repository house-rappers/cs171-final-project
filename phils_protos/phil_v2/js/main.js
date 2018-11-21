//Todo
//add title - done
//create basic vi - done
//create narrative - done
//add slider - done
//add tooltip - done
//add play-pause button - done
//add animation - done

// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%m/%e/%Y");
var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

// Variables for the visualization instances
var demDataPop, demDataInc, demDataAge;

//Define the div for the tooltip
var ageTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("id", "ageToolTip")
    .style("opacity", 0);

/*
var incTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("id", "incToolTip")
    .style("opacity", 0);
*/

loadData();

function loadData() {
    queue()
        .defer(d3.csv, "data/income.csv") //income growth rates, 1970 - 2017
        .defer(d3.csv,"data/age.csv") //populations of age groups and sex, 2010 - 2017
        .await(wrangleData);
}

function wrangleData(error, income, age) {
    if(!error){
        income.forEach(function(d){
            d.Year = parseDate(d.Year);
            d.realIncPC = +d.realIncPC; //real income per capita growth rate
            d.incPC = +d.incPC; //income per capita growth rate
            d.medInc = +d.medInc; //median income growth rate
        });

        age.forEach(function(d){
           d.Year = formatYear(parseYear(d.Year));
           d.Population = +d.Population;
        });

         age = d3.nest()
            //.key(function(d) { return d.Type; })
            .key(function(d) { return d.Year; })
            .key(function(d) { return d.Age; })
            .entries(age);

        //assign global variables
        demDataInc = income;
        demDataAge = age;

        //create the visualizations
        createVis();
    }
}

function createVis() {
    var chartInc = new ChartIncome("chartIncome", demDataInc);
    var chartAge = new ChartAge("chartAge", demDataAge);
}