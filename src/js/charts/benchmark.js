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
 * Benchmark chart over two axes.
 *
 * @extends {ChartBase}
 */
class Benchmark extends ChartBase{
    /**
     * Creates an instance of Benchmark.
     *
     * @param {any} options
     */
    constructor(options) {
        super(options);
        options.height = 5; //TODO: parametrized height
        this.height = options.height;
        this.dy = Math.floor(this.height / 2); //TODO: parametrized height
    }

    /**
     * @override
     */
    render(options) {
        var yScale = this.axes.axis("y").scale(),
            xScale = this.axes.axis("x").scale(),
            xDomain = xScale.domain(),
            width = xScale.rangeBand(),
            animation = (options && !options.animation) ? false : true,
            benchmarks, draw;

        draw = selection => {
            selection.attr("class", (d, i) => `.${this.className} .${this.className}-${this.index} ${defaultClasses.FOCUS}-${i}`)
                .attrs({
                    "x": (d, i) => {
                        return xScale(xDomain[i]);
                    },
                    "y": d => yScale(d) - this.dy,
                    "width": animation ? 0 : width,
                    "height": this.height,
                    "fill": this.colorScale(this.index)
                })
                .style("opacity", animation ? 0 : 1);
        };

        benchmarks = this.layer
            .selectAll(`.${this.className}-${this.index}`)
            .data(this.data.values);

        benchmarks.call(draw)
            .enter().append("rect").call(draw);
        benchmarks.exit().remove();

        if (animation) {
            this.animating = true;
            benchmarks.each(function(){
                d3.select(this)
                    .transition().duration((Math.random()*100) + 200 )
                    .style("opacity", 1)
                    .attr("width", width)
                    .call((() => {
                        return (this.animating = !this.animating);
                    }).bind(this));
            });
        }
    }

    /**
     * @override
     */
    onZoneMouseover () {
        if (this.animating){
            return;
        }
        this.selection.transition().duration(300)
            .attr("fill", "green");
    }
    /**
     * @override
     */
    onZoneMouseout (index) {
        var selection = this.canvas.svg
            .selectAll(`.${this.className}.${defaultClasses.FOCUS}-${index}`);

        selection.transition().duration(300)
            .attr("fill", this.colorScale(this.index));
    }
}

export default Benchmark;
