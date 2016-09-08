
// import d3 from "../../node_modules/d3/build/d3.js";
import d3_overrides from "./utils/d3.overrides.js";
import MSBC from "MSBC";
import topojson from "topojson";


let instance;

const types = {
    BAR: "bar",
    BENCHMARK: "benchmark",
    DOTS: "dots"
};
class ChartsFactory {
    constructor () {
        if (!instance) {
            d3_overrides();
        }
        this.time = new Date();
        return this;
    }

    barChart (options) {
        var chartType1 = new MSBC.configTypes.X_Ordinal_Y_Lineal({
            container: options.container,
            domain: options.data.names,
            isGrouped: false,
            tickSize: 40,
            tickSpace: 5
        });
        var classification = this._classify(options.data.values);
        chartType1.add(MSBC.charts.Bar, {
            data: classification.grouped,
            type: types.BAR
        });
        classification.not_grouped.forEach((data) => {
            if (data.type === types.BENCHMARK) {
                chartType1.add(MSBC.charts.Benchmark, {
                    data: data,
                    type: types.BENCHMARK
                });
            } else if (data.type === types.DOTS) {
                chartType1.add(MSBC.charts.Dots, {
                    data: data,
                    type: types.DOTS
                });
            }
        });
        return chartType1;
    }

    horizontalBarChart (options) {
        var chartType2 = new MSBC.configTypes.AxesType2({
            container: options.container,
            domain: options.data.names,
            data: options.data.values[0].values,
            tickSize: 5,
            tickSpace: 5
        });
        var classification = this._classify(options.data.values);
        chartType2.add(MSBC.charts.Horizontal, {
            data: classification.grouped
        });

        return chartType2;
    }

    static get types () {
        return types;
    }

    _classify (data){
        var classified = {
            grouped: [],
            not_grouped: []
        };
        data.forEach(item => {
            if (item.type === types.BAR || item.type === undefined) {
                item.type = "bar";
                classified.grouped.push(item);
            } else {
                classified.not_grouped.push(item);
            }
        });
        return classified;
    }

    donut (options) {
        var type = new NoAxesCanvas(options);
        type.add(DonutChart, {
            data: options.data,
            initData: options.initData
        });
    }

    map (options) {
        d3.json("data/world-110m2.json", function (error, topology) {
            var type = new NoAxesCanvas(options);
            type.add(Map, {
                data: topology
            });
        });
    }

}

class NoAxesCanvas extends MSBC.Base {
    constructor(params) {
        super(params);
        this.init({
            container: params.container,
            event: this.event,
            axes: this.axes,
            margins: this.margins,
            className: this.className
        });
    }

    _afterAxisRendered () {}

    _setAxes() {}

    _updateAxes() {
        return Promise.resolve();
    }

}

class Map extends MSBC.ChartBase {
    constructor(params) {
        super(params);
    }

    render (options) {
        var dimensions = this.canvas.dimensions,
            width = dimensions.width,
            height = dimensions.height,
            topology = this.data,
            vis = this.canvas.svg
                .select(".mbc-charts-area")
                .append("g").classed("custom-map", true),
            projection, path, d;

        console.log(topology);
        d = (width > height) ? height : width;

        projection = d3.geo.mercator()
            .scale((d - 3) / (2 * Math.PI))
            .translate([width / 2, height / 2]);

        path = d3.geo.path()
          .projection(projection);

        var topo = topojson.object(topology, topology.objects.countries);

        vis.selectAll("path")
            .data(topo.geometries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "#333")
            .attr("fill", "#ddd")
            .on("mouseover", function (d) {
                console.log(d), this;
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("fill","#ff0000");
            })
            .on("mouseout", function (d) {
                console.log(d), this;
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("fill","#ddd");
            });
    }
}

class DonutChart extends MSBC.ChartBase {
    constructor(params) {
        super(params);
        this.initData = params.options.initData;
        this.innerRadius = params.options.innerRadius || 50;
        this.formatData();
    }

    formatData () {
        this.data = this.data.categories.map((category, i) => {
            var obj = {
                category,
                enabled: true
            };

            this.data.values.forEach((value) => {
                obj[value.name] = value.values[i];
            });
            return obj;
        });
    }

    render (options) {
        var dimensions = this.canvas.dimensions,
            width = dimensions.width,
            height = dimensions.height,
            radius = Math.min(width, height) / 2;

        var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - this.innerRadius);

        var pie = d3.layout.pie()
            .sort(null)
            .value(d => d[this.initData]);

        var vis = this.canvas.svg
            .select(".mbc-charts-area")
            .append("g").classed("donut", true)
                .attr("width", width)
                .attr("height", height);

        vis.append("g")
            .classed("title", true)
            .attr("transform", "translate(" + (width / 2) + "," + height / 2 + ")")
                .append("text")
                .attr("text-anchor", "middle")
                .style("stroke", "#333")
                .style("stroke-width", 2)
                .style("font-size", 20)
                .style("opacity", 1)
                .text(this.initData);

        var chart = vis
            .append("g")
            .classed("donut-chart", true)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        chart = chart.selectAll(".arc")
            .data(pie(this.data))
            .enter()
                .append("g")
                .classed("arc", true);

        var path = chart.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => this.colorScale(i))
            .attr("class", (d, i) => "arc-" + i)
            .each(function (d) { this._current = d; });

        var legendRectSize = 18;
        var legendSpacing = 8;

        var legends = vis.append("g")
            .classed("legends", true)
            .attr("transform", "translate(" + ((width / 2) +radius + 30) + "," + (20) + ")");

        var legend = legends.selectAll(".legend").data(this.data).enter()
            .append("g")
            .classed("legend", true)
            .attr("transform", (d, i) => "translate(0, " + (i * (legendRectSize + legendSpacing)) + ")");

        var uglySelf = this;
        legend.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .style("fill", (d, i) => this.colorScale(i))
            .style("stroke", (d, i) => this.colorScale(i))
            .on("click", function (label) {
                var rect = d3.select(this);
                var enabled = true;
                var totalEnabled = d3.sum(uglySelf.data.map(d => d.enabled ? 1 : 0));

                if (rect.classed("disabled")) {
                    rect.classed("disabled", false);
                } else {
                    if (totalEnabled < 2) {
                        return;
                    }
                    rect.classed("disabled", true);
                    enabled = false;
                }
                pie.value(d => {
                    if (d.category === label.category) {
                        d.enabled = enabled;
                    }
                    return d.enabled ? d[uglySelf.initData] : 0;
                });

                animate.call(uglySelf);
            });

        legend.append("text")
            .attr("x", legendRectSize + legendSpacing)
            .attr("y", legendRectSize)
            .text(function(d) { return d.category; });

        function animate() {
            path = path.data(pie(this.data));

            path.transition()
                .duration(750)
                .attrTween("d", function(d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });
        }
    }
}

export default ChartsFactory;
