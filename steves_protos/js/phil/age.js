
var formatAsThousands = d3.format(",");
var formatNumber = d3.format("d");
var moving = false;

ChartAge = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data; //data passed to this
    this.displayData = []; //data filtered by year for display

    // DEBUG RAW DATA
    //console.log("ChartAge");
    //console.log(this.data);

    this.initVis();
}

ChartAge.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

    vis.width = 720 - vis.margin.left - vis.margin.right;
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

    // SVG drawing bars
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleBand()
        .paddingInner(0.5)
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .domain([0, 25000000])
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(d3.format(".2s"));

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0,0)");

    //initialize and attach slider
    var yearRange = [];

    for (var i = 0; i < vis.data.length; i++){
        yearRange[i] = +vis.data[i].key;
    }

    //debug
    //console.log("year range");
    //console.log(yearRange);

    //create slider
    //Creation of the nouislider object.
    vis.ageSlider = document.getElementById("ageSlider");

    var minVal = d3.min(yearRange);
    var maxVal = d3.max(yearRange);

    noUiSlider.create(vis.ageSlider, {
        start: [minVal],
        range: {
            'min': minVal,
            'max': maxVal
        },
        step: 1,
        connect: true,
        pips: {
            mode: 'steps',
            stepped: true,
            density:10
        }
    });

    var currentVal = ageSlider.noUiSlider.get();
    var timer;
    var moving = false;
    var duration = 600;

    //bars
    vis.bars = vis.svg.selectAll("rect");
    var button = d3.select("#ageButton")
        .on("click", function() {
            //click triggers a loop through 2010 and 2017
            var button = d3.select(this);
            if (moving) {
                clearInterval(timer);
                button.text("Play");
                moving = false;
            } else {
                button.text("Pause");
                moving = true;
                var i = ageSlider.noUiSlider.get();
                timer = setInterval(function(){
                    if (i <= maxVal){
                        vis.ageSlider.noUiSlider.set(i);

                        //debug
                        //console.log(i);

                        i++;

                    } else {
                        if (i === maxVal + 1) {
                            setTimeout(function(){
                                i = minVal;
                            }, 1200);
                        }
                    }
                }, duration);
            }

            //console.log("Clicked!");
        });

    vis.ageSlider.noUiSlider.on('update', function (values, handle){
        values[handle].innerHTML = values[handle];

        //debug
        //console.log(handle);
        //console.log(values[handle]);

        var stringYear = d3.format("")(values[handle]);
        vis.wrangleData(stringYear);
    });


//    vis.wrangleData("2017");

}

ChartAge.prototype.wrangleData = function(myYear){
    var vis = this;

    //debug
    //console.log(myYear);

    vis.displayData = vis.data.filter(function(d){
        return d.key == myYear;
        })[0].values;

    //debug
    //console.log("Debug wrangleData");
    //console.log(vis.displayData);

    // Update the visualization
    vis.updateVis();
}

ChartAge.prototype.updateVis = function(){
    var vis = this;

    //debug
    //console.log("Entering updateVis");
    //console.log(vis.displayData);

    // Update x and y scale domains with updated data
    var ageRanges = [];
    for (var i = 0; i < vis.displayData.length; i++){
        ageRanges[i] = vis.displayData[i].key;
    }

    vis.x.domain(ageRanges);


    var retireLine = vis.svg.append("line")
        .attr("id", "retirementAgeLine")
        .attr("x1", vis.x("65to69"))
        .attr("y1", 30)
        .attr("x2", vis.x("65to69"))
        .attr("y2", vis.height)
        .attr("stroke-width", 2)
        .attr("stroke", "#ccc")
        .style("stroke-dasharray", ("3, 3"));

    var retireText = vis.svg.append("text")
        .text("US Avg Retirement Age")
        .attr("x", vis.x("65to69"))
        .attr("y", 30)
        .attr("stroke", "#ccc");

    // (2) Draw rectangles
    var bars = vis.svg.selectAll("rect")
        .data(vis.displayData);

    bars.on("mouseover", function(d) {
        var tipAge, tipPop;

        tipAge = "Age range: " + d.key;
        tipPop = "Population: " + formatAsThousands(d.values[0].Population);

        ageTooltip.transition()
            .duration(200)
            .style("opacity", .8);
        ageTooltip.html("<br/>" + tipAge + "<br/>" + tipPop +  "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
    })
        .on("mouseout", function() {
            ageTooltip.transition()
                .duration(600)
                .style("opacity", 0);
        });

    bars.enter()
        .append("rect")
        .attr("x", function(d, i) {
            return vis.x(d.key);
        })
        .merge(bars)
        .transition()
        .duration(600)
        .attr("y", function(d) {
            return vis.y(d.values[0].Population);
        })
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) {
            return vis.y(0) - vis.y(d.values[0].Population);
        })

        .attr("fill", "steelblue");

    bars.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    //debug
    //console.log("updateVis done");
}

//code editions
// 2018-11-19_added reference line and label for "US Avg Retirement Age"
// 2018-11-19_added setTimeOut to pause the animation