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
 * Class representing a canvas type with one x axis ordinal and a y axis linear
 * @extends Base
 */
class X_Ordinal_Y_Lineal extends Base {
    /**
     * Creates an instance of X_Ordinal_Y_Lineal.
     * @constructor
     * @param {any} options
     */
    constructor (options) {
        super(options);
        this.xDomain = options.domain;
        this.tickSize = options.tickSize || 0;
        this.tickSpace = options.tickSpace || 0;
        this.className = "mbc-chart-x-ordinal-y-lineal";

        this.init({
            container: options.container,
            event: this.event,
            axes: this.axes,
            margins: this.margins,
            className: this.className
        }); // MUST be called at the end of contructor
    }

    /**
     * @override
     */
    _afterAxisRendered() {
        this._drawLines();
        this._makeup();
    }

    /**
     * Intialize axes:
     * - x with ordinal scale
     * - y with linear scale
     * @override
     */
    _setAxes() {
        var canvas = this.canvas,
            xScales = d3.scale.ordinal()
                .rangeRoundBands([0, canvas.dimensions.width - this.tickSize - this.tickSpace], 0.05) // TODO: Parametrized
                .domain(this.xDomain),
            yScales = d3.scale.linear()
                .domain([0, 1])
                .range([this.canvas.dimensions.height, 0]);

        this.axes.axis("x", d3.svg.axis()
            .scale(xScales)
            .tickSize(0));

        this.axes.axis("y", d3.svg.axis()
            .scale(yScales)
            .tickSize(this.tickSize)
            .orient("left"));
    }

    _initLegend () {
        console.log("Legend init");
    }

    /**
     * @override
     */
    _updateAxes () {
        return new Promise((resolve) =>{
            var allValues = ChartUtils.getAllValues(this.rawData),
                y = this.axes.axis("y"),
                yScale = y.scale(),
                domain = ChartUtils.getDomain(allValues, 100),
                tickValues = ChartUtils.getTickValues(domain);

            yScale
                .domain(domain);

            y.scale(yScale)
                .tickValues(tickValues);

            resolve();
        });
    }

    /**
     * Do additional visual fixes to the generated chart.
     * Helps to get the design requirements.
     */
    _makeup() {
        var c = this.canvas.container;
        c.selectAll(`.${defaultClasses.AXIS_Y} .tick text`)
            .attr("x", 0)
            .attr("y", 12)
                .first()
                .attr("y", -10);

        c.selectAll(`.${defaultClasses.AXIS_Y} .tick`).first().classed("dark", true);
        c.selectAll(`.${defaultClasses.AXIS_Y} .tick`).last().classed("dark", true);

        if (this.axes.axis("y").scale().domain()[0] < 0) {
            c.selectAll(`.${defaultClasses.GRID} line`).first().classed("dark", true);
        } else {
            c.selectAll(`.${defaultClasses.GRID} line`).first().remove();
        }
        c.selectAll(`.${defaultClasses.GRID} line`).last().classed("dark", true);
    }

    /**
     * Draws the grid lines
     */
    _drawLines() {
        var y = this.axes.axis("y"),
            ticks = y.tickValues(),
            yTickSize = y.tickSize(),
            yScale = y.scale();

        if (!ticks) {
            return;
        }
        this.canvas.svg
            .select(`.${defaultClasses.GRID}`)
            .selectAll("line").data(ticks)
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("y1", yScale)
            .attr("x2", this.canvas.dimensions.width - yTickSize)
            .attr("y2", yScale)
            .attr("stroke", "#dedede")
            .attr("stroke-width", "1");
    }

    /**
     * @override
     */
    _zoneMouseover(index) {
        var zone = this.canvas.svg
            .select(`.${defaultClasses.ZONE}-${index}`),
            backzone = this.canvas.svg.select(`.${defaultClasses.BACKZONE}-${index}`);


        var xScale = this.axes.axis("x").scale(),
            yScale = this.axes.axis("y").scale(),
            yRange = yScale.range(),
            width = xScale.rangeBand();

        // zone.transition().duration(400)
        //     .style("opacity", 0.1)
        //     .style("fill", null)
        //     .style("stroke", 1)
        //     .style("stroke-fill", "#666");

        var line = backzone.append("line")
            .attrs({
                "x1": (width / 2),
                "x2": (width / 2),
                "y1": 0, //yScale(d3.max(yRange)),
                "y2": 0,
                "stroke-width": 1,
                "stroke": "#aaa",
                "stroke-dasharray": "4, 5",
                opacity: 0.5
            });
        line.transition().duration(400)
            .attr("y2", yScale(d3.min(yRange)));
    }

    /**
     * @override
     */
    _zoneMouseout (index) {
        var backzone = this.canvas.svg.select(`.${defaultClasses.BACKZONE}-${index}`);

        // zone.transition().duration(400)
        //     .style("opacity", 0)
        //     .style("fill", null)
        //     .style("stroke", 0)
        //     .style("stroke-color", null);

        backzone.selectAll("line").remove();
    }

    // _createLegend() {
    //     var aEnter = this.canvas.container.select(".mbc-chart-legend")
    //         .selectAll("div")
    //         .data(this.options.data.values.map(d => d.name))
    //         .enter()
    //         .append("div")
    //         .attr("class", (d, i) => (defaultClasses.LEGEND_ITEM + "-" + i))
    //         .classed(defaultClasses.LEGEND_ITEM, true)
    //         .append("a");

    //     aEnter.append("span").attr("class", "mbc-chart-legend-square")
    //         .style("background-color", id => this.getColor(id));

    //     aEnter.append("p").html(id => id);

    //     aEnter
    //         .on("mouseover", (id, i) => this.focus(id, i))
    //         .on("mouseout", () => this.blur())
    //         .on("click", (id, i) => this.toggle(id, i));
    // }

    // _createTooltip(data) {
    //     var tooltip = d3.select(`.${defaultClasses.TOOLTIP}`);
    //     if (tooltip.empty()) {
    //         tooltip = d3.select("body")
    //             .append("div")
    //             .classed(defaultClasses.TOOLTIP, true)
    //             .style("opacity", 0);
    //     }
    //     tooltip.html(`<h5>${data.series}</h5><p>${data.name}: ${data.value}</p>`);
    //     return tooltip;
    // }
    // _removeTooltip() {
    //     d3.select(`.${defaultClasses.TOOLTIP}`)
    //         .transition()
    //         .style("opacity", 0)
    //         .remove();
    // }
}

export default X_Ordinal_Y_Lineal;
