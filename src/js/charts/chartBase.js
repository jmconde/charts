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
 * Abstract class representing a chart type.
 */
class ChartBase {
    /**
     * Creates an instance of ChartBase.
     *
     * @param {any} params
     */
    constructor(params) {
        this.canvas = params.canvas;
        this.colorScale = params.colorScale;
        this.axes = params.axes;
        this.event = params.event;

        this.data = params.data;
        this.type = params.type;
        this.index = params.index;
        this.animating = false;
        this.layer = this.canvas.svg
                .select(`.${defaultClasses.CHARTS_AREA}`)
                .append("g").classed(`${defaultClasses.LAYER}-${this.index}`, true);
        this._addListeners();
    }

    /**
     * Adds required listeners and call callback functios (onZoneMouseover, onZoneMouseout).
     */
    _addListeners () {
        this.event.dispatch.on(`zone_mouseover.${this.type}-${this.index}`, this.onZoneMouseover.bind(this));
        this.event.dispatch.on(`zone_mouseout.${this.type}-${this.index}`, this.onZoneMouseout.bind(this));
    }

    get className () {
        return `${defaultClasses.CHART}-${this.type}`;
    }

    /**
     * This is where the chart is rendered to the canvas's svg element.
     * @abstract
     */
    render () {
        console.warn("render not implemented", this.type);
    }

    /**
     * Zone hover in callback
     * @abstract
     */
    onZoneMouseover () {
        console.warn("onZoneMouseover not implemented", this.type);
    }

    /**
     * Zone hover out callback
     * @abstract
     */
    onZoneMouseout () {
        console.warn("onZoneMouseout not implemented", this.type);
    }
}

export default ChartBase;