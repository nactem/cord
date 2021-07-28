(function (window, undefined) {

    var simpleBubble = function (colorMode) {
        //interface variables
        this.colorMode = colorMode; //"random", "mono" or "cvalue"

        //set this true if we need to change fields in the input data to reflect the semantics of the object
        this.modifyData = true;

        this.colorSelectedBubble = "orange";
        this.colorUnselectedBubble = "white";
    };

    simpleBubble.prototype.createSimpleBubbles = function (container, data,
            width, height, methodClick) {
        
        //set the div for thee tooltip
        d3.select(container)
                .selectAll(".tooltip1").data([1])
                .enter().append("div")
                .attr("class", "tooltip1")
                .style("opacity", 0);

        this.divTooltip = d3.select(container)
                .select(".tooltip1");

        if (this.modifyData) {
            data2 = data.map(function (elem) {
                return {"id": elem.id, "text": elem.text, "cvalue": elem.size, "documents": parseInt(elem.title.split("documents: ")[1]), "title": elem.title, "group": elem.group};
            });

            dataset = {"children": data2};
        } else {
            dataset = {"children": data};
        }

        //get maximum and minimum for the field used for the bubble color
        this.maxValue = d3.max(dataset.children, function (d) {
            return +d.cvalue;
        });
        this.minValue = d3.min(dataset.children, function (d) {
            return +d.cvalue;
        });

        this.maxColor = "steelblue";//"red";
        var thisObject = this;

        //used in cvalue mode (color proportional to 
        this.scaleColor = d3.scaleLinear()
                .domain([thisObject.minValue, thisObject.maxValue])
                .range([d3.rgb(thisObject.maxColor).brighter(1), thisObject.maxColor]);

        //used in random mode
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var bubble = d3.pack(dataset)
                .size([width, height])
                .padding(-1.0);

        d3.select(container).selectAll("svg").data([1]).enter()
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "bubble");
        //.merge(svg);

        var svg = d3.select(container).select("svg");

        var nodes = d3.hierarchy(dataset)
                .sum(function (d) {
                    return d.documents;
                });

        //UPDATES
        var node = svg.selectAll(".node")
                .data(bubble(nodes).descendants(), function (d) {
                    return d.data.id;
                });

        node.transition()
                .duration(500)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

        node.select("circle")
                .transition()
                .duration(500)
                .attr("r", function (d) {
                    return d.r;
                })
                .style("fill", function (d, i) {
                    if (d.data.group==="2") {
                        return thisObject.colorSelectedBubble;
                    } else if (thisObject.colorMode === "random") {
                        return color(i);
                    } else if (thisObject.colorMode === "cvalue") {
                        return thisObject.scaleColor(d.data.cvalue);
                    } else if (thisObject.colorMode === "mono") {
                        return thisObject.maxColor;
                    }
                })
                .style("stroke", function (d) {
                    return thisObject.colorUnselectedBubble;
                });
                
        node.select("text")
                .attr("dy", ".2em")
                .style("text-anchor", "middle")
                .text(function(d) {
                    //original
                    //return d.data.text.substring(0, d.r / 3.3);
                    //text wrap
                    return d.data.text + " " + d.data.documents;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function(d){
                    //original
                    //return d.r/5;
                    //text wrap
                    return 13;
                })
                .attr("fill", "white");

        //ENTER
        var nodeAdded = node.enter()
                .filter(function (d) {
                    return  !d.children;
                })
                .append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .on("mouseover", function (d) {
                    d3.select(this).select("circle")
                            .style("stroke", "black");
                    //.style("stroke-width","2px");

                    thisObject.divTooltip.transition()
                            .duration(200)
                            .style("opacity", .9);

                    thisObject.divTooltip.html(function () {
                        return d.data.text + "<br/>" + "Documents: " + d.data.documents + "<br/>" + "c-value: " + d.data.cvalue;
                        //return d.docId +": " + d.text + "<br/>"  + d.source;
                    })
                            .style("left", (d3.event.pageX + 30) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this).select("circle")
                            .style("stroke", function (d) {
                                return thisObject.colorUnselectedBubble;
                            });

                    thisObject.divTooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    //.style("stroke-width","0px");
                })
                .on("click", function (d) {
                    methodClick(d.data.id);
                });

        nodeAdded.append("circle")
                .attr("r", function (d) {
                    return d.r;
                })
                .style("fill", function (d, i) {
                    if (d.data.group==="2") {
                        return thisObject.colorSelectedBubble;
                    } else if (thisObject.colorMode === "random") {
                        return color(i);
                    } else if (thisObject.colorMode === "cvalue") {
                        return thisObject.scaleColor(d.data.cvalue);
                    } else if (thisObject.colorMode === "mono") {
                        return thisObject.maxColor;
                    }
                })
                .style("stroke-width", "2px")
                .style("stroke", function (d) {
                    return thisObject.colorUnselectedBubble;
                });


        nodeAdded.append("text")
                .attr("dy", ".2em")
                //.attr("y","0")
                .style("text-anchor", "middle")
                .text(function (d) {
                    //original
                    //return d.data.text.substring(0, d.r / 3.3);
                    //text wrap
                    return d.data.text + " " + d.data.documents;

                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function (d) {
                    //original
                    //return d.r/5;
                    //text wrap
                    return 13;
                })
                .attr("fill", "white");
        //original

        //original
        /*
         nodeAdded.append("text")
         .attr("dy", "1.3em")
         .style("text-anchor", "middle")
         .text(function(d) {
         return d.data.documents;//Count;
         })
         .attr("font-family",  "Gill Sans", "Gill Sans MT")
         .attr("font-size", function(d){
         return d.r/5;
         })
         .attr("fill", "white");*/

        node.exit().remove();

        d3.select(self.frameElement)
                .style("height", height + "px");

        function wrap(nodes) {
          nodes.each(function() {

            var text = d3.select(this).selectAll("text");
            var words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                width = d3.select(this).select("circle").attr("r")*1.7,
                diameter = d3.select(this).select("circle").attr("r") * 2,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", -1 + "em");
            var lineNum = 0;
            var fontSize;
            //remove number from last position
            var number = words[0];
            words = words.slice(1);
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));              
              if ((tspan.node().getComputedTextLength() > width) && (lineNum<2)){
                //string exceeded width
                if ((lineNum >=1)){//&&(words.length>0)){
                    //we are in line 2 and I have more than the document number to be fit
                    line.pop();
                    tspan.text(line.join(" ")+"...");
                    word = words[words.length-1];
                    words = [];
                    line = [];
                    //Check if after adding the "..." we exceeded the width of the diameter
                    fontSize = text.attr("font-size")
                        while (tspan.node().getComputedTextLength() > diameter){
                            fontSize = fontSize - 1;
                            text.attr("font-size", fontSize)
                        }
                }
                else{
                    if ((line.length == 1)){//&&(lineNum == 0)){
                        //if first word does not fit in the first line then reduce font size
                        fontSize = text.attr("font-size")
                        while (tspan.node().getComputedTextLength() > width){
                            fontSize = fontSize - 1;
                            text.attr("font-size", fontSize)
                        }
                        line.pop();                    
                        line = [];
                    }
                    else{
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                    }
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", 1* lineHeight + dy + "em").text(word);
                }
                lineNum = lineNum + 1;
                
              }
            }
            //add number as new line
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", 1* lineHeight + dy + "em").text(number);
          });
        }

        //text wrap        
        wrap(d3.select(container).selectAll(".node"));

    };
// List functions you want other scripts to access
    window.simpleBubble = {
        simpleBubble: simpleBubble
    };
})(window);