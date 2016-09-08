/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Base from "./base.js";
import defaultClasses from "../config/classes.js";
import { ChartUtils } from "../utils/utils.js";

/**
 * Class representing a canvas type with one x axis linear and a y axis ordinal
 * @extends Base
 */
class AxesType2 extends Base {
    constructor (options) {
        super(options);
        this.xDomain = options.domain;
        this.yDomain = options.data;
        this.tickSize = options.tickSize || 0;
        this.tickSpace = options.tickSpace || 0;
        this.className = "mbc-chart-type-1";

        this.init({
            container: options.container,
            event: this.event,
            axes: this.axes,
            margins: this.margins,
            className: this.className
        });
    }

    /**
     * @override
     */
    _afterAxisRendered() {
        this._drawLines();
        this._makeup();
    }

    /**
     * @override
     */
    _setAxes() {
        var canvas = this.canvas,
            xScales = d3.scale.linear()
                .domain(d3.extent([0, 1]))
                .range([0, canvas.dimensions.width]),
            yScales = d3.scale.ordinal()
                .domain(this.yDomain)
                .rangeRoundBands([0, canvas.dimensions.height], 0);

        this.axes.axis("x", d3.svg.axis()
            .scale(xScales)
            .orient("bottom")
            .outerTickSize(0));

        this.axes.axis("y", d3.svg.axis()
            .scale(yScales)
            .orient("left")
            .outerTickSize(0));
    }

    /**
     * @override
     */
    _updateAxes () {
        return new Promise((resolve) =>{
            var x = this.axes.axis("x"),
                y = this.axes.axis("y"),
                allValues = ChartUtils.getAllValues(this.rawData),
                xScale = x.scale(),
                domain = ChartUtils.getDomain(allValues, 10),
                tickValues = ChartUtils.getTickValues(domain);

            xScale
                .domain(domain);

            x.scale(xScale)
                .tickValues(tickValues);

            y.tickValues(0);

            resolve();
        });
    }

    /**
     * Called after rendered.
     */
    _makeup() {
        var c = this.canvas.container;

        c.selectAll("text")
            .attr("y", 4)
            .attr("x", 0)
            .style("text-anchor", "end")
            .first()
                .style("text-anchor", "start")
    }

    /**
     * Draws grid lines
     */
    _drawLines() {
        var x = this.axes.axis("x"),
            ticks = x.tickValues(),
            xScale = x.scale();

        if (!ticks) {
            return;
        }
        this.canvas.svg
            .select(`.${defaultClasses.GRID}`)
            .selectAll("line").data(ticks)
            .enter()
            .append("line")
            .attr("x1", (d) => xScale(d))
            .attr("y1", 0)
            .attr("x2", (d) => xScale(d))
            .attr("y2", this.canvas.dimensions.height)
            .attr("stroke", "#DDDDDD")
            .attr("stroke-width", "1");
    }
}

export default AxesType2;
