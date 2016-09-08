import Canvas from "./canvas.js";
import Event from "../utils/event.js";
import AxesManager from "./axesManager.js";
import defaultClasses from "../config/classes.js";
import Config from "../config/config.js";

/**
 * Abstract class representing a canvas type configuration.
 */
class Base {
    /**
     * Creates an instance of Base.
     *
     * @param {any} options
     */
    constructor (options) {
        if (!options) {
            throw new Error("Options required.");
        }
        this.canvas = null;
        this.colors = Config.colors;
        this.margins = Config.defaultMargins;
        this.options = options;
        this.rawData = [];
        this.event = new Event();
        this.axes = new AxesManager({
            event: this.event
        });
        this.count = 0;

        this.event.dispatch.on("axis_rendered", () => {
            this._initInteractions();
            this._afterAxisRendered();
            // console.log("before initLegend");
            // this._initLegend && this._initLegend();
        });
    }

    initializer (options) {
        if (!options) {
            throw new Error("Options required.");
        }
        this.canvas = null;
        this.colors = Config.colors;
        this.margins = Config.defaultMargins;
        this.options = options;
        this.rawData = [];
        this.event = new Event();
        this.axes = new AxesManager({
            event: this.event
        });

        this.event.dispatch.on("axis_rendered", () => {
            this._initInteractions();
            this._afterAxisRendered();
            // console.log("before initLegend");
            // this._initLegend && this._initLegend();
        });
    }

    /**
     * Initializer. Must be called at the end of implementations' constructor.
     */
    init (options) {
        this.canvas = new Canvas(options);
        this._setAxes();
        this._setColorScale();
        this.recalculate();
    }

    /**
     * Updates raw data and axes then adds a chart to the canvas.
     *
     * @param {ChartBase} chartClass
     * @param {Object} options
     */
    add (chartClass, options) {
        this._addRawData(options.data);
        var chart = new chartClass({
            data: options.data,
            canvas: this.canvas,
            axes: this.axes,
            options: options,
            colorScale: this.colorScale,
            event: this.event,
            type: options.type,
            index: this.count++
        });
        // chart.initializer();

        this._updateAxes().then(() => {
            this.canvas.add(chart);
        });
    }

    /**
     * Returns the color for a specified index.
     *
     * @param {Number} Index of the color you want to get.
     * @returns {String} Color string representation.
     */
    getColor (i) {
        return this.colors[i];
    }

    /**
     * Recalculates dimensions and redraw the canvas
     */
    recalculate () {
        this._setAxes();
        this._updateAxes().then(() => {
            this.canvas.redraw();
        });
    }

    /**
     * Initialize event handlers:
     */
    _initInteractions () {
        var zones = this.canvas.svg.selectAll(`.${defaultClasses.ZONE}`);
        zones.on("mouseover", (d,i) => {
            this._zoneMouseover(i);
            this.event.trigger("zone_mouseover", i);
        })
        .on("mouseout", (d,i) => {
            this._zoneMouseout(i);
            this.event.trigger("zone_mouseout", i);
        });

        d3.select(window)
            .on("resize", () => {
                this.recalculate();
            });
    }

    /**
     * Add charts data to the rawData array, Array is used to calculate domains
     * on certain charts.
     *
     * @param {any} data
     */
    _addRawData (data) {
        var index = this.rawData.length;
        if (Array.isArray(data)) {
            data.forEach(val => {
                val.index = index++;
                this.rawData = this.rawData.concat(val);
            });
        } else {
            data.index = index;
            this.rawData.push(data);
        }
    }

    /**
     * Set color scale for the chart.
     */
    _setColorScale () {
        this.colorScale = d3.scale.ordinal().range(this.colors);
    }

    /**
     * Intialize axes.
     * @abstract
     * @returns AxisManager
     */
    _setAxes() {
        throw new Error("_setAxes not implemented.");
    }
    /**
     * Called after axis are rendered ('axis_rendered' event)
     * @abstract
     */
    _afterAxisRendered () {
        throw new Error("_afterAxisRendered not implemented.");
    }
    /**
     * Called after charts are added to the canvas in order to recalculate scales.
     * @abstract
     * @return Promise
     */
    _updateAxes() {
        throw new Error("_updateAxes not implemented.");
    }

    /**
     *
     */
    focus(index) {
        this.canvas.charts.forEach(function (chart, i) {
            if (i !== index) {
                //chart.
                console.log(chart);
            }
        });
    }

    /**
     * Callend when mouse hovers in the event zone
     * @abstract
     *
    _zoneMouseover () {
        throw new Error("_zoneMouseover not implemented.");
    }
    /**
     * Called when mouse hovers out the event zone
     * @abstract
     *
    _zoneMouseout () {
        throw new Error("_zoneMouseout not implemented.");
    }*/
}

export default Base;