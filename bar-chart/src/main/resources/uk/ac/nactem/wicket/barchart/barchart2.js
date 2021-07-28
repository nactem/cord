(function (window, undefined) {
    var simpleYear = function (vizContainer, width, height, methodClick, textOn, methodSlider) {
        //interface variables
        this.modifyData = false;

        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.vizContainer = vizContainer;
        this.width = width;
        this.height = height;
        this.textOn = textOn;

        //set the divs for the tooltips
        d3.select(vizContainer)
                .selectAll(".tooltip").data([1, 2])
                .enter().append("div")
                .attr("class", function (d) {
                    return "tooltip" + d;
                })
                .style("opacity", 0);

        this.divTooltip = d3.select(vizContainer)
                .select(".tooltip1");

        this.svg = d3.select(vizContainer).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height]);
        
        this.svg.append("g")
                .attr("class", "barChart")
                .attr("fill", "steelblue");
        
        this.svg.append("g")
                .attr("class", "slider");

        this.methodClick = methodClick;
        this.methodSlider = methodSlider;
    };


    simpleYear.prototype.createSimpleYear = function (dataRaw, selectedIdsArray, drawZero) {

        var thisObject = this;

        var maxYear = d3.max(dataRaw, function (d) {
            return d.hasOwnProperty("year") ? d.year : 0;
        });

        var maxValue = d3.max(dataRaw, function (d) {
            return d.hasOwnProperty("number") ? d.number : 0;
        });

        var minYear = d3.min(dataRaw, function (d) {
            return d.hasOwnProperty("year") ? d.year : 9999;
        });

        if (drawZero) {
            //add years with no publication
            addMissingYears(dataRaw, minYear, maxYear);
        }

        //sort data by years
        dataRaw.sort(function (a, b) {
            return a.year - b.year;
        });

        var margin = ({top: 40, right: 0, bottom: 10, left: 50});

        //var barHeight = 25;
        var barHeight = d3.min([30, (thisObject.height - (margin.top + margin.bottom)) / dataRaw.length]);

        //var height = Math.ceil((dataRaw.length + 0.1) * barHeight) + margin.top + margin.bottom;
        var height = Math.ceil((dataRaw.length + 0.1) * barHeight) + margin.top + margin.bottom;

        d3.select(thisObject.vizContainer).selectAll(".yAxis").remove();
        d3.select(thisObject.vizContainer).selectAll(".xAxis").remove();

        var yAxis = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .attr("class", "yAxis")
                    .call(d3.axisLeft(y).tickFormat(i => dataRaw[i].year).tickSizeOuter(0));

        var xAxis = g => g
                    .attr("transform", `translate(0,${margin.top})`)
                    .attr("class", "xAxis")
                    .call(d3.axisTop(x).ticks(thisObject.width / 80))
                    .call(g => g.select(".domain").remove());

        var y = d3.scaleBand()
                .domain(d3.range(dataRaw.length))
                .rangeRound([margin.top, height - margin.bottom])
                .padding(0.1);

        var x = d3.scaleLinear()//d3.scaleLog()//
                .domain([0, maxValue])
                .range([margin.left, thisObject.width - margin.right]);

        var format = x.tickFormat(2, d3.format("f"));//, dataRaw.format)

        this.svg.select(".barChart")
                .selectAll("rect")
                .data(dataRaw)
                .join("rect")
                .attr("x", x(0))
                .attr("y", (d, i) => y(i))
                .attr("fill", d => d.group=="2"?"steelblue":"grey")
                .attr("width", d => x(d.number) - x(0))
                .attr("height", y.bandwidth())
                .on("mouseover", function (d) {
                    d3.select(this)
                            .style("stroke", "black");
                    //.style("stroke-width","2px");

                    thisObject.divTooltip.transition()
                            .duration(200)
                            .style("opacity", .9);

                    thisObject.divTooltip.html(function () {
                        return "Documents published in " + d.year + ": " + d.number;
                        //return d.docId +": " + d.text + "<br/>"  + d.source;
                    })
                            .style("left", (d3.event.pageX + 30) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                            .style("stroke", function (d) {
                                return "white";
                            });
                    thisObject.divTooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    //.style("stroke-width","0px");
                })
                .on("click", function (d) {
                    thisObject.methodClick(d.id);
                });

        if (this.textOn) {
            this.svg.append("g")
                    .attr("class", "textLabels")
                    .attr("fill", "white")
                    .attr("text-anchor", "end")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 12)
                    .selectAll("text")
                    .data(dataRaw)
                    .join("text")
                    .attr("x", d => x(d.number))
                    .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
                    .attr("dy", "0.35em")
                    .attr("dx", -4)
                    .text(d => d.number === 0 ? "" : format(d.number))
                    .call(text => text.filter(d => x(d.number) - x(0) < 20) // short bars
                                .attr("dx", +4)
                                .attr("fill", "black")
                                .attr("text-anchor", "start"));
        }

        this.svg.append("g")
                .attr("class", "xAxis")
                .call(xAxis);

        this.svg.append("g")
                .attr("class", "yAxis")
                .call(yAxis);

        //draw slider
        var radiousSlider = 7;
        this.svg.select(".slider")
                .selectAll("circle")
                .data([0, 1])
                .join("circle")
                .attr("r", radiousSlider)
                .attr("cx", x(0))
                .attr("cy", (d, i) => (d == 0) ? y(d) : y(dataRaw.length - 1) + y.bandwidth())
                .attr("class", function (d) {
                    return ((d == 0) ? "topSlider" : "bottomSlider");
                })
                .call(d3.drag()
                        .on("drag", dragged)
                        .on("end", dragend)
                        );
        this.svg.select(".slider")
                .selectAll("line")
                .data([0])
                .join("line")
                .attr("x1", x(0))
                .attr("x2", x(0))
                .attr("y1", y(0) + radiousSlider)
                .attr("y2", y(dataRaw.length - 1) + y.bandwidth() - radiousSlider)
                .attr("stroke-width", "3px")
                .attr("stroke", "cyan");
        accommodateSliders(dataRaw);
        function dragend() {
            //find select bars
            var selectedBars = [];
            thisObject.svg.selectAll("rect")
                    .each(function (d, i) {
                        if (d3.select(this).attr("fill") === "steelblue") {
                            selectedBars.push(d.id);
                        }
                    });
            thisObject.methodClick(selectedBars);
        }
        
        function accommodateSliders(dataset){
            var minimumYear = d3.min(dataset.filter(elem => elem.group === "2").map(elem => elem.year));
            var maximumYear = d3.max(dataset.filter(elem => elem.group === "2").map(elem => elem.year));
            
            var minimumYearIndex = dataset.findIndex(elem => elem.year === minimumYear);
            var maximumYearIndex = dataset.findIndex(elem => elem.year === maximumYear);
            
            var positionTopSlider = (minimumYearIndex===-1)?y(0):y(minimumYearIndex);
            var positionBottomSlider = (maximumYearIndex===-1)?y(dataset.length-1)+ y.bandwidth():y(maximumYearIndex) + y.bandwidth();
            
            //Adjust position sliders
            thisObject.svg.select(".topSlider").attr("cy", positionTopSlider);
            thisObject.svg.select(".bottomSlider").attr("cy", positionBottomSlider);
            
            //adjust line on the axis
            thisObject.svg.select(".slider").select("line")
                    .attr("y1",positionTopSlider + radiousSlider)
                    .attr("y2",positionBottomSlider - radiousSlider);
                    
            //adjust color for bars
            /*thisObject.svg.selectAll("rect")
                    .attr("fill", function(d){
                        var startVertRect = parseInt(d3.select(this).attr("y"));
                        var endVertRect = parseInt(d3.select(this).attr("y")) + y.bandwidth();
                        
                        if (positionTopSlider > endVertRect){
                            return "gray";
                        }
                        else{
                            if (positionBottomSlider < startVertRect){
                                return "gray";
                            }
                            else{
                                return "steelblue";
                            }
                        }
                        
                    });*/
        }

        function dragged() {
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var yCoord = coordinates[1];

            var yCoordTopSlider = parseInt(thisObject.svg.select(".topSlider").attr("cy"));
            var yCoordBottomSlider = parseInt(thisObject.svg.select(".bottomSlider").attr("cy"));


            if (this.className.baseVal === "topSlider") {
                yCoordTopSlider = yCoord < y(0) ? y(0) :
                        (yCoord > yCoordBottomSlider ? yCoordBottomSlider : yCoord); //lower limit
                thisObject.svg.select(".topSlider")
                        .attr("cy", yCoordTopSlider);
            }
            if (this.className.baseVal === "bottomSlider") {
                yCoordBottomSlider = yCoord > y(dataRaw.length - 1) + y.bandwidth() ? y(dataRaw.length - 1) + y.bandwidth() :
                        (yCoord < yCoordTopSlider ? yCoordTopSlider : yCoord); //upper limit
                thisObject.svg.select(".bottomSlider")
                        .attr("cy", yCoordBottomSlider);
            }


            thisObject.svg.select(".slider").select("line")
                    .attr("y1", yCoordTopSlider + radiousSlider)
                    .attr("y2", yCoordBottomSlider - radiousSlider);


            thisObject.svg.selectAll("rect")
                    .attr("fill", function (d) {
                        var startVertRect = parseInt(d3.select(this).attr("y"));
                        var endVertRect = parseInt(d3.select(this).attr("y")) + y.bandwidth();

                        if (yCoordTopSlider > endVertRect) {
                            return "gray";
                        } else {
                            if (yCoordBottomSlider < startVertRect) {
                                return "gray";
                            } else {
                                return "steelblue";
                            }
                        }

                    });
        }
        function addMissingYears(dataRaw, minYear, maxYear) {
            var extractAllYears = dataRaw.map(d => d.year);
            for (let step = minYear; step <= maxYear; step++) {
                if (!extractAllYears.includes(step)) {
                    dataRaw.push({"year": step, "number": 0});
                }
            }
        }
    };
// List functions you want other scripts to access
    window.simpleYear = {
        simpleYear: simpleYear
    };
})(window);