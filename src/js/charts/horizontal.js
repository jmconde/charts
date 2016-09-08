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
import { ChartUtils } from "../utils/utils.js";


/**
 * Horizontal Bar Chart Implementation
 *
 * @extends {ChartBase}
 */
class HorizontalBarChart extends ChartBase{

    /**
     * Creates an instance of HorizontalBarChart.
     *
     * @param {any} options
     */
    constructor(options) {
        super(options);
    }

    /**
     * @override
     */
    render(options) {
        var axes = this.axes,
            yScale = axes.axis("y").scale(),
            xScale = axes.axis("x").scale(),
            data = this.data[0].values,
            chartArea = this.layer,
            barHeight = yScale.rangeBand(),
            barPadding = 6,
            hasNegative = ChartUtils.hasNegative(data),
            animation = (options && !options.animation) ? false : true;;

        var getClass = d => {
            if(hasNegative){
                return d >= 0 ? "h-bar-positive" : "h-bar-negative";
            }
            return "h-bar";
        };

        var draw = selection => {
            selection.attr("class", getClass)
                .attr("x", (d) => xScale(Math.min(0, d)))
                .attr("y", 6)
                .attr("transform", (d, i) => "translate(0," + i * barHeight + ")")
                .attr("width", d => animation ? 0 : Math.abs(xScale(d) - xScale(0)) )
                .attr("height", barHeight - barPadding);
            return selection;
        };

        var bar = chartArea.selectAll("rect").data(data);

        bar.call(draw)
            .enter().append("rect").call(draw);
        bar.exit().remove();

        if (animation) {
            bar.transition().duration(300)
                .attr("width", d => Math.abs(xScale(d) - xScale(0)));
        }
    }

    /**
     *
     *
     * @param {any} index
     */
    onMouseover(index) {
        this.canvas.svg.selectAll(`.${defaultClasses.CHART_GROUP}.${defaultClasses.FOCUS}-${index}`)
            .transition()
            .style("opacity", 0.5);
    }

    /**
     *
     *
     * @param {any} index
     */
    onMouseout(index) {
        this.canvas.svg.selectAll(`.${defaultClasses.CHART_GROUP}.${defaultClasses.FOCUS}-${index}`)
            .transition()
            .style("opacity", 1);
    }

    /**
     *
     *
     * @param {any} data
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

export default HorizontalBarChart;
