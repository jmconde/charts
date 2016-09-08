/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import defaultClasses from "../config/classes.js";
import ChartBase from "./chartBase.js";

/**
 * Bar chart implementation.
 *
 * @extends {ChartBase}
 */
class BarChart extends ChartBase{

    /**
     * Creates an instance of BarChart.
     *
     * @param {any} options
     */
    constructor(options) {
        super(options);
        this._isStacked = options.data.length > 1 && typeof stacked === "boolean" && options.stacked;
        this._isGrouped = !this.isStacked;
        this._formatData(options.data);
    }

    /**
     * @override
     */
    render(options) { // MUST:
        var yScale = this.axes.axis("y").scale(),
            xScale = this.axes.axis("x").scale(),
            x0Scale = d3.scale.ordinal()
                .domain(this._categories)
                .rangeRoundBands([0, xScale.rangeBand()]),
            vis = this.layer,
            animation = (options && !options.animation) ? false : true,
            group;

        if (this._isGrouped) {
            group = vis.selectAll(`.${defaultClasses.CHART_GROUP}`)
                .data(this.data)
                .enter()
                .append("g")
                .attr("class", (d, i) => `${defaultClasses.CHART_GROUP} ${defaultClasses.CHART_GROUP}-${i} ${defaultClasses.FOCUS}-${i}`)
                .attr("transform", d => "translate(" + xScale(d.series) + ",0)");

            /**
             *
             *
             * @param {any} d
             */
            var bars = group.selectAll("rect")
                .data(d => d.values)
                .enter().append("rect");

            bars.attr("width", x0Scale.rangeBand())
                .attr("x", d => x0Scale(d.category))
                .attr("y", d => yScale(animation ? 0 : Math.max(0, d.value)))
                .attr("height", d => (animation ? 0 : Math.abs(yScale(0) - yScale(d.value))))
                .attr("class", d => (this.className + "-" + d.index))
                .classed(this.className, true)
                .style("fill", (d, i) => this.colorScale(i))
                .on("mouseover", (d, i, j) => d3.select(`.${defaultClasses.CHART_GROUP}-${j} .${this.className}-${i}`).transition()
                        .style("opacity", "0.5")

        //             // tooltip
        //             this.tooltip = self._createTooltip(d)
        //                 .style("opacity", .9)
        //                 .style("left", (d3.event.pageX) + 10 + "px")
        //                 .style("top", (d3.event.pageY - 28) - 10 + "px");
                    )
        // .on("mousemove", function () {
        //             this.tooltip
        //                 .style("left", (d3.event.pageX) + 10 + "px")
        //                 .style("top", (d3.event.pageY - 28) - 10 + "px");
        //         })
                .on("mouseout", (d, i, j) => d3.select(`.${defaultClasses.CHART_GROUP}-${j} .${this.className}-${i}`).transition()
                        .style("opacity", "1")

        //             self._removeTooltip();
                );
        // } else if (this.isStacked) {
        //     group = vis.selectAll(".group")
        //         .data(this.data)
        //         .enter()
        //         .append("g")
        //         .attr("class", "group")
        //         .style("fill", d => this.getColor(d.name));
            if (animation) {
                bars.each(function(){
                    d3.select(this)
                        .transition().duration((Math.random()*500) + 200 )
                        // .transition().duration(500 * i)
                        .attr("y", d => yScale(Math.max(0, d.value)))
                        .attr("height", d => Math.abs(yScale(0) - yScale(d.value)));
                        // .each("end", ()=>console.log("Fin transition"));
                });
            }
        }

        //this._createLegend();
    }

    /**
     * @override
     */
    onZoneMouseover(index) {
        this.canvas.svg.selectAll(`.${defaultClasses.CHART_GROUP}.${defaultClasses.FOCUS}-${index}`)
            .transition()
            .style("opacity", 0.5);
    }

    /**
     * @override
     */
    onZoneMouseout(index) {
        this.canvas.svg.selectAll(`.${defaultClasses.CHART_GROUP}.${defaultClasses.FOCUS}-${index}`)
            .transition()
            .style("opacity", 1);
    }

    /**
     * This function format the data to make easier the render process.
     */
    _formatData(data) {
        var xDomain = this.axes.axis("x").scale().domain();
        this._categories = data.map(value => value.name);

        this.data = xDomain.map(function (series, i) {
            var item = { series };

            item.values = data.map(value => {
                return {
                    series: series,
                    category: value.name,
                    value: value.values[i],
                    index: value.index
                };
            });
            return item;
        });
    }
}

export default BarChart;
