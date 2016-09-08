/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import defaultClasses from "../config/classes.js";


/**
 * Canvas is where all charts and other chart layers are being added,
 * also handles all the dimensions calculation.
 */
class Canvas{
    /**
     * Creates an instance of Canvas.
     *
     * @param {any} options
     */
    constructor (options) {
        // inicializa el canvas
        this.container = d3.select(options.container)
            .classed(defaultClasses.CHART, true)
            .classed(options.className, true);
        this.chartContainer = this.container.append("div").classed(defaultClasses.CONTAINER, true);
        this.elContainer = document.querySelector(options.container);
        this.elChartContainer = document.querySelector(options.container + " ." + defaultClasses.CONTAINER);
        this.charts = [];
        this.dimensions = {};
        this.event = options.event;
        this.axes = options.axes;
        this.margins = options.margins;
        this.tickSizes = {};

        this._calculateDimensions();
        this.svg = this._initCanvas();
    }


    /**
     * Adds a chart to the canvas and calls render method.
     *
     * @param {ChartBase} chart to add.
     * @returns {Canvas}
     */
    add (chart){
        if (chart) {
            chart.render();
            this.charts.push(chart);
        }
        return this;
    }

    /**
     * Redraws the canvas.
     *
     * @param {any} dimensions
     */
    redraw () {
        this._updateRoot();
        this.addAxes();
        this.charts.forEach(chart => {
            chart.render({animation: false});
        });
    }

    /**
     * Gets tick size for each axis orientation.
     */
    setTickSizes () {
        var axis, orient, tickSize;

        for(let axisName in this.axes.axes) {
            axis = this.axes.axis(axisName);
            orient = axis.orient();
            tickSize = axis.tickSize();
            this.tickSizes[orient] = tickSize;
        }
    }

    /**
     * Returns a specific tick size.
     */
    getTickSize (orient) {
        return this.tickSizes[orient] || 0;
    }

    /**
     * Adds axis into the canvas.
     */
    addAxes () {
        this.setTickSizes();
        var axis, svgAxis, orient, axisTransform,
            leftTickSize = this.getTickSize("left"),
            rightTickSize  = this.getTickSize("right")/*,
            topTickSize  = this.getTickSize("top"),
            bottomTickSize  = this.getTickSize("bottom")*/;

        this.svg.selectAll(`.${defaultClasses.AXIS}`).remove();

        for(let axisName in this.axes.axes) {
            axis = this.axes.axis(axisName);
            orient = axis.orient();

            svgAxis = this.svg.append("g")
                .classed({
                    [defaultClasses.AXIS]: true,
                    [defaultClasses.AXIS + "-" + axisName]: true
                });
            switch (orient) {
            case "left":
                axisTransform = `translate(${leftTickSize}, 0)`;
                break;
            case "bottom":
                axisTransform = `translate(${leftTickSize}, ${this.dimensions.height})`;
                break;
            case "right":
                axisTransform = `translate(${this.dimensions.width - rightTickSize}, 0)`;
                break;
            default:
                axisTransform = "translate(0, 0)";
                break;
            }
            svgAxis.attr("transform", `${axisTransform}`)
                .call(axis);
        }

        this.addGridArea();
        this.addChartArea();
        // this.addZones();
        this.event.trigger("axis_rendered");
    }
    /**
     * Adds back zones.
     */
    addBackZones () {
        var xScale = this.axes.axis("x").scale(),
            xDomain = xScale.domain(),
            yTickSize = this.axes.axis("y").tickSize();

        this.svg.select(`.${defaultClasses.BACKZONES}`)
            .remove();
        var zones = this.svg.append("g")
            .classed(defaultClasses.BACKZONES, true)
            .attr("transform", `translate(${yTickSize}, 0)`);

        zones.selectAll(`.${defaultClasses.BACKZONE}`)
            .data(xDomain).enter()
            .append("g")
                .attrs({
                    "transform": (d) => {
                        var x = xScale(d);
                        return `translate(${x}, 0)`;
                    },
                    "class": (d, i) => `${defaultClasses.BACKZONE}-${i}`
                });
    }

    /**
     * Adds event zones.
     */
    addZones () {
        var xScale = this.axes.axis("x").scale(),
            yScale = this.axes.axis("y").scale(),
            xDomain = xScale.domain(),
            xWidth = xScale.rangeBand(),
            yTickSize = this.axes.axis("y").tickSize();

        this.svg.select(`.${defaultClasses.ZONES}`)
            .remove();
        var zones = this.svg.append("g")
            .classed(defaultClasses.ZONES, true)
            .attr("transform", `translate(${yTickSize}, 0)`);

        zones.selectAll(`.${defaultClasses.ZONE}`)
            .data(xDomain).enter()
            .append("rect")
                .attrs({
                    "class": (d,i) => `${defaultClasses.ZONE} ${defaultClasses.ZONE}-${i}`,
                    x: d => (xScale(d)),
                    y: 0,
                    width: xWidth,
                    height: yScale(0),
                    opacity: 0.0
                });
    }

    /**
     * Adds charts area. This is the zone where all charts are drawn.
     */
    addChartArea () {
        var yTickSize = this.getTickSize("left");
        this.svg.select(`.${defaultClasses.CHARTS_AREA}`)
            .attr("transform", `translate(${yTickSize}, 0)`);
    }

    /**
     * Adds grid area/layer.
     */
    addGridArea () {
        var yTickSize = this.getTickSize("left");
        this.svg.select(`.${defaultClasses.GRID}`)
            .attr("transform", `translate(${yTickSize}, 0)`);
    }

    /**
     *
     *
     * @returns {object}
     */
    remove (/*chart*/) {
        // remueve un gáfico del canvas
        return this;
    }

    // private methods
    /**
     * Adds the svg to the container and append the canvas element.
     *
     * @param {any} chartContainer
     * @returns {object}
     */
    _initCanvas () {
        // Adding canvas group
        var canvas = this.chartContainer
            .append("svg").append("g")
            .classed(defaultClasses.CANVAS, true);

        canvas.append("g")
            .classed(defaultClasses.GRID, true);

        canvas.append("g")
            .classed(defaultClasses.CHARTS_AREA, true);

        return canvas;
    }

    /**
     * Updates the SVG element dimensions with the container's dimensions.
     */
    _updateRoot () {
        this._calculateDimensions();
        this.chartContainer.select("svg")
            .attr("width", this.dimensions.width + this.margins.left + this.margins.right)
            .attr("height", this.dimensions.height + this.margins.top + this.margins.bottom);
        this.chartContainer.select(`.${defaultClasses.CANVAS}`)
            .attr("transform", `translate(${this.margins.left}, ${this.margins.right})`);
    }
    /**
     * Calculates SVG dimensions based on container's
     */
    _calculateDimensions() {
        this.dimensions = {
            width: this.chartContainer[0][0].offsetWidth - this.margins.left - this.margins.right,
            height: this.elContainer.offsetHeight - this.margins.top - this.margins.bottom
        };
    }
}

export default Canvas;
