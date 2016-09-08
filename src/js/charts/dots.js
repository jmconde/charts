/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import ChartBase from "./chartBase.js";
import defaultClasses from "../config/classes.js";

/**
 * Dots chart implementation.
 *
 * @extends {ChartBase}
 */
class Dots extends ChartBase {
    /**
     * Creates an instance of Dots.
     *
     * @param {any} params
     */
    constructor(params) {
        super(params);
    }

    /**
     * @override
     */
    render(options) {
        var yScale = this.axes.axis("y").scale(),
            xScale = this.axes.axis("x").scale(),
            xDomain = xScale.domain(),
            width = xScale.rangeBand(),
            data = this.data,
            animation = (options && !options.animation) ? false : true;

        this.selection = this.layer
            .selectAll(`.${this.className}-${data.index}`)
            .data(data.values)
            .enter()
            .append("circle")
            .attr("class", (d, i) => `.${this.className} .${this.className}-${data.index} ${defaultClasses.FOCUS}-${i}`)
            .attrs({
                "cx": (d, i) => {
                    return xScale(xDomain[i]) + width / 2;
                },
                "cy": d => yScale(d),
                "r": d => (animation ? 0 : 0.3 * yScale(d)),
                "fill": this.colorScale(data.index)
            })
            .style("opacity", animation ? 0 : 1);

        if (animation) {
            this.selection.each(function () {
                d3.select(this)
                    .transition().duration((Math.random() * 500) + 400)
                    .attr("r", d => 0.3 * yScale(d))
                    .style("opacity", 1);
            });
        }
    }

    /**
     * @override
     */
    onZoneMouseover(index) {
        if (this.animating) {
            return;
        }
        var r = function () {
                return d3.select(this).attr("r");
            },
            r0 = function () {
                return d3.select(this).attr("r") * 1.5;
            };
        this.animating = true;
        this.canvas.svg.selectAll(`.${this.className}.${defaultClasses.FOCUS}-${index}`)
            .transition().duration(500)
            .attr("_r", r)
            .attr("r", r0)
            .attr("stroke-width", 1)
            .attr("stroke", "#333")
            .style("opacity", 0.5)
            .call(() => (this.animating = false));
    }

    /**
     * @override
     */
    onZoneMouseout(index) {
        var r = function () {
            return d3.select(this).attr("_r");
        };

        this.canvas.svg.select(`.${this.className}.${defaultClasses.FOCUS}-${index}`)
            .transition().duration(500)
            .attr("r", r)
            .attr("stroke-width", 0)
            .style("opacity", 1);
    }
}

export default Dots;