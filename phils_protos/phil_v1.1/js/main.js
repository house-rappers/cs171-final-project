//Todo
//add title
//create basic vi - done
//create narrative
//add slider
//add tooltip - done
//add play-stop button
//add animation
//add edge line to accentuate the change
//use jquery
//add colorbrewer and color legend
//add grid to vis

//add line charts for income distribution
//add line charts for for population growth rate

// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%m/%e/%Y");
var parseYear = d3.timeParse("%Y");
var formatYear = d3.timeFormat("%Y");

// Variables for the visualization instances
var demDataPop, demDataInc, demDataAge;

//Define the div for the tooltip
var ageTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

loadData();

function loadData() {
    queue()
        .defer(d3.csv, "data/population.csv") //population growth rate, 1901 - 2017
        .defer(d3.csv, "data/income.csv") //income growth rates, 1970 - 2017
        .defer(d3.csv,"data/age.csv") //populations of age groups and sex, 2010 - 2017
        .await(wrangleData);
}

function wrangleData(error, population, income, age) {
    if(!error){
        population.forEach(function(d){
           d.Date = parseDate(d.Date);
           d.Value = +d.Value; //population growth rate
        });

        income.forEach(function(d){
            d.Date = parseDate(d.Date);
            d.realIncPC = +d.realIncPC; //real income per capita growth rate
            d.incPC = +d.incPC; //income per capita growth rate
            d.medInc = +d.medInc; //median income growth rate
        });

        age.forEach(function(d){
           d.Year = formatYear(parseYear(d.Year));
           d.Population = +d.Population; //population by age and sex
        });

         age = d3.nest()
            //.key(function(d) { return d.Type; })
            .key(function(d) { return d.Year; })
            .key(function(d) { return d.Age; })
            .entries(age);

        //debug
        //console.log(population);
        //console.log(income);
        //console.log(age);

        //assign global variables
        demDataPop = population;
        demDataInc = income;
        demDataAge = age;

        //create the visualizations
        createVis();
    }
}

function createVis() {
    //chartPop = new ChartPopulation("popChart", demDataPop);
    //chartInc = new ChartIncome("incChart", demDataInc);
    var chartAge = new ChartAge("chartAge", demDataAge);
}