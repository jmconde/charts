/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * A Manager that allows to store and manage all chart axes. Provides a way to access transversely the axes.
 */
class AxesManager {
    /**
     * Creates an instance of AxesManager.
     * Options:
     * <ul><li>event: An instance of the chart event bus</li>
     *
     * @param {Object} options - contains axes.
     */
    constructor (options) {
        this._event = options.event;
        this._axes = options.axes || {};
    }

    /**
     * Returns single axis if no axis object has been passed. Otherwise set the axis.
     * @param {Object} axis - d3 axis.
     */
    axis (axisName, axis) {
        if (!axisName) {
            return;
        }
        if (!axis) {
            return this._axes[axisName];
        }
        this._axes[axisName] = axis;
    }
    /**
     * Returns the axes hashmap.
     * @return {object}
     */
    get axes () {
        return this._axes;
    }
}

export default AxesManager;