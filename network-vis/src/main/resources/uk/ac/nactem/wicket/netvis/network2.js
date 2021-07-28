(function (window, undefined) {

    var simpleCollapsibleGraph = function(vizContainer, width, height,
            methodData, methodClick, nodeThreshold, edgeThreshold) {
        //interface variables
        var thisObject = this;
        this.modifyData = false;
        
        this.nodeColour = d3.scaleOrdinal(d3.schemeCategory10);
        this.edgeColour = d3.scaleOrdinal(d3.schemeAccent);
        
        this.vizContainer = vizContainer;
        this.width = width;
        this.height = height;
        
        //set the divs for the tooltips
        d3.select(vizContainer)
          .selectAll(".tooltip").data([1,2])
          .enter().append("div")	
          .attr("class", function(d){return "tooltip" + d;})
          .style("opacity", 0);
          
        this.divTooltip = d3.select(vizContainer)
          .select(".tooltip1");
          
        this.divTooltip2 = d3.select(vizContainer)
          .select(".tooltip2");
        
        this.svg = d3.select(vizContainer).append("svg").attr("width", width).attr("height", height);
        
        //set boundary
        this.svg.append("rect")
            .attr("width",width)
            .attr("height",height)
            .attr("stroke","black")
            .attr("fill","none")
            .attr("stroke-width","2px")
            .attr("x",0)
            .attr("y",0);
    
        const defs = this.svg.append("defs");
        defs.append("marker")
            .attr("id","arrow")
            .attr("viewBox","0 -10 20 20")
            .attr("refX",35)
            .attr("refY",0)
            .attr("markerWidth",10)
            .attr("markerHeight",15)
            .attr("orient","auto")
            .attr("fill","#999")
            .attr("stroke","#fff")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class","arrowHead");
        
        this.methodData = methodData;
        this.methodClick = methodClick;
        this.expandClick = function (id) {
            console.log("Double click");
            methodData(id, function(newData) {
                data = {};
                data.nodes = thisObject.data.nodes.concat(newData.nodes);
                data.edges = thisObject.data.edges.concat(newData.edges);
                data.edgeTypes = thisObject.data.edgeTypes;
                thisObject.ondata(data,thisObject.scoreThresholdOrig,thisObject.scoreThresholdOrigEdge);}
                );
        };
        
        this.nodeMenu = [
            {
                title: function(d) {
                    return d.title;
                }
            },
            {
                title: 'View',
                action: function(d, event) {
                    thisObject.methodClick(d.id);
                    
                }
            },
            {
                title: 'Expand',
                action: function(d, event) {
                    thisObject.expandClick(d.id);
                    
                }
            }
        ];
        d3.select(vizContainer)
            .append("p")
            .text("Node filter");
        d3.select(vizContainer)
            .append("input")
            .attr("id","sliderGraph").attr("name","sliderGraph").attr("type","range").attr("min","0").attr("max", "20").attr("step","0.1").attr("value",nodeThreshold)
            .on("change",thisObject.updateThresholdedGraph(this));
            
        d3.select(vizContainer)
            .append("p")
            .attr("class","nodeFilterValue")
            .text("Threshold: " + nodeThreshold);
            
        /*d3.select(vizContainer)
            .append("p")
            .text("Edge filter");
        d3.select(vizContainer)
            .append("input")
            .attr("id","sliderGraphEdge").attr("name","sliderGraphEdge").attr("type","range").attr("min","0").attr("max", "20").attr("step","0.5").attr("value",edgeThreshold)
            .on("change",thisObject.updateThresholdedGraphEdge(this));
            
        d3.select(vizContainer)
            .append("p")
            .attr("class","edgeFilterValue")
            .text("Threshold: " + edgeThreshold);*/
        
        d3.select(vizContainer)
            .append("div")
            .attr("id","zoomDiv")
            .text("Zoom level: 1.00x");
    };
    
    simpleCollapsibleGraph.prototype.updateThresholdedGraph = function(obj) {
        return function(d) {
            var newThreshold = this.value;
        
            d3.select(".nodeFilterValue").text("Threshold: " + newThreshold);
        
            obj.createSimpleCollapsibleGraph(obj.data, newThreshold, null);
        }
    };
    
    simpleCollapsibleGraph.prototype.updateThresholdedGraphEdge = function(obj) {
        return function(d) {
            var newThreshold = this.value;
        
            d3.select(".edgeFilterValue").text("Threshold: " + newThreshold);
        
            obj.createSimpleCollapsibleGraph(obj.data, null, newThreshold);
        }
    };
    
    simpleCollapsibleGraph.prototype.createSimpleCollapsibleGraph = function(dataRaw, scoreThresholdOrig, scoreThresholdOrigEdge){
        var thisObject = this;
        if (!dataRaw) {
            this.methodData(null,function(data) {thisObject.ondata(data,scoreThresholdOrig,scoreThresholdOrigEdge);});
        }
        else {
            thisObject.ondata(dataRaw,scoreThresholdOrig,scoreThresholdOrigEdge);
        }
    };
    
    simpleCollapsibleGraph.prototype.ondata = function(dataRaw,scoreThresholdOrig,scoreThresholdOrigEdge) {
        var thisObject = this;
        var maxScore = d3.max(dataRaw.nodes, function(d){
                                        return d.hasOwnProperty("score")?d.score:0;});
        
        var minScore = d3.min(dataRaw.nodes, function(d){
                                        return d.hasOwnProperty("score")?d.score:0;});
        
        var maxEdgeValue = d3.max(dataRaw.edges, function(d){
        return d.hasOwnProperty("value")?d.value:0;});
                                        
        var minEdgeValue = d3.min(dataRaw.nodes, function(d){
        return d.hasOwnProperty("value")?d.value:0;});
                                        
        d3.select("#sliderGraph")
            .attr("min",0.0)
            .attr("max", Math.floor(maxScore));
        
        var typeIds = [];
        var typeNames = [];
        dataRaw.edgeTypes.forEach(d => {typeIds.push(d.id); typeNames.push(d.name);});
        typeIds.sort();
        thisObject.edgeColour.domain(typeIds);
        
        this.svg.selectAll("mydots")
        .data(dataRaw.edgeTypes)
        .enter()
        .append("line")
          .attr("x1", 20)
          .attr("y1", function(d,i){ return 40 + i*25;}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("y2", function(d,i){ return 40 + i*25;})
          .attr("x2", 50)
          .style("stroke", function(d){ return thisObject.edgeColour(d.id);})
          .style("stroke-width", 5);

        // Add one dot in the legend for each name.
        this.svg.selectAll("mylabels")
          .data(dataRaw.edgeTypes)
          .enter()
          .append("text")
            .attr("x", 58)
            .attr("y", function(d,i){ return 45 + i*25;}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return thisObject.edgeColour(d.id);})
            .text(function(d){ return d.name;})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
        
        /*d3.select("#sliderGraphEdge")
            .attr("min",0.0)
            .attr("max", Math.floor(maxEdgeValue));*/
        
        this.nodeSize = d3.scaleLinear()
                        .domain([minScore,maxScore])
                        .range([5,15]);
        
        if (this.modifyData){
            data = {"nodes":{}, "edges":{}, "edgeTypes":[]};
            data.nodes = dataRaw.nodes;
            data.edges = dataRaw.edges.map(function(elem){
                return {"source": elem.from,"target": elem.to, "value":1,"properties": elem.properties};
            });
            data.edgeTypes = dataRaw.edgeTypes;
        }
        else{
            data = dataRaw;
        }
        this.data = data;
        //this.selectedIdsArray = selectedIdsArray;
        
        this.scoreThreshold = (scoreThresholdOrig==null)?this.scoreThreshold:scoreThresholdOrig;
        this.scoreThresholdEdge = scoreThresholdOrigEdge==null?this.scoreThresholdEdge:scoreThresholdOrigEdge;
        
        var filteredData = this.filterData(data, thisObject.scoreThreshold, thisObject.scoreThresholdEdge);
        
        var label = {
            'nodes': [],
            'links': []
        };
        
        filteredData.nodes.forEach(function(d, i) {
            label.nodes.push({node: d});
            label.nodes.push({node: d});
            label.links.push({
                source: i * 2,
                target: i * 2 + 1
            });
        });
        //var label = this.filterLabels(data, scoreThreshold);

        var labelLayout = d3.forceSimulation(label.nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("link", d3.forceLink(label.links).distance(0).strength(2));

        var graphLayout = d3.forceSimulation(filteredData.nodes)
            .force("charge", d3.forceManyBody().strength(-3000))
            .force("center", d3.forceCenter(thisObject.width / 2, thisObject.height / 2))
            .force("x", d3.forceX(thisObject.width / 2).strength(0.5))
            .force("y", d3.forceY(thisObject.height / 2).strength(0.5))
            .force("collide", d3.forceCollide(50))
            .force("link", d3.forceLink(filteredData.edges).id(
                                    function(d) {
                                        return d.id; })
                                    .distance(75).strength(0.5))
            .on("tick", ticked);
            
        this.graphLayout = graphLayout;
        this.labelLayout = labelLayout;

        var adjlist = [];

        filteredData.edges.forEach(function(d) {
            adjlist[d.source.index + "-" + d.target.index] = true;
            adjlist[d.target.index + "-" + d.source.index] = true;
        });

        function neigh(a, b) {
            return a == b || adjlist[a + "-" + b];
        }
        
        var containerToAdd = this.svg.selectAll("g").data([1]);
        
        containerToAdd.enter().append("g");
        
        var container = this.svg.select("g");

        this.svg.call(
            d3.zoom()
                .scaleExtent([.25, 4])
                .on("zoom", function() { 
                    d3.select("#zoomDiv")
                        .text("Zoom level: " + d3.event.transform.k.toFixed(2) + "x");
            container.attr("transform", d3.event.transform); })
        );

        /*var link = container.append("g").attr("class", "links")
            .selectAll("line")
            .data(data.edges)
            .enter()
            .append("line")
            .attr("stroke", "lightgray")
            .attr("stroke-width", "2px");
        
        link.on("mouseover", edgeFocus)
            .on("mouseout", edgeUnfocus); */
        //add links group the first time
        
        var linksToAdd = container.selectAll(".links").data([1]);
        linksToAdd.enter().append("g").attr("class", "links");
        
        var linkOrig = container.selectAll(".links")
            .selectAll("line")
            .data(filteredData.edges);
        
        var link = linkOrig.enter()
            .append("line")
            .merge(linkOrig)
            .attr("stroke", d => typeof(d.type)===undefined?"lightgray":thisObject.edgeColour(d.type))
            .attr("stroke-width", d => Math.max(2.0,Math.sqrt(d.value)))
            .attr("marker-end", function(d) {
                if (d.directed) {return "url(#arrow)";}
                return "";
            });
            
        container.selectAll(".links")
            .selectAll("line")
            .on("mouseover", edgeFocus)
            .on("mouseout", edgeUnfocus);
        
        linkOrig.exit().remove();
        
        var nodesToAdd = container.selectAll(".nodes").data([1]);
        nodesToAdd.enter().append("g").attr("class", "nodes");
        
        var nodeOrig = container.selectAll(".nodes")
            .selectAll("circle")
            .data(filteredData.nodes);

        var node = nodeOrig.enter()
            .append("circle")
            .merge(nodeOrig)
            .attr("r", function(d){
                return d.hasOwnProperty("score")? thisObject.nodeSize(d.score): thisObject.nodeSize(0);
            })
            .attr("opacity",0.7)
            .attr("fill", function(d) { return thisObject.nodeColour(parseInt(d.group)); });

        node.on("mouseover", focus)
            .on("mouseout", unfocus)
            .on("click", d3.contextMenu(thisObject.nodeMenu/*,{
		position: function(d) {
			var elm = this;
			var bounds = elm.getBoundingClientRect();

			// eg. align bottom-left
			return {
				top: bounds.top + bounds.height,
				left: bounds.left + bounds.width
			};
                    }
		}*/));
            
        nodeOrig.exit().remove();

        node.call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );
        
        var labelsToAdd = container.selectAll(".labelNodes").data([1]);
        labelsToAdd.enter().append("g").attr("class", "labelNodes");

        var labelNodeOrig = container.selectAll(".labelNodes")
            .selectAll("text")
            .data(label.nodes);
        
        var labelNode = labelNodeOrig.enter()
            .append("text")
            .merge(labelNodeOrig)
            .text(function(d, i) { return i % 2 === 0 ? "" : d.node.title.substring(0,32); })
            .style("fill", "#555")
            .style("font-family", "Arial")
            .style("font-size", 12)
            .style("pointer-events", "none"); // to prevent mouseover/drag capture
        
        labelNodeOrig.exit().remove();

        //node.on("mouseover", focus).on("mouseout", unfocus);

        function ticked() {

            node.call(updateNode);
            link.call(updateLink);

            labelLayout.alphaTarget(0.3).restart();
            labelNode.each(function(d, i) {
                if(i % 2 === 0) {
                    d.x = d.node.x;
                    d.y = d.node.y;
                }
                else {
                    var b = this.getBBox();

                    var diffX = d.x - d.node.x;
                    var diffY = d.y - d.node.y;

                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    //var shiftX = 30 * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    //shiftX = Math.max(-30, Math.min(0, shiftX));
                    var shiftY = 16;
                    this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
            });
            labelNode.call(updateNode);
        }

        function fixna(x) {
            if (isFinite(x)) return x;
            return 0;
        }

        function focus(d) {
            var index = d3.select(d3.event.target).datum().index;
            node.style("opacity", function(o) {
                return neigh(index, o.index) ? 1 : 0.1;
            });
            labelNode.attr("display", function(o) {
              return neigh(index, o.node.index) ? "block": "none";
            });
            link.style("opacity", function(o) {
                return o.source.index === index || o.target.index === index ? 1 : 0.1;
            });
            
            var modifTitle = "";
            var titleList = d.title.split(" ");
            var charCounter = 0;
            var margin = 80;
            titleList.forEach(function(word){
                modifTitle = modifTitle + word ;
                charCounter = charCounter + word.length;
                if (charCounter>margin){
                    modifTitle = modifTitle + "<br>";
                    charCounter = 0;
                }
                else{
                    modifTitle = modifTitle + " ";
                    charCounter = charCounter +word.length+1;
                }
               
            });
            
            thisObject.divTooltip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                
            thisObject.divTooltip.html(function(){
                return d.id + ": " + modifTitle + "<br/>" + "Score: " + d.score;
                    //return d.docId +": " + d.text + "<br/>"  + d.source;
            })
            .style("left", (d3.event.x + 30) + "px")
            .style("top", (d3.event.y - 28) + "px");
        }
        
        function edgeFocus(d) {
            
            var modifTitle = (typeof(d.title)==='undefined'?"<br>": d.title + "<br>") + "Source: " + d.source.name + "<br>Target: " + d.target.name + "<br>Value: " + d.value + "<br>Directed: " + d.directed;
            link.style("opacity", function(o) {
                return o === d || (typeof(d.title) !== 'undefined' && typeof(d.title) !== 'undefined' && o.title === d.title) ? 1 : 0.1;
            });
            thisObject.divTooltip2.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                
            thisObject.divTooltip2.html(function(){
                return modifTitle ;
                    //return d.docId +": " + d.text + "<br/>"  + d.source;
            })
            .style("left", (d3.event.x + 30) + "px")
            .style("top", (d3.event.y - 28) + "px");
        }
        
        function edgeUnfocus() {
            link.style("opacity", 1);
            thisObject.divTooltip2.transition()		
                    .duration(500)		
                    .style("opacity", 0);
        }

        function unfocus() {
           labelNode.attr("display", "block");
           node.style("opacity", 0.7);
           link.style("opacity", 1);
           
           thisObject.divTooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);
        }

        function updateLink(link) {
            link.attr("x1", function(d) { return fixna(d.source.x); })
                .attr("y1", function(d) { return fixna(d.source.y); })
                .attr("x2", function(d) { return fixna(d.target.x); })
                .attr("y2", function(d) { return fixna(d.target.y); });
        }

        function updateNode(node) {
            node.attr("transform", function(d) {
                return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
            });
        }

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) graphLayout.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    };
    
    simpleCollapsibleGraph.prototype.filterData = function(data, scoreThreshold, scoreThresholdEdge){
        var filteredData = {
            'nodes': [],
            'edges': []
        };
        var includedIds = {};
        //Filtering nodes based on score
        data.nodes.forEach(function(d, i) {
            var nodeScore = d.hasOwnProperty("score")? d.score:0;
            if (nodeScore >= scoreThreshold){
                filteredData.nodes.push(d);
                includedIds[d.id] = true;                
            }
            else{
                includedIds[d.id] = false;
            }
        });
        
        //Filtering links based on score
        data.edges.forEach(function(d, i) {
            //var sourceNodeScore = d.source.hasOwnProperty("score")? d.source.score:0;
            //var targetNodeScore = d.target.hasOwnProperty("score")? d.target.score:0;
            
            //if ((sourceNodeScore >= scoreThreshold)&&(targetNodeScore >= scoreThreshold)){
            if (d.value>=scoreThresholdEdge){
                if (typeof d.source === "object"){
                    if ((includedIds[d.source.id])&&(includedIds[d.target.id])){
                        filteredData.edges.push(d);
                    }
                }
                else{
                    if ((includedIds[d.source])&&(includedIds[d.target])){
                        filteredData.edges.push(d);
                    }
                }
            }
        });
        return filteredData;
    };
    
    simpleCollapsibleGraph.prototype.filterLabels = function(data, scoreThreshold){
        var label = {
            'nodes': [],
            'links': []
        };
        data.nodes.forEach(function(d, i) {
            count = 0;
            var nodeScore = d.hasOwnProperty("score")? d.score:0;
            if (nodeScore >= scoreThreshold){
                label.nodes.push({node: d});
                label.nodes.push({node: d});
                label.links.push({
                    source: count * 2,
                    target: count * 2 + 1
                });
                count = count + 1;
            }
        });
        return label;
    };
    
    // List functions you want other scripts to access
    window.simpleCollapsibleGraph = {
        simpleCollapsibleGraph: simpleCollapsibleGraph
    };
})(window);