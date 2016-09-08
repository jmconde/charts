(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.BaseCharts = factory());
}(this, function () { 'use strict';

  /**
   * morningstar-base-charts
   *
   * Copyright © 2016 . All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  var Config = {
      color: {
          pattern: ["#176298", '#812E8F', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896']
      },
      colors: ["#176298", '#812E8F', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896']
  };

  const BASE = "mbc";
  const CHART = BASE + "-chart";

  var defaultClasses = {
      AXIS: `${ BASE }-axis`,
      AXIS_X: `${ BASE }-axis-x`,
      AXIS_Y: `${ BASE }-axis-y`,
      BACKZONE: `${ BASE }-back`,
      BACKZONES: `${ BASE }-backs`,
      BAR: BASE + "-bar",
      BARCHART: BASE + "-bar-chart",
      CANVAS: BASE + "-canvas",
      CHART: CHART,
      CHART_GROUP: `${ CHART }-group`,
      CONTAINER: CHART + "-container",
      DECK: CHART + "-deck",
      FOCUS: `${ CHART }-focus`,
      GRID: `${ BASE }-grid`,
      LEGEND_ITEM: CHART + "-legend-item",
      LEGEND: CHART + "-legend",
      TITLE: CHART + "-title",
      TOOLTIP: `${ CHART }-tooltip`,
      CHARTS_AREA: `${ CHART }s-area`,
      ZONES: `${ CHART }-zones`,
      ZONE: `${ CHART }-zone`
  };

  /**
   *
   *
   * @class BaseChart
   */
  class BaseChart {
      constructor(options) {
          if (!options) {
              throw new Error("Options required.");
          }
          this.container = d3.select(options.container).classed(defaultClasses.CHART, true);
          this.chartContainer = this.container.append("div").classed(defaultClasses.CONTAINER, true);
          this.legendtContainer = this.container.append("div").classed(defaultClasses.LEGEND, true);
          this.options = options;
          this.colors = this.options.colors || Config.color.pattern;
          this.elContainer = document.querySelector(this.options.container);
          this.elChartContainer = document.querySelector(this.options.container + " ." + defaultClasses.CONTAINER);
      }

      /**
       *
       */
      render() {}

      getColor(id) {
          if (!this.seriesNames || !this.colors) {
              return "black";
          }
          return this.colors[this.seriesNames.indexOf(id)];
      }

      focus(id) {
          console.log("On focus", id);
      }

      blur() {
          console.log("On blur");
      }

      toggle(id) {
          console.log("On toggle", id);
      }

      _createCanvas() {
          this.canvas = this.chartContainer.append("svg").attr("width", this.width + this.margins.left + this.margins.right).attr("height", this.height + this.margins.top + this.margins.bottom).append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
      }

      _cleanCanvas() {
          this.canvas.html("");
      }

      _init() {
          this._formatData();
          this._setDimensions();
          this._createCanvas();
          this._setRanges();
          this._setAxes();
          this.render();
      }

      _makeup() {
          console.warn("_makeup() is not implemented.");
      }

      _createLegend() {
          console.warn("_createLegend() is not implemented.");
      }

      _setDimensions() {
          this.margins = { top: 20, right: 20, bottom: 20, left: 50 };
          this.width = this.elChartContainer.offsetWidth - this.margins.left - this.margins.right;
          this.height = this.elContainer.offsetHeight - this.margins.top - this.margins.bottom;
      }

      _setRanges() {
          console.warn("_setRanges() is not implemented.");
      }

      _setAxes() {
          console.warn("_setAxes() is not implemented.");
      }

      _formatData() {
          console.warn("_formatData() is not implemented.");
      }
  }

  const ChartUtils = {
      /**
       * Returns all values as an unique array.
       */
      getAllValues: data => {
          var allValues = [];
          data.forEach(function (value) {
              allValues = allValues.concat(value.values);
          });
          return allValues;
      },
      /**
       * Returns false if the array passed contains negative values.
       */
      hasNegative: allValues => {
          return d3.min(allValues) < 0;
      },
      /**
       * Calculates the domain fot a certain dataset.
       */
      getDomain: (allValues, hasNegative, round_to = 100) => {
          var domain, domain_i;
          domain = Math.ceil(d3.max(allValues, d => Math.abs(d)) / round_to) * round_to;
          domain_i = hasNegative ? domain * -1 : 0;
          return [domain_i, domain];
      },
      /**
       * Calculate tickvalues for a given dataset.
       */
      getTickValues: (domain, hasNegative) => {
          var divisor = hasNegative ? 2 : 4,
              // TODO: parametrized divisor
          domain_step = Math.abs(domain[0] - domain[1]) / divisor,
              value = hasNegative ? domain * -1 : 0,
              max = d3.max(domain, d => Math.abs(d)),
              tickValues = [];

          while (value < max) {
              tickValues.push(value);
              value += domain_step;
          }
          tickValues.push(value);
          return tickValues;
      }
  };

  class BarChart extends BaseChart {

    constructor(options) {
      super(options);
      this.container.classed(defaultClasses.BARCHART, true);
      this.isStacked = this.options.data.values.length > 1 && typeof this.options.stacked === "boolean" && this.options.stacked;
      this.isGrouped = !this.isStacked;
      this.showToolTip = false;
      this._init();

      window.addEventListener("resize", () => {
        this._setDimensions();
        this._setRanges();
        this._setAxes();
        this.render();
      });
    }

    render() {

      this._cleanCanvas();

      console.log(this.width, this.chartContainer);
      var self = this,
          vis = this.canvas;

      vis.append("g").attr("class", "x axis").attr("transform", "translate(0, " + this.height + ")").call(this.xAxis);

      vis.append("g").attr("class", "y axis").attr("transform", "translate(0, 0)").call(this.yAxis);

      this._drawLines();

      if (this.isGrouped) {
        var group = vis.selectAll(".group").data(this.data).enter().append("g").attr("class", "group").attr("transform", d => "translate(" + this.xScale(d.name) + ",0)");

        group.selectAll("rect").data(d => d.values).enter().append("rect").attr("width", this.x2Scale.rangeBand()).attr("x", d => this.x2Scale(d.name)).attr("y", d => this.yScale(Math.max(0, d.value))).attr("class", (d, i) => defaultClasses.BAR + "-" + i).classed(defaultClasses.BAR, true).attr("height", d => Math.abs(this.yScale(0) - this.yScale(d.value))).style("fill", d => this.getColor(d.name)).on("mouseover", function (d, ev, c) {
          console.log(this);
          d3.select(this).transition().style("opacity", "0.5");

          // tooltip
          this.tooltip = self._createTooltip(d).style("opacity", .9).style("left", d3.event.pageX + 10 + "px").style("top", d3.event.pageY - 28 - 10 + "px");
        }).on("mousemove", function (d, ev, c) {
          this.tooltip.style("left", d3.event.pageX + 10 + "px").style("top", d3.event.pageY - 28 - 10 + "px");
        }).on("mouseout", function (d) {
          d3.select(this).transition().style("opacity", "1");

          self._removeTooltip();
        });
      } else if (this.isStacked) {
        var group = vis.selectAll(".group").data(this.data).enter().append("g").attr("class", "group").style("fill", d => this.getColor(d.name));
      }

      this._makeup();
      this._createLegend();
    }

    focus(id, i) {
      this.container.selectAll(`.${ defaultClasses.BAR }, .${ defaultClasses.LEGEND_ITEM }`).transition().style("opacity", 0.5);
      this.container.selectAll(`.${ defaultClasses.BAR }-${ i }, .${ defaultClasses.LEGEND_ITEM }-${ i }`).transition().style("opacity", 1);
    }

    blur(id, i) {
      this.container.selectAll(`.${ defaultClasses.BAR }, .${ defaultClasses.LEGEND_ITEM }`).transition().style("opacity", 1);
    }

    _makeup() {
      var c = this.container;
      c.selectAll(".y .tick text").attr("x", 0).attr("y", 12);

      c.selectAll(".y .tick").first().classed("dark", true);
      c.selectAll(".y .tick").last().classed("dark", true);
      c.selectAll(".y .tick text").first().attr("y", -10);
      if (this.yScale.domain()[0] < 0) {
        c.selectAll(".grid line").first().classed("dark", true);
      } else {
        c.selectAll(".grid line").first().remove();
      }
      c.selectAll(".grid line").last().classed("dark", true);
    }

    _getTickValues(domain, hasNegative) {
      var divisor = hasNegative ? 2 : 4,
          domain_step = domain / divisor,
          value = hasNegative ? domain * -1 : 0;

      this.tickValues = [];

      while (value < domain) {
        this.tickValues.push(value);
        value += domain_step;
      }
      this.tickValues.push(value);
    }

    _setRanges() {
      var allValues = [],
          domain,
          round_to = 100,
          domain_i,
          tickValues,
          hasNegative;

      this.xScale = d3.scale.ordinal().rangeRoundBands([0, this.width], 0.1).domain(this.options.data.names);
      this.options.data.values.forEach(function (value) {
        allValues = allValues.concat(value.values);
      });
      hasNegative = d3.min(allValues) < 0;
      domain = Math.ceil(d3.max(allValues, d => Math.abs(d)) / round_to) * round_to;
      domain_i = hasNegative ? domain * -1 : 0;

      this._getTickValues(domain, hasNegative);

      this.yScale = d3.scale.linear().range([this.height, 0]).domain([domain_i, domain]);

      if (this.isGrouped) {
        console.log("series", this.seriesNames);
        this.x2Scale = d3.scale.ordinal().domain(this.seriesNames).rangeRoundBands([0, this.xScale.rangeBand()]);
      }
    }

    _setAxes() {
      console.log(this.tickValues);
      this.xAxis = d3.svg.axis().scale(this.xScale).tickSize(0);
      this.yAxis = d3.svg.axis().scale(this.yScale).tickSize(40).orient("left").tickValues(this.tickValues);
    }

    _formatData() {
      this.seriesNames = this.options.data.values.map(value => value.name);
      var rawData = this.options.data,
          names = rawData.names;

      var data = rawData.names.map(function (name, i) {
        var item = { name },
            values = [];

        item.values = rawData.values.map(value => {
          return {
            series: name,
            name: value.name,
            value: value.values[i]
          };
        });
        return item;
      });
      this.data = data;

      /*
        {
          names: ["Jan 2015", "Feb 2015", "March 2015", "April 2015", "May 2015", "June 2015", "July 2015"],
          values: [
              {
                  name: "Value 1",
                  values: [83.98, 36.54, 20.01, 19.87, 42.04, 62.85, 73.53]
              },
              {
                  name: "Value 2",
                  values: [45.34, 22.39, 54.00, 43.52, 38.6, 22.56, 30.89]
              }
          ]
        }
         {
          name: "Jan 2015",
          values: [
            {
              name: "Value 1",
              value: 83.98
            },
            {
              name: "Value 2",
              value: 45.34
            }
          ]
        }
      */
    }

    _drawLines() {
      var rango = this.xScale.range(),
          ticks = this.yAxis.tickValues();
      this.canvas.append("g").classed("grid", true).selectAll("line").data(ticks).enter().append("line").attr("x1", rango[0]).attr("y1", d => this.yScale(d)).attr("x2", rango[rango.length - 1] + this.xScale.rangeBand()).attr("y2", d => this.yScale(d)).attr("stroke", "#dedede").attr("stroke-width", "1");
    }

    _createLegend() {
      var aEnter = this.container.select(`.mbc-chart-legend`).selectAll("div").data(this.options.data.values.map(d => d.name)).enter().append("div").attr("class", (d, i) => defaultClasses.LEGEND_ITEM + "-" + i).classed(defaultClasses.LEGEND_ITEM, true).append("a");

      aEnter.append("span").attr("class", "mbc-chart-legend-square").style("background-color", id => this.getColor(id));

      aEnter.append("p").html(id => id);

      aEnter.on('mouseover', (id, i) => this.focus(id, i)).on('mouseout', (id, i) => this.blur()).on('click', (id, i) => this.toggle(id, i));
    }

    _createTooltip(data, ev) {
      var tooltip = d3.select(`.${ defaultClasses.TOOLTIP }`);
      if (tooltip.empty()) {
        tooltip = d3.select("body").append("div").classed(defaultClasses.TOOLTIP, true).style("opacity", 0);
      }
      tooltip.html(`<h5>${ data.series }</h5><p>${ data.name }: ${ data.value }</p>`);
      return tooltip;
    }
    _removeTooltip() {
      d3.select(`.${ defaultClasses.TOOLTIP }`).transition().style("opacity", 0).remove();
    }
  }

  var _charts = [];
  var _svg;
  var _dimensions;
var   _axes$1;
  var _event;
  class Canvas {
      constructor(options) {
          // inicializa el canvas
          _charts = [];
          _dimensions = options.dimensions;
          _svg = this._initCanvas(options.chartContainer);
          _event = options.event;
          _axes$1 = options.axes;

          this._addListeners();
      }

      // public methods

      /**
       * Adiciona un gráfico al canvas
       *
       * @param {any} chart
       * @returns
       // privates
      var _charts = []; */

      add(chart) {
          if (chart) {
              chart.render();
              _charts.push(chart);
          }
          return this;
      }

      redraw(dimensions) {
          console.log(dimensions);
          _dimensions = dimensions;
          this._updateRoot();
          this.addAxes();
          _charts.forEach(chart => {
              chart.render({ animation: false });
          });
      }

      get charts() {
          return _charts;
      }

      get svg() {
          return _svg;
      }

      get dimensions() {
          return _dimensions;
      }

      addAxes() {
          var yTickSize = _axes$1.y.tickSize();

          _svg.selectAll(`.${ defaultClasses.AXIS }`).remove();

          if (_axes$1) {
              if (_axes$1.x) {
                  _svg.append("g").classed({
                      [defaultClasses.AXIS]: true,
                      [defaultClasses.AXIS_X]: true
                  }).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, ${ _dimensions.height })`).call(_axes$1.x);
              }
              if (_axes$1.y) {
                  _svg.append("g").classed({
                      [defaultClasses.AXIS]: true,
                      [defaultClasses.AXIS_Y]: true
                  }).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, 0)`).call(_axes$1.y);
              }
          }
          this.addGridArea();
          this.addBackZones();
          this.addChartArea();
          this.addZones();
          _event.trigger("axis_rendered");
      }

      addBackZones() {
          var xScale = _axes$1.x.scale(),
              xDomain = xScale.domain(),
              yTickSize = _axes$1.y.tickSize();

          _svg.select(`.${ defaultClasses.BACKZONES }`).remove();
          var zones = _svg.append("g").classed(defaultClasses.BACKZONES, true).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, 0)`);

          zones.selectAll(`.${ defaultClasses.BACKZONE }`).data(xDomain).enter().append("g").attrs({
              "transform": d => {
                  var x = xScale(d);
                  return `translate(${ x }, 0)`;
              },
              "class": (d, i) => `${ defaultClasses.BACKZONE }-${ i }`
          });
      }

      addZones() {
          var xScale = _axes$1.x.scale(),
              yScale = _axes$1.y.scale(),
              xDomain = xScale.domain(),
              xWidth = xScale.rangeBand(),
              yTickSize = _axes$1.y.tickSize();

          _svg.select(`.${ defaultClasses.ZONES }`).remove();
          var zones = _svg.append("g").classed(defaultClasses.ZONES, true).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, 0)`);

          zones.selectAll(`.${ defaultClasses.ZONE }`).data(xDomain).enter().append("rect").attrs({
              "class": (d, i) => `${ defaultClasses.ZONE } ${ defaultClasses.ZONE }-${ i }`,
              x: d => xScale(d),
              y: 0,
              width: xWidth,
              height: yScale(0),
              opacity: 0.0
          });
      }

      addChartArea() {
          var yTickSize = _axes$1.y.tickSize();
          _svg.select(`.${ defaultClasses.CHARTS_AREA }`).remove();
          _svg.append("g").classed(defaultClasses.CHARTS_AREA, true).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, 0)`);
      }

      addGridArea() {
          var yTickSize = _axes$1.y.tickSize();
          _svg.select(`.${ defaultClasses.GRID }`).remove();
          _svg.append("g").classed(defaultClasses.GRID, true).attr("transform", `translate(${ _dimensions.margins.left + yTickSize }, 0)`);
      }

      remove() /*chart*/{
          // remueve un gáfico del canvas
          return this;
      }

      // private methods
      _initCanvas(chartContainer) {
          this._root = chartContainer.append("svg").attr("width", _dimensions.width + _dimensions.margins.left + _dimensions.margins.right).attr("height", _dimensions.height + _dimensions.margins.top + _dimensions.margins.bottom);
          return this._root.append("g").classed(defaultClasses.CANVAS, true).attr("transform", `translate(${ _dimensions.margins.left }, ${ _dimensions.margins.right })`);
      }

      _updateRoot() {
          this._root.attr("width", _dimensions.width + _dimensions.margins.left + _dimensions.margins.right).attr("height", _dimensions.height + _dimensions.margins.top + _dimensions.margins.bottom);
          this._root.select(`.${ defaultClasses.CANVAS }`).attr("transform", `translate(${ _dimensions.margins.left }, ${ _dimensions.margins.right })`);
      }

      _addListeners() {
          _event.dispatch.on("axis_updated", this.addAxes.bind(this));
      }

  }

  let _instance = null;
  class Event {
      constructor() {
          if (!_instance) {
              _instance = this;
          }
          this._dispatch = d3.dispatch("axis_updated", "axis_rendered", "zone_mouseover", "zone_mouseout");
          this.time = new Date();
          return _instance;
      }

      trigger(type, data) {
          this._dispatch[type](data);
      }

      get dispatch() {
          return this._dispatch;
      }
  }

  /**
   * morningstar-base-charts
   *
   * Copyright © 2016 . All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

var   _axes$2 = {};
var   _event$1;
  class AxesManager {
      constructor(axesConfig, event) {
          _event$1 = event;
          if (!axesConfig) {
              return this;
          }
          _axes$2 = axesConfig;
          _event$1.trigger("axis_updated");
      }

      update(axes) {
          _axes$2 = axes;
          _event$1.trigger("axis_updated");
      }

      get x() {
          return _axes$2.x;
      }

      set x(axis) {
          _axes$2.x = axis;
      }
      get y() {
          return _axes$2.y;
      }

      set y(axis) {
          _axes$2.y = axis;
      }
      get x2() {
          return _axes$2.x2;
      }

      set x2(axis) {
          _axes$2.x2 = axis;
      }
      get y2() {
          return _axes$2.y2;
      }

      set y2(axis) {
          _axes$2.y2 = axis;
      }
  }

  class Base {
      constructor(options) {
          if (!options) {
              throw new Error("Options required.");
          }
          this.colors = Config.colors;
          this.options = options;
          this.rawData = [];
          this.event = new Event();
          this.container = d3.select(options.container).classed(defaultClasses.CHART, true);
          this.chartContainer = this.container.append("div").classed(defaultClasses.CONTAINER, true);
          this.elContainer = document.querySelector(options.container);
          this.elChartContainer = document.querySelector(options.container + " ." + defaultClasses.CONTAINER);
          this._calculateDimensions();

          this.event.dispatch.on("axis_rendered", () => {
              this._initInteractions();
              this._afterAxis();
          });
      }

      add(chartClass, options) {
          this._addRawData(options.data);

          var chart = new chartClass({
              data: options.data,
              canvas: this.canvas,
              axes: this.axes,
              options: this.options,
              colorScale: this.colorScale,
              event: this.event
          });

          this._updateAxes().then(() => {
              this.canvas.add(chart);
          });
      }

      getColor(i) {
          return this.colors[i];
      }

      init() {
          this.axes = new AxesManager(this._setAxes(), this.event);
          this._createCanvas();
      }

      recalculate() {
          this._calculateDimensions();
          this._setAxes();
          this._updateAxes().then(() => {
              this.canvas.redraw(this.dimensions);
          });
      }

      _initInteractions() {
          var zones = this.canvas.svg.selectAll(`.${ defaultClasses.ZONE }`);
          zones.on("mouseover", (d, i) => {
              this._zoneMouseover(i);
              this.event.trigger("zone_mouseover", i);
          }).on("mouseout", (d, i) => {
              this._zoneMouseout(i);
              this.event.trigger("zone_mouseout", i);
          });

          d3.select(window).on("resize", () => {
              this.recalculate();
          });
      }

      _addRawData(data) {
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

      _createCanvas() {
          this.canvas = new Canvas({
              chartContainer: this.chartContainer,
              dimensions: this.dimensions,
              event: this.event,
              axes: this.axes
          });
      }

      _calculateDimensions() {
          console.warn("_calculateDimensions not implemented.");
      }
      _setAxes() {
          console.warn("_setAxes not implemented.");
          return {};
      }
      _afterAxis() {
          console.warn("_afterAxis not implemented.");
      }
      _updateAxes() {
          console.warn("_updateAxes not implemented.");
      }
      _setColorScale() {
          console.warn("_setColorScale not implemented.");
      }
      _zoneMouseover() {
          console.warn("_zoneMouseover not implemented.");
      }
      _zoneMouseout() {
          console.warn("_zoneMouseout not implemented.");
      }
  }

  var _axes = {};
  var _tickSize;
  var _tickSpace;
  class AxesType1 extends Base {
      constructor(options) {
          super(options);
          this.xDomain = options.domain;
          _tickSize = options.tickSize || 0;
          _tickSpace = options.tickSpace || 0;
          this.container.classed("mbc-chart-type-1", true);
          this._setColorScale();
          this._setAxes();
          this.init();

          // this._drawLines();
          // this._makeup();
      }

      _setColorScale() {
          this.colorScale = d3.scale.ordinal().range(this.colors);
      }

      _afterAxis() {
          this._drawLines();
          this._makeup();
      }

      _setAxes() {
          var xScales = d3.scale.ordinal().rangeRoundBands([0, this.dimensions.width - _tickSize - _tickSpace], 0.05) // TODO: Parametrized
          .domain(this.xDomain),
              yScales = d3.scale.linear().range([this.dimensions.height, 0]);

          _axes.x = d3.svg.axis().scale(xScales).tickSize(0);

          _axes.y = d3.svg.axis().scale(yScales).tickSize(_tickSize).orient("left");

          return {
              x: _axes.x,
              y: _axes.y
          };

          // this.canvas.addAxes(_axes);
      }

      _updateAxes() {
          return new Promise(resolve => {
              var allValues = ChartUtils.getAllValues(this.rawData),

              // categories = this.rawData.map(value => value.name),
              yScale = _axes.y.scale(),
                  hasNegative = ChartUtils.hasNegative(allValues),
                  domain = ChartUtils.getDomain(allValues, hasNegative, 10),
                  tickValues = ChartUtils.getTickValues(domain, hasNegative);

              yScale.domain(domain);

              _axes.y.scale(yScale).tickValues(tickValues);

              this.axes.update(_axes);

              resolve();
          });
      }

      _getTickValues(domain, hasNegative) {
          var divisor = hasNegative ? 2 : 4,
              domain_step = domain / divisor,
              value = hasNegative ? domain * -1 : 0;

          this.tickValues = [];

          while (value < domain) {
              this.tickValues.push(value);
              value += domain_step;
          }
          this.tickValues.push(value);
      }

      _makeup() {
          var c = this.container;
          c.selectAll(`.${ defaultClasses.AXIS_Y } .tick text`).attr("x", 0).attr("y", 12).first().attr("y", -10);

          c.selectAll(`.${ defaultClasses.AXIS_Y } .tick`).first().classed("dark", true);
          c.selectAll(`.${ defaultClasses.AXIS_Y } .tick`).last().classed("dark", true);

          if (_axes.y.scale().domain()[0] < 0) {
              c.selectAll(`.${ defaultClasses.GRID } line`).first().classed("dark", true);
          } else {
              c.selectAll(`.${ defaultClasses.GRID } line`).first().remove();
          }
          c.selectAll(`.${ defaultClasses.GRID } line`).last().classed("dark", true);
      }

      _drawLines() {
          var ticks = _axes.y.tickValues(),
              yTickSize = _axes.y.tickSize(),
              yScale = _axes.y.scale();

          if (!ticks) {
              return;
          }
          this.canvas.svg.select(`.${ defaultClasses.GRID }`).selectAll("line").data(ticks).enter().append("line").attr("x1", 0).attr("y1", yScale).attr("x2", this.dimensions.width - yTickSize).attr("y2", yScale).attr("stroke", "#dedede").attr("stroke-width", "1");
      }

      _calculateDimensions() {
          var margins = { top: 20, right: 20, bottom: 20, left: 20 };
          var tickSize = _tickSize || 0;
          var tickSpace = _tickSpace || 0;
          console.log(this.chartContainer[0][0], this.chartContainer[0][0].offsetWidth);
          this.dimensions = {
              margins,
              width: this.chartContainer[0][0].offsetWidth - margins.left - margins.right - tickSize - tickSpace,
              height: this.elContainer.offsetHeight - margins.top - margins.bottom
          };
          console.log(this.dimensions);
      }

      _zoneMouseover(index) {
          var zone = this.canvas.svg.select(`.${ defaultClasses.ZONE }-${ index }`),
              backzone = this.canvas.svg.select(`.${ defaultClasses.BACKZONE }-${ index }`);

          var xScale = _axes.x.scale(),
              yScale = _axes.y.scale(),
              yRange = yScale.range(),
              width = xScale.rangeBand();

          zone.transition().duration(400).style("opacity", 0.1).style("fill", null).style("stroke", 1).style("stroke-fill", "#666");

          console.log(yRange);
          var line = backzone.append("line").attrs({
              "x1": width / 2,
              "x2": width / 2,
              "y1": 0, //yScale(d3.max(yRange)),
              "y2": 0,
              "stroke-width": 1,
              "stroke": "#aaa",
              "stroke-dasharray": "4, 5",
              opacity: 0.5
          });
          line.transition().duration(400).attr("y2", yScale(d3.min(yRange)));
      }

      _zoneMouseout(index) {
          var zone = this.canvas.svg.select(`.${ defaultClasses.ZONE }-${ index }`),
              backzone = this.canvas.svg.select(`.${ defaultClasses.BACKZONE }-${ index }`);

          zone.transition().duration(400).style("opacity", 0).style("fill", null).style("stroke", 0).style("stroke-color", null);

          backzone.selectAll("line").remove();
      }

      // _createLegend() {
      //     var aEnter = this.container.select(".mbc-chart-legend")
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

  class ChartBase {
      constructor(params) {
          this._canvas = params.canvas;
          this._colorScale = params.colorScale;
          this._axes = params.axes;
          this._event = params.event;

          this.data = params.data;
          this.type = this.data.type;
          this.index = params.data.index;

          this._addListeners();
      }

      _addListeners() {
          this._event.dispatch.on(`zone_mouseover.${ this.type }-${ this.index }`, this.onMouseover.bind(this));
          this._event.dispatch.on(`zone_mouseout.${ this.type }-${ this.index }`, this.onMouseout.bind(this));
      }

      render() {
          console.warn("render not implemented", this.type);
      }

      onMouseover() {
          console.warn("onMouseover not implemented", this.type);
      }

      onMouseout() {
          console.warn("onMouseout not implemented", this.type);
      }
  }

  class BarChart$1 extends ChartBase {

      constructor(options) {
          super(options);
          this._isStacked = options.data.length > 1 && typeof stacked === "boolean" && options.stacked;
          this._isGrouped = !this.isStacked;
          this._formatData(options.data);
      }

      render(options) {
          // MUST:
          var yScale = this._axes.y.scale(),
              xScale = this._axes.x.scale(),
              x0Scale = d3.scale.ordinal().domain(this._categories).rangeRoundBands([0, xScale.rangeBand()]),
              vis = this._canvas.svg.select(`.${ defaultClasses.CHARTS_AREA }`),
              animation = options && !options.animation ? false : true,
              group;

          if (this._isGrouped) {
              group = vis.selectAll(`.${ defaultClasses.CHART_GROUP }`).data(this.data).enter().append("g").attr("class", (d, i) => `${ defaultClasses.CHART_GROUP } ${ defaultClasses.CHART_GROUP }-${ i } ${ defaultClasses.FOCUS }-${ i }`).attr("transform", d => "translate(" + xScale(d.series) + ",0)");

              var bars = group.selectAll("rect").data(d => d.values).enter().append("rect");

              bars.attr("width", x0Scale.rangeBand()).attr("x", d => x0Scale(d.category)).attr("y", d => yScale(animation ? 0 : Math.max(0, d.value))).attr("height", d => animation ? 0 : Math.abs(yScale(0) - yScale(d.value))).attr("class", d => defaultClasses.BAR + "-" + d.index).classed(defaultClasses.BAR, true).style("fill", (d, i) => this._colorScale(i)).on("mouseover", (d, i, j) => d3.select(`.${ defaultClasses.CHART_GROUP }-${ j } .${ defaultClasses.BAR }-${ i }`).transition().style("opacity", "0.5")

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
              .on("mouseout", (d, i, j) => d3.select(`.${ defaultClasses.CHART_GROUP }-${ j } .${ defaultClasses.BAR }-${ i }`).transition().style("opacity", "1")

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
                  bars.each(function () {
                      d3.select(this).transition().duration(Math.random() * 500 + 200)
                      // .transition().duration(500 * i)
                      .attr("y", d => yScale(Math.max(0, d.value))).attr("height", d => Math.abs(yScale(0) - yScale(d.value)));
                      // .each("end", ()=>console.log("Fin transition"));
                  });
              }
          }

          //this._createLegend();
      }

      onMouseover(index) {
          this._canvas.svg.selectAll(`.${ defaultClasses.CHART_GROUP }.${ defaultClasses.FOCUS }-${ index }`).transition().style("opacity", 0.5);
      }

      onMouseout(index) {
          this._canvas.svg.selectAll(`.${ defaultClasses.CHART_GROUP }.${ defaultClasses.FOCUS }-${ index }`).transition().style("opacity", 1);
      }

      _formatData(data) {
          var xDomain = this._axes.x.scale().domain();
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

  class Benchmark extends ChartBase {
      constructor(options) {
          super(options);
          options.height = 5; //TODO: parametrized height
          this.height = options.height;
          this.dy = Math.floor(this.height / 2); //TODO: parametrized height
      }

      render(options) {
          var yScale = this._axes.y.scale(),
              xScale = this._axes.x.scale(),
              xDomain = xScale.domain(),
              width = xScale.rangeBand(),
              animation = options && !options.animation ? false : true;

          this.selection = this._canvas.svg.select(`.${ defaultClasses.CHARTS_AREA }`).selectAll(`.benchmark-${ this.index }`).data(this.data.values).enter().append("rect").attr("class", (d, i) => `benchmark benchmark-${ this.index } ${ defaultClasses.FOCUS }-${ i }`).attrs({
              "x": (d, i) => {
                  return xScale(xDomain[i]);
              },
              "y": d => yScale(d) - this.dy,
              "width": animation ? 0 : width,
              "height": this.height,
              "fill": this._colorScale(this.index)
          }).style("opacity", animation ? 0 : 1);

          if (animation) {
              this.tt = true;
              this.selection.each(function () {
                  d3.select(this).transition().duration(Math.random() * 800 + 400).style("opacity", 1).attr("width", width).call((d => {
                      console.log("=>", d, this);
                      return this.tt = !this.tt;
                  }).bind(this));
              });
          }
      }

      onMouseover(index) {
          console.log(this.tt);
          if (this.tt) {
              return;
          }
          this.selection.transition().duration(300).attr("fill", "green");
      }
      onMouseout(index) {
          var selection = this._canvas.svg.selectAll(`.benchmark.${ defaultClasses.FOCUS }-${ index }`);

          selection.transition().duration(300).attr("fill", this._colorScale(this.index));
      }
  }

  class Dots extends ChartBase {
      constructor(params) {
          super(params);
      }

      render(options) {
          var yScale = this._axes.y.scale(),
              xScale = this._axes.x.scale(),
              xDomain = xScale.domain(),
              width = xScale.rangeBand(),
              data = this.data,
              animation = options && !options.animation ? false : true;

          this.selection = this._canvas.svg.select(`.${ defaultClasses.CHARTS_AREA }`).selectAll(`.dots-${ data.index }`).data(data.values).enter().append("circle").attr("class", (d, i) => `dots dots-${ data.index } ${ defaultClasses.FOCUS }-${ i }`).attrs({
              "cx": (d, i) => {
                  return xScale(xDomain[i]) + width / 2;
              },
              "cy": d => yScale(d),
              "r": d => animation ? 0 : 0.3 * yScale(d),
              "fill": this._colorScale(data.index)
          }).style("opacity", animation ? 0 : 1);

          if (animation) {
              this.selection.each(function () {
                  d3.select(this).transition().duration(Math.random() * 500 + 400).attr("r", d => 0.3 * yScale(d)).style("opacity", 1);
              });
          }
      }

      onMouseover() {
          var r = function () {
              return d3.select(this).attr("r");
          },
              r0 = function () {
              return d3.select(this).attr("r") * 1.5;
          };

          this.selection.transition().duration(500).attr("_r", r).attr("r", r0).attr("stroke-width", 1).attr("stroke", "#333").style("opacity", 0.5);
      }

      onMouseout() {
          var r = function () {
              return d3.select(this).attr("_r");
          };

          this.selection.transition().duration(500).attr("r", r).attr("stroke-width", 0).style("opacity", 1);
      }
  }

  function d3_overrides () {
      // d3 overrides
      //----------------------------------

      d3.selection.prototype.first = function () {
          return d3.select(this[0][0]);
      };

      d3.selection.prototype.last = function () {
          var last = this.size() - 1;
          return d3.select(this[0][last]);
      };
      d3.selection.prototype.attrs = function (obj) {
          for (let attr in obj) {
              this.attr(attr, obj[attr]);
          }
          return this;
      };
      //---------------oOo-----------------
  }

  d3_overrides();
  const types = {
      BAR: "bar",
      BENCHMARK: "benchmark",
      DOTS: "dots"
  };
  class ChartFactory {
      constructor() {
          d3_overrides();
      }

      test(options) {
          var chartType1 = new AxesType1({
              container: options.container,
              domain: options.data.names,
              tickSize: 40,
              tickSpace: 5
          });
          var classification = this._classify(options.data.values);
          chartType1.add(BarChart$1, {
              data: classification.grouped
          });
          classification.not_grouped.forEach(data => {
              if (data.type === types.BENCHMARK) {
                  console.log("Benchmark");
                  chartType1.add(Benchmark, { data: data });
              } else if (data.type === types.DOTS) {
                  console.log("Dots");
                  chartType1.add(Dots, { data: data });
              }
          });
      }

      barChart(options) {
          return new BarChart(options);
      }

      static get types() {
          return types;
      }

      _classify(data) {
          var classified = {
              grouped: [],
              not_grouped: []
          };
          data.forEach(item => {
              if (item.type === types.BAR || item.type === undefined) {
                  item.type = "bar";
                  classified.grouped.push(item);
              } else {
                  classified.not_grouped.push(item);
              }
          });
          return classified;
      }

  }

  return ChartFactory;

}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jb25maWcvY29uZmlnLmpzIiwiLi4vLi4vc3JjL2pzL2NvbmZpZy9jbGFzc2VzLmpzIiwiLi4vLi4vc3JjL2pzL2NoYXJ0cy9iYXNlLmNoYXJ0LmpzIiwiLi4vLi4vc3JjL2pzL3V0aWxzL3V0aWxzLmpzIiwiLi4vLi4vc3JjL2pzL2NoYXJ0cy9iYXIuY2hhcnQuanMiLCIuLi8uLi9zcmMvanMvY2hhcnR6L2NhbnZhcy5qcyIsIi4uLy4uL3NyYy9qcy91dGlscy9ldmVudC5qcyIsIi4uLy4uL3NyYy9qcy9jaGFydHovYXhlc01hbmFnZXIuanMiLCIuLi8uLi9zcmMvanMvY2hhcnR6L2Jhc2UuanMiLCIuLi8uLi9zcmMvanMvY2hhcnR6L2F4ZXNUeXBlMS5qcyIsIi4uLy4uL3NyYy9qcy9jaGFydHovY2hhcnRCYXNlLmpzIiwiLi4vLi4vc3JjL2pzL2NoYXJ0ei9iYXIuanMiLCIuLi8uLi9zcmMvanMvY2hhcnR6L2JlbmNobWFyay5qcyIsIi4uLy4uL3NyYy9qcy9jaGFydHovZG90cy5qcyIsIi4uLy4uL3NyYy9qcy91dGlscy9kMy5vdmVycmlkZXMuanMiLCIuLi8uLi9zcmMvanMvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbW9ybmluZ3N0YXItYmFzZS1jaGFydHNcbiAqXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiAuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjb2xvcjoge1xuICAgICAgICBwYXR0ZXJuOiBbXCIjMTc2Mjk4XCIsICcjODEyRThGJywgJyNmZjdmMGUnLCAnI2ZmYmI3OCcsICcjMmNhMDJjJywgJyM5OGRmOGEnLCAnI2Q2MjcyOCcsICcjZmY5ODk2J11cbiAgICB9LFxuICAgIGNvbG9yczpbXCIjMTc2Mjk4XCIsICcjODEyRThGJywgJyNmZjdmMGUnLCAnI2ZmYmI3OCcsICcjMmNhMDJjJywgJyM5OGRmOGEnLCAnI2Q2MjcyOCcsICcjZmY5ODk2J11cbn07XG4iLCJjb25zdCBCQVNFID0gXCJtYmNcIjtcbmNvbnN0IENIQVJUID0gQkFTRSArIFwiLWNoYXJ0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBBWElTOiBgJHtCQVNFfS1heGlzYCxcbiAgICBBWElTX1g6IGAke0JBU0V9LWF4aXMteGAsXG4gICAgQVhJU19ZOiBgJHtCQVNFfS1heGlzLXlgLFxuICAgIEJBQ0taT05FOiBgJHtCQVNFfS1iYWNrYCxcbiAgICBCQUNLWk9ORVM6IGAke0JBU0V9LWJhY2tzYCxcbiAgICBCQVI6IEJBU0UgKyBcIi1iYXJcIixcbiAgICBCQVJDSEFSVDogQkFTRSArIFwiLWJhci1jaGFydFwiLFxuICAgIENBTlZBUzogQkFTRSArIFwiLWNhbnZhc1wiLFxuICAgIENIQVJUOiBDSEFSVCxcbiAgICBDSEFSVF9HUk9VUDogYCR7Q0hBUlR9LWdyb3VwYCxcbiAgICBDT05UQUlORVI6IENIQVJUICsgXCItY29udGFpbmVyXCIsXG4gICAgREVDSzogQ0hBUlQgKyBcIi1kZWNrXCIsXG4gICAgRk9DVVM6IGAke0NIQVJUfS1mb2N1c2AsXG4gICAgR1JJRDogYCR7QkFTRX0tZ3JpZGAsXG4gICAgTEVHRU5EX0lURU06IENIQVJUICsgXCItbGVnZW5kLWl0ZW1cIixcbiAgICBMRUdFTkQ6IENIQVJUICsgXCItbGVnZW5kXCIsXG4gICAgVElUTEU6IENIQVJUICsgXCItdGl0bGVcIixcbiAgICBUT09MVElQOiBgJHtDSEFSVH0tdG9vbHRpcGAsXG4gICAgQ0hBUlRTX0FSRUE6IGAke0NIQVJUfXMtYXJlYWAsXG4gICAgWk9ORVM6IGAke0NIQVJUfS16b25lc2AsXG4gICAgWk9ORTogYCR7Q0hBUlR9LXpvbmVgXG59O1xuIiwiLyoqXG4gKiBtb3JuaW5nc3Rhci1iYXNlLWNoYXJ0c1xuICpcbiAqIENvcHlyaWdodCDCqSAyMDE2IC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UudHh0IGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi4vY29uZmlnL2NvbmZpZy5qc1wiO1xuaW1wb3J0IGRlZmF1bHRfY2xhc3NlcyBmcm9tIFwiLi4vY29uZmlnL2NsYXNzZXMuanNcIjtcblxuLyoqXG4gKlxuICpcbiAqIEBjbGFzcyBCYXNlQ2hhcnRcbiAqL1xuY2xhc3MgQmFzZUNoYXJ0IHtcbiAgICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wdGlvbnMgcmVxdWlyZWQuXCIpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3Qob3B0aW9ucy5jb250YWluZXIpLmNsYXNzZWQoZGVmYXVsdF9jbGFzc2VzLkNIQVJULCB0cnVlKTtcbiAgICAgICAgdGhpcy5jaGFydENvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZChcImRpdlwiKS5jbGFzc2VkKGRlZmF1bHRfY2xhc3Nlcy5DT05UQUlORVIsIHRydWUpO1xuICAgICAgICB0aGlzLmxlZ2VuZHRDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoXCJkaXZcIikuY2xhc3NlZChkZWZhdWx0X2NsYXNzZXMuTEVHRU5ELCB0cnVlKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5jb2xvcnMgPSB0aGlzLm9wdGlvbnMuY29sb3JzIHx8IENvbmZpZy5jb2xvci5wYXR0ZXJuO1xuICAgICAgICB0aGlzLmVsQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lbENoYXJ0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMuY29udGFpbmVyICsgXCIgLlwiICsgZGVmYXVsdF9jbGFzc2VzLkNPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKi9cbiAgICByZW5kZXIgKCkge31cblxuICAgIGdldENvbG9yIChpZCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VyaWVzTmFtZXMgfHwgISB0aGlzLmNvbG9ycykge1xuICAgICAgICAgICAgcmV0dXJuIFwiYmxhY2tcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcnNbdGhpcy5zZXJpZXNOYW1lcy5pbmRleE9mKGlkKV07XG4gICAgfVxuXG4gICAgZm9jdXMgKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT24gZm9jdXNcIiwgaWQpO1xuICAgIH1cblxuICAgIGJsdXIgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIk9uIGJsdXJcIik7XG4gICAgfVxuXG4gICAgdG9nZ2xlIChpZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIk9uIHRvZ2dsZVwiLCBpZCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNhbnZhcyAoKSB7XG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5jaGFydENvbnRhaW5lclxuICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzLndpZHRoICt0aGlzLm1hcmdpbnMubGVmdCArIHRoaXMubWFyZ2lucy5yaWdodClcbiAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRoaXMuaGVpZ2h0ICsgdGhpcy5tYXJnaW5zLnRvcCArIHRoaXMubWFyZ2lucy5ib3R0b20pXG4gICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLm1hcmdpbnMubGVmdCArIFwiLFwiICsgdGhpcy5tYXJnaW5zLnRvcCArIFwiKVwiKTtcbiAgICB9XG5cbiAgICBfY2xlYW5DYW52YXMgKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5odG1sKFwiXCIpO1xuICAgIH1cblxuICAgIF9pbml0ICgpIHtcbiAgICAgICAgdGhpcy5fZm9ybWF0RGF0YSgpO1xuICAgICAgICB0aGlzLl9zZXREaW1lbnNpb25zKCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcygpO1xuICAgICAgICB0aGlzLl9zZXRSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5fc2V0QXhlcygpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIF9tYWtldXAgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfbWFrZXVwKCkgaXMgbm90IGltcGxlbWVudGVkLlwiKVxuICAgIH1cblxuICAgICBfY3JlYXRlTGVnZW5kICgpIHtcbiAgICAgICAgIGNvbnNvbGUud2FybihcIl9jcmVhdGVMZWdlbmQoKSBpcyBub3QgaW1wbGVtZW50ZWQuXCIpXG4gICAgIH1cblxuICAgIF9zZXREaW1lbnNpb25zKCkge1xuICAgICAgICB0aGlzLm1hcmdpbnMgPSB7dG9wOiAyMCwgcmlnaHQ6IDIwLCBib3R0b206IDIwLCBsZWZ0OiA1MH07XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmVsQ2hhcnRDb250YWluZXIub2Zmc2V0V2lkdGggLSB0aGlzLm1hcmdpbnMubGVmdCAtIHRoaXMubWFyZ2lucy5yaWdodDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmVsQ29udGFpbmVyLm9mZnNldEhlaWdodCAtIHRoaXMubWFyZ2lucy50b3AgLSB0aGlzLm1hcmdpbnMuYm90dG9tO1xuICAgIH1cblxuICAgIF9zZXRSYW5nZXMgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfc2V0UmFuZ2VzKCkgaXMgbm90IGltcGxlbWVudGVkLlwiKVxuICAgIH1cblxuICAgIF9zZXRBeGVzICgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiX3NldEF4ZXMoKSBpcyBub3QgaW1wbGVtZW50ZWQuXCIpXG4gICAgfVxuXG4gICAgX2Zvcm1hdERhdGEgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfZm9ybWF0RGF0YSgpIGlzIG5vdCBpbXBsZW1lbnRlZC5cIilcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDaGFydDtcbiIsIlxuZXhwb3J0IGNvbnN0IENoYXJ0VXRpbHMgPSB7XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgdmFsdWVzIGFzIGFuIHVuaXF1ZSBhcnJheS5cbiAgICAgKi9cbiAgICBnZXRBbGxWYWx1ZXM6IChkYXRhKSA9PiB7XG4gICAgICAgIHZhciBhbGxWYWx1ZXMgPSBbXTtcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgYWxsVmFsdWVzID0gYWxsVmFsdWVzLmNvbmNhdCh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFsbFZhbHVlcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgZmFsc2UgaWYgdGhlIGFycmF5IHBhc3NlZCBjb250YWlucyBuZWdhdGl2ZSB2YWx1ZXMuXG4gICAgICovXG4gICAgaGFzTmVnYXRpdmU6IChhbGxWYWx1ZXMpID0+IHtcbiAgICAgICAgcmV0dXJuIGQzLm1pbihhbGxWYWx1ZXMpIDwgMDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGRvbWFpbiBmb3QgYSBjZXJ0YWluIGRhdGFzZXQuXG4gICAgICovXG4gICAgZ2V0RG9tYWluOiAoYWxsVmFsdWVzLCBoYXNOZWdhdGl2ZSwgcm91bmRfdG8gPSAxMDApID0+IHtcbiAgICAgICAgdmFyIGRvbWFpbiwgZG9tYWluX2k7XG4gICAgICAgIGRvbWFpbiA9IChNYXRoLmNlaWwoZDMubWF4KGFsbFZhbHVlcywgZCA9PiBNYXRoLmFicyhkKSkgLyByb3VuZF90bykgKiByb3VuZF90byk7XG4gICAgICAgIGRvbWFpbl9pID0gaGFzTmVnYXRpdmUgPyBkb21haW4gKiAtMSA6IDA7XG4gICAgICAgIHJldHVybiBbZG9tYWluX2ksIGRvbWFpbl07XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGlja3ZhbHVlcyBmb3IgYSBnaXZlbiBkYXRhc2V0LlxuICAgICAqL1xuICAgIGdldFRpY2tWYWx1ZXM6IChkb21haW4sIGhhc05lZ2F0aXZlKSA9PiB7XG4gICAgICAgIHZhciBkaXZpc29yID0gKGhhc05lZ2F0aXZlKSA/IDIgOiA0LCAvLyBUT0RPOiBwYXJhbWV0cml6ZWQgZGl2aXNvclxuICAgICAgICAgICAgZG9tYWluX3N0ZXAgPSBNYXRoLmFicyhkb21haW5bMF0gLSBkb21haW5bMV0pIC8gZGl2aXNvcixcbiAgICAgICAgICAgIHZhbHVlID0gaGFzTmVnYXRpdmUgPyBkb21haW4gKiAtMSA6IDAsXG4gICAgICAgICAgICBtYXggPSBkMy5tYXgoZG9tYWluLCBkID0+IE1hdGguYWJzKGQpKSxcbiAgICAgICAgICAgIHRpY2tWYWx1ZXMgPSBbXTtcblxuICAgICAgICB3aGlsZSAodmFsdWUgPCBtYXgpIHtcbiAgICAgICAgICAgIHRpY2tWYWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB2YWx1ZSArPSBkb21haW5fc3RlcDtcbiAgICAgICAgfVxuICAgICAgICB0aWNrVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gdGlja1ZhbHVlcztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgU3RyaW5nVXRpbHMgPSB7XG4gICAgZGFzaGlmeTogKHN0cikgPT4ge1xuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxzKy9nLCBcIi1cIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuICAgIHRlbXBsYXRlOiAoaHRtbCwgZGF0YSkgPT4ge1xuICAgICAgICB2YXIgcmUgPSAvPCUoW14lPl0rKT8lPi9nLFxuICAgICAgICAgICAgcmVFeHAgPSAvKF4oICk/KGlmfGZvcnxlbHNlfHN3aXRjaHxjYXNlfGJyZWFrfHt8fSkpKC4qKT8vZyxcbiAgICAgICAgICAgIGNvZGUgPSBcInZhciByPVtdO1xcblwiLFxuICAgICAgICAgICAgY3Vyc29yID0gMCxcbiAgICAgICAgICAgIG1hdGNoO1xuXG4gICAgICAgIHZhciBhZGQgPSBmdW5jdGlvbiAobGluZSwganMpIHtcbiAgICAgICAgICAgIGpzID8gKGNvZGUgKz0gbGluZS5tYXRjaChyZUV4cCkgPyBsaW5lICsgXCJcXG5cIiA6IFwici5wdXNoKFwiICsgbGluZSArIFwiKTtcXG5cIikgOlxuICAgICAgICAgICAgICAgIChjb2RlICs9IGxpbmUgIT0gXCJcIiA/IFwici5wdXNoKCdcIiArIGxpbmUucmVwbGFjZSgvXCIvZywgXCJcXFxcJ1wiKSArIFwiJyk7XFxuXCIgOiBcIlwiKTtcbiAgICAgICAgICAgIHJldHVybiBhZGQ7XG4gICAgICAgIH07XG4gICAgICAgIG1hdGNoID0gcmUuZXhlYyhodG1sKTtcbiAgICAgICAgd2hpbGUgKCBtYXRjaCApIHtcbiAgICAgICAgICAgIGFkZChodG1sLnNsaWNlKGN1cnNvciwgbWF0Y2guaW5kZXgpKShtYXRjaFsxXSwgdHJ1ZSk7XG4gICAgICAgICAgICBjdXJzb3IgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgIG1hdGNoID0gcmUuZXhlYyhodG1sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZChodG1sLnN1YnN0cihjdXJzb3IsIGh0bWwubGVuZ3RoIC0gY3Vyc29yKSk7XG4gICAgICAgIGNvZGUgKz0gXCJyZXR1cm4gci5qb2luKCcnKTtcIjtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihjb2RlLnJlcGxhY2UoL1tcXHJcXHRcXG5dL2csIFwiXCIpKS5hcHBseShkYXRhKTtcbiAgICB9XG59O1xuXG5jb25zdCBleHRlbmQgPSAoLi4uYXJncykgPT4ge1xuXG4gICAgLy8gVmFyaWFibGVzXG4gICAgbGV0IGV4dGVuZGVkID0ge30sXG4gICAgICAgIGRlZXAgPSBmYWxzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbmd0aCA9IGFyZ3MubGVuZ3RoLFxuICAgICAgICBtZXJnZTtcblxuICAgIC8vIENoZWNrIGlmIGEgZGVlcCBtZXJnZVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnc1swXSkgPT09IFwiW29iamVjdCBCb29sZWFuXVwiKSB7XG4gICAgICAgIGRlZXAgPSBhcmdzWzBdO1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgdGhlIG9iamVjdCBpbnRvIHRoZSBleHRlbmRlZCBvYmplY3RcbiAgICBtZXJnZSA9IChvYmopID0+IHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGRlZXAgbWVyZ2UgYW5kIHByb3BlcnR5IGlzIGFuIG9iamVjdCwgbWVyZ2UgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIGlmIChkZWVwICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmpbcHJvcF0pID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZGVkW3Byb3BdID0gZXh0ZW5kKHRydWUsIGV4dGVuZGVkW3Byb3BdLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZGVkW3Byb3BdID0gb2JqW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBvYmplY3QgYW5kIGNvbmR1Y3QgYSBtZXJnZVxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9iaiA9IGFyZ3NbaV07XG4gICAgICAgIG1lcmdlKG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dGVuZGVkO1xuXG59O1xuXG5leHBvcnQgY29uc3QgT2JqZWN0VXRpbHMgPSB7XG4gICAgZXh0ZW5kOiBleHRlbmRcbn07XG4iLCIvKipcbiAqIG1vcm5pbmdzdGFyLWJhc2UtY2hhcnRzXG4gKlxuICogQ29weXJpZ2h0IMKpIDIwMTYgLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuLi9jb25maWcvY29uZmlnLmpzXCI7XG5pbXBvcnQgQmFzZUNoYXJ0IGZyb20gXCIuL2Jhc2UuY2hhcnQuanNcIjtcbmltcG9ydCBkZWZhdWx0X2NsYXNzZXMgZnJvbSBcIi4uL2NvbmZpZy9jbGFzc2VzLmpzXCI7XG5pbXBvcnQgeyBTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3V0aWxzLmpzXCI7XG5cbmNsYXNzIEJhckNoYXJ0IGV4dGVuZHMgQmFzZUNoYXJ0IHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NlZChkZWZhdWx0X2NsYXNzZXMuQkFSQ0hBUlQsIHRydWUpO1xuICAgIHRoaXMuaXNTdGFja2VkID0gdGhpcy5vcHRpb25zLmRhdGEudmFsdWVzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIHRoaXMub3B0aW9ucy5zdGFja2VkID09PSBcImJvb2xlYW5cIiAmJiB0aGlzLm9wdGlvbnMuc3RhY2tlZDtcbiAgICB0aGlzLmlzR3JvdXBlZCA9ICF0aGlzLmlzU3RhY2tlZDtcbiAgICB0aGlzLnNob3dUb29sVGlwID0gZmFsc2U7XG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0RGltZW5zaW9ucygpO1xuICAgICAgdGhpcy5fc2V0UmFuZ2VzKCk7XG4gICAgICB0aGlzLl9zZXRBeGVzKCk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuXG4gICAgdGhpcy5fY2xlYW5DYW52YXMoKTtcblxuICAgIGNvbnNvbGUubG9nKHRoaXMud2lkdGgsIHRoaXMuY2hhcnRDb250YWluZXIpO1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHZpcyA9IHRoaXMuY2FudmFzO1xuXG4gICAgdmlzLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsIFwiICsgKHRoaXMuaGVpZ2h0KSArIFwiKVwiKVxuICAgICAgLmNhbGwodGhpcy54QXhpcyk7XG5cbiAgICB2aXMuYXBwZW5kKFwiZ1wiKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwgMClcIilcbiAgICAgIC5jYWxsKHRoaXMueUF4aXMpO1xuXG4gICAgdGhpcy5fZHJhd0xpbmVzKCk7XG5cbiAgICBpZiAodGhpcy5pc0dyb3VwZWQpIHtcbiAgICAgIHZhciBncm91cCA9IHZpcy5zZWxlY3RBbGwoXCIuZ3JvdXBcIilcbiAgICAgICAgLmRhdGEodGhpcy5kYXRhKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJncm91cFwiKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGQgPT4gXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnhTY2FsZShkLm5hbWUpICsgXCIsMClcIik7XG5cbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgICAgLmRhdGEoZCA9PiBkLnZhbHVlcylcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgdGhpcy54MlNjYWxlLnJhbmdlQmFuZCgpKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBkID0+IHRoaXMueDJTY2FsZShkLm5hbWUpKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBkID0+IHRoaXMueVNjYWxlKE1hdGgubWF4KDAsIGQudmFsdWUpKSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkLCBpKSA9PiAoZGVmYXVsdF9jbGFzc2VzLkJBUiArIFwiLVwiICtpKSlcbiAgICAgICAgICAuY2xhc3NlZChkZWZhdWx0X2NsYXNzZXMuQkFSLCB0cnVlKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGQgPT4gTWF0aC5hYnModGhpcy55U2NhbGUoMCkgLSB0aGlzLnlTY2FsZShkLnZhbHVlKSkpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBkID0+IHRoaXMuZ2V0Q29sb3IoZC5uYW1lKSlcbiAgICAgICAgICAgIC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbiAoZCwgZXYsIGMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS50cmFuc2l0aW9uKClcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIFwiMC41XCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gdG9vbHRpcFxuICAgICAgICAgICAgICAgIHRoaXMudG9vbHRpcCA9IHNlbGYuX2NyZWF0ZVRvb2x0aXAoZClcbiAgICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgLjkpXG4gICAgICAgICAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChkMy5ldmVudC5wYWdlWCkgKyAxMCArIFwicHhcIilcbiAgICAgICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCAoZDMuZXZlbnQucGFnZVkgLSAyOCkgLSAxMCArIFwicHhcIik7XG4gICAgICAgICAgICB9KS5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZCwgZXYsIGMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBcbiAgICAgICAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGQzLmV2ZW50LnBhZ2VYKSArIDEwICsgXCJweFwiKVxuICAgICAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIChkMy5ldmVudC5wYWdlWSAtIDI4KSAtIDEwICsgXCJweFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCBcIjFcIik7XG5cbiAgICAgICAgICAgICAgc2VsZi5fcmVtb3ZlVG9vbHRpcCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzU3RhY2tlZCkge1xuICAgICAgdmFyIGdyb3VwID0gdmlzLnNlbGVjdEFsbChcIi5ncm91cFwiKVxuICAgICAgICAuZGF0YSh0aGlzLmRhdGEpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImdyb3VwXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBkID0+IHRoaXMuZ2V0Q29sb3IoZC5uYW1lKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbWFrZXVwKCk7XG4gICAgdGhpcy5fY3JlYXRlTGVnZW5kKCk7XG4gIH1cblxuICBmb2N1cyAoaWQsIGkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3RBbGwoYC4ke2RlZmF1bHRfY2xhc3Nlcy5CQVJ9LCAuJHtkZWZhdWx0X2NsYXNzZXMuTEVHRU5EX0lURU19YClcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMC41KTtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3RBbGwoYC4ke2RlZmF1bHRfY2xhc3Nlcy5CQVJ9LSR7aX0sIC4ke2RlZmF1bHRfY2xhc3Nlcy5MRUdFTkRfSVRFTX0tJHtpfWApXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpO1xuICB9XG5cbiAgYmx1ciAoaWQsIGkpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3RBbGwoYC4ke2RlZmF1bHRfY2xhc3Nlcy5CQVJ9LCAuJHtkZWZhdWx0X2NsYXNzZXMuTEVHRU5EX0lURU19YClcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XG4gIH1cblxuICBfbWFrZXVwKCkge1xuICAgIHZhciBjID0gdGhpcy5jb250YWluZXI7XG4gICAgYy5zZWxlY3RBbGwoXCIueSAudGljayB0ZXh0XCIpXG4gICAgICAuYXR0cihcInhcIiwgMClcbiAgICAgIC5hdHRyKFwieVwiLCAxMilcblxuICAgIGMuc2VsZWN0QWxsKFwiLnkgLnRpY2tcIikuZmlyc3QoKS5jbGFzc2VkKFwiZGFya1wiLCB0cnVlKTtcbiAgICBjLnNlbGVjdEFsbChcIi55IC50aWNrXCIpLmxhc3QoKS5jbGFzc2VkKFwiZGFya1wiLCB0cnVlKTtcbiAgICBjLnNlbGVjdEFsbChcIi55IC50aWNrIHRleHRcIikuZmlyc3QoKS5hdHRyKFwieVwiLCAtMTApO1xuICAgIGlmICh0aGlzLnlTY2FsZS5kb21haW4oKVswXSA8IDApIHtcbiAgICAgIGMuc2VsZWN0QWxsKFwiLmdyaWQgbGluZVwiKS5maXJzdCgpLmNsYXNzZWQoXCJkYXJrXCIsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjLnNlbGVjdEFsbChcIi5ncmlkIGxpbmVcIikuZmlyc3QoKS5yZW1vdmUoKTtcbiAgICB9XG4gICAgYy5zZWxlY3RBbGwoXCIuZ3JpZCBsaW5lXCIpLmxhc3QoKS5jbGFzc2VkKFwiZGFya1wiLCB0cnVlKTtcbiAgfVxuXG4gIF9nZXRUaWNrVmFsdWVzIChkb21haW4sIGhhc05lZ2F0aXZlKSB7XG4gICAgdmFyIGRpdmlzb3IgPSAoaGFzTmVnYXRpdmUpID8gMiA6IDQsXG4gICAgICAgIGRvbWFpbl9zdGVwID0gZG9tYWluIC8gZGl2aXNvcixcbiAgICAgICAgdmFsdWUgPSBoYXNOZWdhdGl2ZSA/IGRvbWFpbiAqIC0xIDogMDtcblxuICAgIHRoaXMudGlja1ZhbHVlcyA9IFtdO1xuXG4gICAgd2hpbGUgKHZhbHVlIDwgZG9tYWluKSB7XG4gICAgICAgIHRoaXMudGlja1ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgdmFsdWUgKz0gZG9tYWluX3N0ZXA7XG4gICAgfVxuICAgIHRoaXMudGlja1ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgfVxuXG4gIF9zZXRSYW5nZXMoKSB7XG4gICAgdmFyIGFsbFZhbHVlcyA9IFtdLFxuICAgICAgZG9tYWluLFxuICAgICAgcm91bmRfdG8gPSAxMDAsXG4gICAgICBkb21haW5faSwgdGlja1ZhbHVlcywgaGFzTmVnYXRpdmU7XG5cbiAgICB0aGlzLnhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgLnJhbmdlUm91bmRCYW5kcyhbMCwgdGhpcy53aWR0aF0sIDAuMSlcbiAgICAgIC5kb21haW4odGhpcy5vcHRpb25zLmRhdGEubmFtZXMpO1xuICAgIHRoaXMub3B0aW9ucy5kYXRhLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgYWxsVmFsdWVzID0gYWxsVmFsdWVzLmNvbmNhdCh2YWx1ZS52YWx1ZXMpO1xuICAgIH0pO1xuICAgIGhhc05lZ2F0aXZlID0gZDMubWluKGFsbFZhbHVlcykgPCAwO1xuICAgIGRvbWFpbiA9IChNYXRoLmNlaWwoZDMubWF4KGFsbFZhbHVlcywgZCA9PiBNYXRoLmFicyhkKSkgLyByb3VuZF90bykgKiByb3VuZF90byk7XG4gICAgZG9tYWluX2kgPSBoYXNOZWdhdGl2ZSA/IGRvbWFpbiAqIC0xIDogMDtcblxuICAgIHRoaXMuX2dldFRpY2tWYWx1ZXMoZG9tYWluLCBoYXNOZWdhdGl2ZSk7XG5cbiAgICB0aGlzLnlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAucmFuZ2UoW3RoaXMuaGVpZ2h0LCAwXSlcbiAgICAgIC5kb21haW4oW2RvbWFpbl9pLCBkb21haW5dKTtcblxuICAgIGlmICh0aGlzLmlzR3JvdXBlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJzZXJpZXNcIiwgdGhpcy5zZXJpZXNOYW1lcyk7XG4gICAgICB0aGlzLngyU2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcbiAgICAgICAgLmRvbWFpbih0aGlzLnNlcmllc05hbWVzKVxuICAgICAgICAucmFuZ2VSb3VuZEJhbmRzKFswLCB0aGlzLnhTY2FsZS5yYW5nZUJhbmQoKV0pO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRBeGVzKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMudGlja1ZhbHVlcyk7XG4gICAgdGhpcy54QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgIC5zY2FsZSh0aGlzLnhTY2FsZSlcbiAgICAgIC50aWNrU2l6ZSgwKTtcbiAgICB0aGlzLnlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgLnNjYWxlKHRoaXMueVNjYWxlKVxuICAgICAgLnRpY2tTaXplKDQwKVxuICAgICAgLm9yaWVudChcImxlZnRcIilcbiAgICAgIC50aWNrVmFsdWVzKHRoaXMudGlja1ZhbHVlcyk7XG4gIH1cblxuICBfZm9ybWF0RGF0YSgpIHtcbiAgICB0aGlzLnNlcmllc05hbWVzID0gdGhpcy5vcHRpb25zLmRhdGEudmFsdWVzLm1hcCh2YWx1ZSA9PiB2YWx1ZS5uYW1lKTtcbiAgICB2YXIgcmF3RGF0YSA9IHRoaXMub3B0aW9ucy5kYXRhLFxuICAgICAgbmFtZXMgPSByYXdEYXRhLm5hbWVzO1xuXG4gICAgdmFyIGRhdGEgPSByYXdEYXRhLm5hbWVzLm1hcChmdW5jdGlvbiAobmFtZSwgaSkge1xuICAgICAgdmFyIGl0ZW0gPSB7bmFtZX0sXG4gICAgICAgIHZhbHVlcyA9IFtdO1xuXG4gICAgICBpdGVtLnZhbHVlcyA9IHJhd0RhdGEudmFsdWVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc2VyaWVzOiBuYW1lLFxuICAgICAgICAgIG5hbWU6IHZhbHVlLm5hbWUsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLnZhbHVlc1tpXVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAvKlxuICAgICAge1xuICAgICAgICBuYW1lczogW1wiSmFuIDIwMTVcIiwgXCJGZWIgMjAxNVwiLCBcIk1hcmNoIDIwMTVcIiwgXCJBcHJpbCAyMDE1XCIsIFwiTWF5IDIwMTVcIiwgXCJKdW5lIDIwMTVcIiwgXCJKdWx5IDIwMTVcIl0sXG4gICAgICAgIHZhbHVlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiVmFsdWUgMVwiLFxuICAgICAgICAgICAgICAgIHZhbHVlczogWzgzLjk4LCAzNi41NCwgMjAuMDEsIDE5Ljg3LCA0Mi4wNCwgNjIuODUsIDczLjUzXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIlZhbHVlIDJcIixcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFs0NS4zNCwgMjIuMzksIDU0LjAwLCA0My41MiwgMzguNiwgMjIuNTYsIDMwLjg5XVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJKYW4gMjAxNVwiLFxuICAgICAgICB2YWx1ZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIlZhbHVlIDFcIixcbiAgICAgICAgICAgIHZhbHVlOiA4My45OFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJWYWx1ZSAyXCIsXG4gICAgICAgICAgICB2YWx1ZTogNDUuMzRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAqL1xuICB9XG5cbiAgX2RyYXdMaW5lcygpIHtcbiAgICB2YXIgcmFuZ28gPSB0aGlzLnhTY2FsZS5yYW5nZSgpLFxuICAgICAgdGlja3MgPSB0aGlzLnlBeGlzLnRpY2tWYWx1ZXMoKTtcbiAgICB0aGlzLmNhbnZhcy5hcHBlbmQoXCJnXCIpXG4gICAgICAuY2xhc3NlZChcImdyaWRcIiwgdHJ1ZSlcbiAgICAgIC5zZWxlY3RBbGwoXCJsaW5lXCIpLmRhdGEodGlja3MpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgIC5hdHRyKFwieDFcIiwgcmFuZ29bMF0pXG4gICAgICAuYXR0cihcInkxXCIsIGQgPT4gdGhpcy55U2NhbGUoZCkpXG4gICAgICAuYXR0cihcIngyXCIsIHJhbmdvW3JhbmdvLmxlbmd0aCAtIDFdICsgdGhpcy54U2NhbGUucmFuZ2VCYW5kKCkpXG4gICAgICAuYXR0cihcInkyXCIsIGQgPT4gdGhpcy55U2NhbGUoZCkpXG4gICAgICAuYXR0cihcInN0cm9rZVwiLCBcIiNkZWRlZGVcIilcbiAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMVwiKTtcbiAgfVxuXG4gIF9jcmVhdGVMZWdlbmQgKCkge1xuICAgIHZhciBhRW50ZXIgPSB0aGlzLmNvbnRhaW5lci5zZWxlY3QoYC5tYmMtY2hhcnQtbGVnZW5kYClcbiAgICAgIC5zZWxlY3RBbGwoXCJkaXZcIilcbiAgICAgIC5kYXRhKHRoaXMub3B0aW9ucy5kYXRhLnZhbHVlcy5tYXAoZCA9PiBkLm5hbWUpKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCAoZCwgaSkgPT4gKGRlZmF1bHRfY2xhc3Nlcy5MRUdFTkRfSVRFTSArIFwiLVwiICsgaSkpXG4gICAgICAgIC5jbGFzc2VkKGRlZmF1bHRfY2xhc3Nlcy5MRUdFTkRfSVRFTSwgdHJ1ZSlcbiAgICAgIC5hcHBlbmQoXCJhXCIpO1xuXG4gICAgYUVudGVyLmFwcGVuZChcInNwYW5cIikuYXR0cihcImNsYXNzXCIsIFwibWJjLWNoYXJ0LWxlZ2VuZC1zcXVhcmVcIilcbiAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgaWQgPT4gdGhpcy5nZXRDb2xvcihpZCkpO1xuXG4gICAgYUVudGVyLmFwcGVuZChcInBcIikuaHRtbChpZCA9PiBpZCk7XG5cbiAgICBhRW50ZXJcbiAgICAgIC5vbignbW91c2VvdmVyJywgKGlkLCBpKSA9PiB0aGlzLmZvY3VzKGlkLCBpKSlcbiAgICAgIC5vbignbW91c2VvdXQnLCAoaWQsIGkpID0+IHRoaXMuYmx1cigpKVxuICAgICAgLm9uKCdjbGljaycsIChpZCwgaSkgPT4gdGhpcy50b2dnbGUoaWQsIGkpKTtcbiAgfVxuXG4gIF9jcmVhdGVUb29sdGlwIChkYXRhLCBldikge1xuICAgIHZhciB0b29sdGlwID0gZDMuc2VsZWN0KGAuJHtkZWZhdWx0X2NsYXNzZXMuVE9PTFRJUH1gKTtcbiAgICBpZiAodG9vbHRpcC5lbXB0eSgpKXtcbiAgICAgIHRvb2x0aXAgPSBkMy5zZWxlY3QoXCJib2R5XCIpXG4gICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgLmNsYXNzZWQoZGVmYXVsdF9jbGFzc2VzLlRPT0xUSVAsIHRydWUpXG4gICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMClcbiAgICB9XG4gICAgdG9vbHRpcC5odG1sKGA8aDU+JHtkYXRhLnNlcmllc308L2g1PjxwPiR7ZGF0YS5uYW1lfTogJHtkYXRhLnZhbHVlfTwvcD5gKTtcbiAgICByZXR1cm4gdG9vbHRpcDtcbiAgfVxuICBfcmVtb3ZlVG9vbHRpcCAoKSB7XG4gICAgZDMuc2VsZWN0KGAuJHtkZWZhdWx0X2NsYXNzZXMuVE9PTFRJUH1gKVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKVxuICAgICAgLnJlbW92ZSgpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFyQ2hhcnQ7XG4iLCIvKipcbiAqIG1vcm5pbmdzdGFyLWJhc2UtY2hhcnRzXG4gKlxuICogQ29weXJpZ2h0IMKpIDIwMTYgLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZGVmYXVsdENsYXNzZXMgZnJvbSBcIi4uL2NvbmZpZy9jbGFzc2VzLmpzXCI7XG5cbi8vIHByaXZhdGVzXG52YXIgX2NoYXJ0cyA9IFtdLFxuICAgIF9zdmcsXG4gICAgX2RpbWVuc2lvbnMsXG4gICAgX2F4ZXMsXG4gICAgX2V2ZW50O1xuXG5jbGFzcyBDYW52YXN7XG4gICAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICAgICAgLy8gaW5pY2lhbGl6YSBlbCBjYW52YXNcbiAgICAgICAgX2NoYXJ0cyA9IFtdO1xuICAgICAgICBfZGltZW5zaW9ucyA9IG9wdGlvbnMuZGltZW5zaW9ucztcbiAgICAgICAgX3N2ZyA9IHRoaXMuX2luaXRDYW52YXMob3B0aW9ucy5jaGFydENvbnRhaW5lcik7XG4gICAgICAgIF9ldmVudCA9IG9wdGlvbnMuZXZlbnQ7XG4gICAgICAgIF9heGVzID0gb3B0aW9ucy5heGVzO1xuXG4gICAgICAgIHRoaXMuX2FkZExpc3RlbmVycygpO1xuICAgIH1cblxuXG4gICAgLy8gcHVibGljIG1ldGhvZHNcblxuICAgIC8qKlxuICAgICAqIEFkaWNpb25hIHVuIGdyw6FmaWNvIGFsIGNhbnZhc1xuICAgICAqXG4gICAgICogQHBhcmFtIHthbnl9IGNoYXJ0XG4gICAgICogQHJldHVybnNcblxuICAgIC8vIHByaXZhdGVzXG4gICAgdmFyIF9jaGFydHMgPSBbXTsgKi9cblxuICAgIGFkZCAoY2hhcnQpe1xuICAgICAgICBpZiAoY2hhcnQpIHtcbiAgICAgICAgICAgIGNoYXJ0LnJlbmRlcigpO1xuICAgICAgICAgICAgX2NoYXJ0cy5wdXNoKGNoYXJ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWRyYXcgKGRpbWVuc2lvbnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGltZW5zaW9ucyk7XG4gICAgICAgIF9kaW1lbnNpb25zID0gZGltZW5zaW9ucztcbiAgICAgICAgdGhpcy5fdXBkYXRlUm9vdCgpO1xuICAgICAgICB0aGlzLmFkZEF4ZXMoKTtcbiAgICAgICAgX2NoYXJ0cy5mb3JFYWNoKGNoYXJ0ID0+IHtcbiAgICAgICAgICAgIGNoYXJ0LnJlbmRlcih7YW5pbWF0aW9uOiBmYWxzZX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgY2hhcnRzICgpIHtcbiAgICAgICAgcmV0dXJuIF9jaGFydHM7XG4gICAgfVxuXG4gICAgZ2V0IHN2ZyAoKSB7XG4gICAgICAgIHJldHVybiBfc3ZnO1xuICAgIH1cblxuICAgIGdldCBkaW1lbnNpb25zICgpIHtcbiAgICAgICAgcmV0dXJuIF9kaW1lbnNpb25zO1xuICAgIH1cblxuICAgIGFkZEF4ZXMgKCkge1xuICAgICAgICB2YXIgeVRpY2tTaXplID0gX2F4ZXMueS50aWNrU2l6ZSgpO1xuXG4gICAgICAgIF9zdmcuc2VsZWN0QWxsKGAuJHtkZWZhdWx0Q2xhc3Nlcy5BWElTfWApLnJlbW92ZSgpO1xuXG4gICAgICAgIGlmIChfYXhlcykge1xuICAgICAgICAgICAgaWYgKF9heGVzLngpe1xuICAgICAgICAgICAgICAgIF9zdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBbZGVmYXVsdENsYXNzZXMuQVhJU106IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBbZGVmYXVsdENsYXNzZXMuQVhJU19YXTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7X2RpbWVuc2lvbnMubWFyZ2lucy5sZWZ0ICsgeVRpY2tTaXplIH0sICR7X2RpbWVuc2lvbnMuaGVpZ2h0fSlgKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChfYXhlcy54KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfYXhlcy55KXtcbiAgICAgICAgICAgICAgICBfc3ZnLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgW2RlZmF1bHRDbGFzc2VzLkFYSVNdOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgW2RlZmF1bHRDbGFzc2VzLkFYSVNfWV06IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke19kaW1lbnNpb25zLm1hcmdpbnMubGVmdCArIHlUaWNrU2l6ZX0sIDApYClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoX2F4ZXMueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRHcmlkQXJlYSgpO1xuICAgICAgICB0aGlzLmFkZEJhY2tab25lcygpO1xuICAgICAgICB0aGlzLmFkZENoYXJ0QXJlYSgpO1xuICAgICAgICB0aGlzLmFkZFpvbmVzKCk7XG4gICAgICAgIF9ldmVudC50cmlnZ2VyKFwiYXhpc19yZW5kZXJlZFwiKTtcbiAgICB9XG5cbiAgICBhZGRCYWNrWm9uZXMgKCkge1xuICAgICAgICB2YXIgeFNjYWxlID0gX2F4ZXMueC5zY2FsZSgpLFxuICAgICAgICAgICAgeERvbWFpbiA9IHhTY2FsZS5kb21haW4oKSxcbiAgICAgICAgICAgIHlUaWNrU2l6ZSA9IF9heGVzLnkudGlja1NpemUoKTtcblxuICAgICAgICBfc3ZnLnNlbGVjdChgLiR7ZGVmYXVsdENsYXNzZXMuQkFDS1pPTkVTfWApXG4gICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIHZhciB6b25lcyA9IF9zdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmNsYXNzZWQoZGVmYXVsdENsYXNzZXMuQkFDS1pPTkVTLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke19kaW1lbnNpb25zLm1hcmdpbnMubGVmdCArIHlUaWNrU2l6ZX0sIDApYCk7XG5cbiAgICAgICAgem9uZXMuc2VsZWN0QWxsKGAuJHtkZWZhdWx0Q2xhc3Nlcy5CQUNLWk9ORX1gKVxuICAgICAgICAgICAgLmRhdGEoeERvbWFpbikuZW50ZXIoKVxuICAgICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAuYXR0cnMoe1xuICAgICAgICAgICAgICAgICAgICBcInRyYW5zZm9ybVwiOiAoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSB4U2NhbGUoZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3h9LCAwKWA7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiY2xhc3NcIjogKGQsIGkpID0+IGAke2RlZmF1bHRDbGFzc2VzLkJBQ0taT05FfS0ke2l9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZFpvbmVzICgpIHtcbiAgICAgICAgdmFyIHhTY2FsZSA9IF9heGVzLnguc2NhbGUoKSxcbiAgICAgICAgICAgIHlTY2FsZSA9IF9heGVzLnkuc2NhbGUoKSxcbiAgICAgICAgICAgIHhEb21haW4gPSB4U2NhbGUuZG9tYWluKCksXG4gICAgICAgICAgICB4V2lkdGggPSB4U2NhbGUucmFuZ2VCYW5kKCksXG4gICAgICAgICAgICB5VGlja1NpemUgPSBfYXhlcy55LnRpY2tTaXplKCk7XG5cbiAgICAgICAgX3N2Zy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLlpPTkVTfWApXG4gICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIHZhciB6b25lcyA9IF9zdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmNsYXNzZWQoZGVmYXVsdENsYXNzZXMuWk9ORVMsIHRydWUpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7X2RpbWVuc2lvbnMubWFyZ2lucy5sZWZ0ICsgeVRpY2tTaXplfSwgMClgKTtcblxuICAgICAgICB6b25lcy5zZWxlY3RBbGwoYC4ke2RlZmF1bHRDbGFzc2VzLlpPTkV9YClcbiAgICAgICAgICAgIC5kYXRhKHhEb21haW4pLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHJzKHtcbiAgICAgICAgICAgICAgICAgICAgXCJjbGFzc1wiOiAoZCxpKSA9PiBgJHtkZWZhdWx0Q2xhc3Nlcy5aT05FfSAke2RlZmF1bHRDbGFzc2VzLlpPTkV9LSR7aX1gLFxuICAgICAgICAgICAgICAgICAgICB4OiBkID0+ICh4U2NhbGUoZCkpLFxuICAgICAgICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogeFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHlTY2FsZSgwKSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMC4wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQ2hhcnRBcmVhICgpIHtcbiAgICAgICAgdmFyIHlUaWNrU2l6ZSA9IF9heGVzLnkudGlja1NpemUoKTtcbiAgICAgICAgX3N2Zy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkNIQVJUU19BUkVBfWApXG4gICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIF9zdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmNsYXNzZWQoZGVmYXVsdENsYXNzZXMuQ0hBUlRTX0FSRUEsIHRydWUpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7X2RpbWVuc2lvbnMubWFyZ2lucy5sZWZ0ICsgeVRpY2tTaXplfSwgMClgKTtcbiAgICB9XG5cbiAgICBhZGRHcmlkQXJlYSAoKSB7XG4gICAgICAgIHZhciB5VGlja1NpemUgPSBfYXhlcy55LnRpY2tTaXplKCk7XG4gICAgICAgIF9zdmcuc2VsZWN0KGAuJHtkZWZhdWx0Q2xhc3Nlcy5HUklEfWApXG4gICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIF9zdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmNsYXNzZWQoZGVmYXVsdENsYXNzZXMuR1JJRCwgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtfZGltZW5zaW9ucy5tYXJnaW5zLmxlZnQgKyB5VGlja1NpemV9LCAwKWApO1xuICAgIH1cblxuICAgIHJlbW92ZSAoLypjaGFydCovKSB7XG4gICAgICAgIC8vIHJlbXVldmUgdW4gZ8OhZmljbyBkZWwgY2FudmFzXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIF9pbml0Q2FudmFzIChjaGFydENvbnRhaW5lcikge1xuICAgICAgICB0aGlzLl9yb290ID0gY2hhcnRDb250YWluZXJcbiAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgX2RpbWVuc2lvbnMud2lkdGggKyBfZGltZW5zaW9ucy5tYXJnaW5zLmxlZnQgKyBfZGltZW5zaW9ucy5tYXJnaW5zLnJpZ2h0KVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgX2RpbWVuc2lvbnMuaGVpZ2h0ICsgX2RpbWVuc2lvbnMubWFyZ2lucy50b3AgKyBfZGltZW5zaW9ucy5tYXJnaW5zLmJvdHRvbSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5jbGFzc2VkKGRlZmF1bHRDbGFzc2VzLkNBTlZBUywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtfZGltZW5zaW9ucy5tYXJnaW5zLmxlZnR9LCAke19kaW1lbnNpb25zLm1hcmdpbnMucmlnaHR9KWApO1xuICAgIH1cblxuICAgIF91cGRhdGVSb290ICgpIHtcbiAgICAgICAgdGhpcy5fcm9vdFxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBfZGltZW5zaW9ucy53aWR0aCArIF9kaW1lbnNpb25zLm1hcmdpbnMubGVmdCArIF9kaW1lbnNpb25zLm1hcmdpbnMucmlnaHQpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBfZGltZW5zaW9ucy5oZWlnaHQgKyBfZGltZW5zaW9ucy5tYXJnaW5zLnRvcCArIF9kaW1lbnNpb25zLm1hcmdpbnMuYm90dG9tKTtcbiAgICAgICAgdGhpcy5fcm9vdC5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkNBTlZBU31gKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke19kaW1lbnNpb25zLm1hcmdpbnMubGVmdH0sICR7X2RpbWVuc2lvbnMubWFyZ2lucy5yaWdodH0pYCk7XG4gICAgfVxuXG4gICAgX2FkZExpc3RlbmVycyAoKSB7XG4gICAgICAgIF9ldmVudC5kaXNwYXRjaC5vbihcImF4aXNfdXBkYXRlZFwiLCB0aGlzLmFkZEF4ZXMuYmluZCh0aGlzKSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhcztcbiIsImxldCBfaW5zdGFuY2UgPSBudWxsO1xuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgaWYgKCFfaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIF9pbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZGlzcGF0Y2ggPSBkMy5kaXNwYXRjaChcImF4aXNfdXBkYXRlZFwiLCBcImF4aXNfcmVuZGVyZWRcIiwgXCJ6b25lX21vdXNlb3ZlclwiLCBcInpvbmVfbW91c2VvdXRcIik7XG4gICAgICAgIHRoaXMudGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHJldHVybiBfaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgdHJpZ2dlciAodHlwZSwgZGF0YSkge1xuICAgICAgICB0aGlzLl9kaXNwYXRjaFt0eXBlXShkYXRhKTtcbiAgICB9XG5cbiAgICBnZXQgZGlzcGF0Y2ggKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlzcGF0Y2g7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudDsiLCIvKipcbiAqIG1vcm5pbmdzdGFyLWJhc2UtY2hhcnRzXG4gKlxuICogQ29weXJpZ2h0IMKpIDIwMTYgLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgX2F4ZXMgPSB7fSxcbiAgICBfZXZlbnQ7XG5cbmNsYXNzIEF4ZXNNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvciAoYXhlc0NvbmZpZywgZXZlbnQpIHtcbiAgICAgICAgX2V2ZW50ID0gZXZlbnQ7XG4gICAgICAgIGlmICghYXhlc0NvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgX2F4ZXMgPSBheGVzQ29uZmlnO1xuICAgICAgICBfZXZlbnQudHJpZ2dlcihcImF4aXNfdXBkYXRlZFwiKTtcbiAgICB9XG5cbiAgICB1cGRhdGUgKGF4ZXMpIHtcbiAgICAgICAgX2F4ZXMgPSBheGVzO1xuICAgICAgICBfZXZlbnQudHJpZ2dlcihcImF4aXNfdXBkYXRlZFwiKTtcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIF9heGVzLng7XG4gICAgfVxuXG4gICAgc2V0IHgoYXhpcykge1xuICAgICAgICBfYXhlcy54ID0gYXhpcztcbiAgICB9XG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiBfYXhlcy55O1xuICAgIH1cblxuICAgIHNldCB5KGF4aXMpIHtcbiAgICAgICAgX2F4ZXMueSA9IGF4aXM7XG4gICAgfVxuICAgIGdldCB4MigpIHtcbiAgICAgICAgcmV0dXJuIF9heGVzLngyO1xuICAgIH1cblxuICAgIHNldCB4MihheGlzKSB7XG4gICAgICAgIF9heGVzLngyID0gYXhpcztcbiAgICB9XG4gICAgZ2V0IHkyKCkge1xuICAgICAgICByZXR1cm4gX2F4ZXMueTI7XG4gICAgfVxuXG4gICAgc2V0IHkyKGF4aXMpIHtcbiAgICAgICAgX2F4ZXMueTIgPSBheGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXhlc01hbmFnZXI7IiwiXG4vKipcbiAqXG4gKlxuICogQGNsYXNzIEJhc2VDaGFydFxuICovXG5pbXBvcnQgQ2FudmFzIGZyb20gXCIuL2NhbnZhcy5qc1wiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCIuLi91dGlscy9ldmVudC5qc1wiO1xuaW1wb3J0IEF4ZXNNYW5hZ2VyIGZyb20gXCIuL2F4ZXNNYW5hZ2VyLmpzXCI7XG5pbXBvcnQgZGVmYXVsdENsYXNzZXMgZnJvbSBcIi4uL2NvbmZpZy9jbGFzc2VzLmpzXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuLi9jb25maWcvY29uZmlnLmpzXCI7XG5cbmNsYXNzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3B0aW9ucyByZXF1aXJlZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2xvcnMgPSBDb25maWcuY29sb3JzO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnJhd0RhdGEgPSBbXTtcbiAgICAgICAgdGhpcy5ldmVudCA9IG5ldyBFdmVudCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdChvcHRpb25zLmNvbnRhaW5lcikuY2xhc3NlZChkZWZhdWx0Q2xhc3Nlcy5DSEFSVCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuY2hhcnRDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoXCJkaXZcIikuY2xhc3NlZChkZWZhdWx0Q2xhc3Nlcy5DT05UQUlORVIsIHRydWUpO1xuICAgICAgICB0aGlzLmVsQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWxDaGFydENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5jb250YWluZXIgKyBcIiAuXCIgKyBkZWZhdWx0Q2xhc3Nlcy5DT05UQUlORVIpO1xuICAgICAgICB0aGlzLl9jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cbiAgICAgICAgdGhpcy5ldmVudC5kaXNwYXRjaC5vbihcImF4aXNfcmVuZGVyZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW5pdEludGVyYWN0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5fYWZ0ZXJBeGlzKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZCAoY2hhcnRDbGFzcywgb3B0aW9ucykge1xuICAgICAgICB0aGlzLl9hZGRSYXdEYXRhKG9wdGlvbnMuZGF0YSk7XG5cbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IGNoYXJ0Q2xhc3Moe1xuICAgICAgICAgICAgZGF0YTogb3B0aW9ucy5kYXRhLFxuICAgICAgICAgICAgY2FudmFzOiB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIGF4ZXM6IHRoaXMuYXhlcyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGNvbG9yU2NhbGU6IHRoaXMuY29sb3JTY2FsZSxcbiAgICAgICAgICAgIGV2ZW50OiB0aGlzLmV2ZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZUF4ZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmFkZChjaGFydCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldENvbG9yIChpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1tpXTtcbiAgICB9XG5cbiAgICBpbml0ICgpIHtcbiAgICAgICAgdGhpcy5heGVzID0gbmV3IEF4ZXNNYW5hZ2VyKHRoaXMuX3NldEF4ZXMoKSwgdGhpcy5ldmVudCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcygpO1xuICAgIH1cblxuICAgIHJlY2FsY3VsYXRlICgpIHtcbiAgICAgICAgdGhpcy5fY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuICAgICAgICB0aGlzLl9zZXRBeGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUF4ZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnJlZHJhdyh0aGlzLmRpbWVuc2lvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdEludGVyYWN0aW9ucyAoKSB7XG4gICAgICAgIHZhciB6b25lcyA9IHRoaXMuY2FudmFzLnN2Zy5zZWxlY3RBbGwoYC4ke2RlZmF1bHRDbGFzc2VzLlpPTkV9YCk7XG4gICAgICAgIHpvbmVzLm9uKFwibW91c2VvdmVyXCIsIChkLGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3pvbmVNb3VzZW92ZXIoaSk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50LnRyaWdnZXIoXCJ6b25lX21vdXNlb3ZlclwiLCBpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKFwibW91c2VvdXRcIiwgKGQsaSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fem9uZU1vdXNlb3V0KGkpO1xuICAgICAgICAgICAgdGhpcy5ldmVudC50cmlnZ2VyKFwiem9uZV9tb3VzZW91dFwiLCBpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHdpbmRvdylcbiAgICAgICAgICAgIC5vbihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2FkZFJhd0RhdGEgKGRhdGEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5yYXdEYXRhLmxlbmd0aDtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICAgICAgICAgIHZhbC5pbmRleCA9IGluZGV4Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5yYXdEYXRhID0gdGhpcy5yYXdEYXRhLmNvbmNhdCh2YWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB0aGlzLnJhd0RhdGEucHVzaChkYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDYW52YXMgKCkge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoe1xuICAgICAgICAgICAgY2hhcnRDb250YWluZXI6IHRoaXMuY2hhcnRDb250YWluZXIsXG4gICAgICAgICAgICBkaW1lbnNpb25zOiB0aGlzLmRpbWVuc2lvbnMsXG4gICAgICAgICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgICAgICAgIGF4ZXM6IHRoaXMuYXhlc1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIF9jYWxjdWxhdGVEaW1lbnNpb25zKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfY2FsY3VsYXRlRGltZW5zaW9ucyBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBfc2V0QXhlcygpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiX3NldEF4ZXMgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBfYWZ0ZXJBeGlzICgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiX2FmdGVyQXhpcyBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBfdXBkYXRlQXhlcygpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiX3VwZGF0ZUF4ZXMgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgX3NldENvbG9yU2NhbGUgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfc2V0Q29sb3JTY2FsZSBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBfem9uZU1vdXNlb3ZlciAoKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIl96b25lTW91c2VvdmVyIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIF96b25lTW91c2VvdXQgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJfem9uZU1vdXNlb3V0IG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlOyIsIi8qKlxuICogbW9ybmluZ3N0YXItYmFzZS1jaGFydHNcbiAqXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiAuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBCYXNlIGZyb20gXCIuL2Jhc2UuanNcIjtcbmltcG9ydCBkZWZhdWx0Q2xhc3NlcyBmcm9tIFwiLi4vY29uZmlnL2NsYXNzZXMuanNcIjtcbmltcG9ydCB7IENoYXJ0VXRpbHMgfSBmcm9tIFwiLi4vdXRpbHMvdXRpbHMuanNcIjtcblxudmFyICBfYXhlcyA9IHt9LFxuICAgIF90aWNrU2l6ZSwgX3RpY2tTcGFjZTtcblxuY2xhc3MgQXhlc1R5cGUxIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIHRoaXMueERvbWFpbiA9IG9wdGlvbnMuZG9tYWluO1xuICAgICAgICBfdGlja1NpemUgPSBvcHRpb25zLnRpY2tTaXplIHx8IDA7XG4gICAgICAgIF90aWNrU3BhY2UgPSBvcHRpb25zLnRpY2tTcGFjZSB8fCAwO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc2VkKFwibWJjLWNoYXJ0LXR5cGUtMVwiLCB0cnVlKTtcbiAgICAgICAgdGhpcy5fc2V0Q29sb3JTY2FsZSgpO1xuICAgICAgICB0aGlzLl9zZXRBeGVzKCk7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgICAgIC8vIHRoaXMuX2RyYXdMaW5lcygpO1xuICAgICAgICAvLyB0aGlzLl9tYWtldXAoKTtcbiAgICB9XG5cbiAgICBfc2V0Q29sb3JTY2FsZSAoKSB7XG4gICAgICAgIHRoaXMuY29sb3JTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZSh0aGlzLmNvbG9ycyk7XG4gICAgfVxuXG4gICAgX2FmdGVyQXhpcygpIHtcbiAgICAgICAgdGhpcy5fZHJhd0xpbmVzKCk7XG4gICAgICAgIHRoaXMuX21ha2V1cCgpO1xuICAgIH1cblxuICAgIF9zZXRBeGVzKCkge1xuICAgICAgICB2YXIgeFNjYWxlcyA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgICAgICAgICAgIC5yYW5nZVJvdW5kQmFuZHMoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aCAtIF90aWNrU2l6ZSAtIF90aWNrU3BhY2VdLCAwLjA1KSAvLyBUT0RPOiBQYXJhbWV0cml6ZWRcbiAgICAgICAgICAgICAgICAuZG9tYWluKHRoaXMueERvbWFpbiksXG4gICAgICAgICAgICB5U2NhbGVzID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgICAgICAgICAgICAucmFuZ2UoW3RoaXMuZGltZW5zaW9ucy5oZWlnaHQsIDBdKTtcblxuICAgICAgICBfYXhlcy54ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgLnNjYWxlKHhTY2FsZXMpXG4gICAgICAgICAgICAudGlja1NpemUoMCk7XG5cbiAgICAgICAgX2F4ZXMueSA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgIC5zY2FsZSh5U2NhbGVzKVxuICAgICAgICAgICAgLnRpY2tTaXplKF90aWNrU2l6ZSlcbiAgICAgICAgICAgIC5vcmllbnQoXCJsZWZ0XCIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBfYXhlcy54LFxuICAgICAgICAgICAgeTogX2F4ZXMueVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHRoaXMuY2FudmFzLmFkZEF4ZXMoX2F4ZXMpO1xuICAgIH1cblxuICAgIF91cGRhdGVBeGVzICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PntcbiAgICAgICAgICAgIHZhciBhbGxWYWx1ZXMgPSBDaGFydFV0aWxzLmdldEFsbFZhbHVlcyh0aGlzLnJhd0RhdGEpLFxuICAgICAgICAgICAgICAgIC8vIGNhdGVnb3JpZXMgPSB0aGlzLnJhd0RhdGEubWFwKHZhbHVlID0+IHZhbHVlLm5hbWUpLFxuICAgICAgICAgICAgICAgIHlTY2FsZSA9IF9heGVzLnkuc2NhbGUoKSxcbiAgICAgICAgICAgICAgICBoYXNOZWdhdGl2ZSA9IENoYXJ0VXRpbHMuaGFzTmVnYXRpdmUoYWxsVmFsdWVzKSxcbiAgICAgICAgICAgICAgICBkb21haW4gPSBDaGFydFV0aWxzLmdldERvbWFpbihhbGxWYWx1ZXMsIGhhc05lZ2F0aXZlLCAxMCksXG4gICAgICAgICAgICAgICAgdGlja1ZhbHVlcyA9IENoYXJ0VXRpbHMuZ2V0VGlja1ZhbHVlcyhkb21haW4sIGhhc05lZ2F0aXZlKSA7XG5cbiAgICAgICAgICAgIHlTY2FsZVxuICAgICAgICAgICAgICAgIC5kb21haW4oZG9tYWluKTtcblxuICAgICAgICAgICAgX2F4ZXMueS5zY2FsZSh5U2NhbGUpXG4gICAgICAgICAgICAgICAgLnRpY2tWYWx1ZXModGlja1ZhbHVlcyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXhlcy51cGRhdGUoX2F4ZXMpO1xuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9nZXRUaWNrVmFsdWVzKGRvbWFpbiwgaGFzTmVnYXRpdmUpIHtcbiAgICAgICAgdmFyIGRpdmlzb3IgPSAoaGFzTmVnYXRpdmUpID8gMiA6IDQsXG4gICAgICAgICAgICBkb21haW5fc3RlcCA9IGRvbWFpbiAvIGRpdmlzb3IsXG4gICAgICAgICAgICB2YWx1ZSA9IGhhc05lZ2F0aXZlID8gZG9tYWluICogLTEgOiAwO1xuXG4gICAgICAgIHRoaXMudGlja1ZhbHVlcyA9IFtdO1xuXG4gICAgICAgIHdoaWxlICh2YWx1ZSA8IGRvbWFpbikge1xuICAgICAgICAgICAgdGhpcy50aWNrVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgdmFsdWUgKz0gZG9tYWluX3N0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aWNrVmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIF9tYWtldXAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpcy5jb250YWluZXI7XG4gICAgICAgIGMuc2VsZWN0QWxsKGAuJHtkZWZhdWx0Q2xhc3Nlcy5BWElTX1l9IC50aWNrIHRleHRgKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgMTIpXG4gICAgICAgICAgICAgICAgLmZpcnN0KClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgLTEwKTtcblxuICAgICAgICBjLnNlbGVjdEFsbChgLiR7ZGVmYXVsdENsYXNzZXMuQVhJU19ZfSAudGlja2ApLmZpcnN0KCkuY2xhc3NlZChcImRhcmtcIiwgdHJ1ZSk7XG4gICAgICAgIGMuc2VsZWN0QWxsKGAuJHtkZWZhdWx0Q2xhc3Nlcy5BWElTX1l9IC50aWNrYCkubGFzdCgpLmNsYXNzZWQoXCJkYXJrXCIsIHRydWUpO1xuXG4gICAgICAgIGlmIChfYXhlcy55LnNjYWxlKCkuZG9tYWluKClbMF0gPCAwKSB7XG4gICAgICAgICAgICBjLnNlbGVjdEFsbChgLiR7ZGVmYXVsdENsYXNzZXMuR1JJRH0gbGluZWApLmZpcnN0KCkuY2xhc3NlZChcImRhcmtcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjLnNlbGVjdEFsbChgLiR7ZGVmYXVsdENsYXNzZXMuR1JJRH0gbGluZWApLmZpcnN0KCkucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgYy5zZWxlY3RBbGwoYC4ke2RlZmF1bHRDbGFzc2VzLkdSSUR9IGxpbmVgKS5sYXN0KCkuY2xhc3NlZChcImRhcmtcIiwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgX2RyYXdMaW5lcygpIHtcbiAgICAgICAgdmFyIHRpY2tzID0gX2F4ZXMueS50aWNrVmFsdWVzKCksXG4gICAgICAgICAgICB5VGlja1NpemUgPSBfYXhlcy55LnRpY2tTaXplKCksXG4gICAgICAgICAgICB5U2NhbGUgPSBfYXhlcy55LnNjYWxlKCk7XG5cbiAgICAgICAgaWYgKCF0aWNrcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FudmFzLnN2Z1xuICAgICAgICAgICAgLnNlbGVjdChgLiR7ZGVmYXVsdENsYXNzZXMuR1JJRH1gKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcImxpbmVcIikuZGF0YSh0aWNrcylcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAwKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5U2NhbGUpXG4gICAgICAgICAgICAuYXR0cihcIngyXCIsIHRoaXMuZGltZW5zaW9ucy53aWR0aCAtIHlUaWNrU2l6ZSlcbiAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgeVNjYWxlKVxuICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCIjZGVkZWRlXCIpXG4gICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjFcIik7XG4gICAgfVxuXG5cbiAgICBfY2FsY3VsYXRlRGltZW5zaW9ucygpIHtcbiAgICAgICAgdmFyIG1hcmdpbnMgPSB7dG9wOiAyMCwgcmlnaHQ6IDIwLCBib3R0b206IDIwLCBsZWZ0OiAyMH07XG4gICAgICAgIHZhciB0aWNrU2l6ZSA9IChfdGlja1NpemUgfHwgMCk7XG4gICAgICAgIHZhciB0aWNrU3BhY2UgPSAoX3RpY2tTcGFjZSB8fCAwKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jaGFydENvbnRhaW5lclswXVswXSwgdGhpcy5jaGFydENvbnRhaW5lclswXVswXS5vZmZzZXRXaWR0aCk7XG4gICAgICAgIHRoaXMuZGltZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIG1hcmdpbnMsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5jaGFydENvbnRhaW5lclswXVswXS5vZmZzZXRXaWR0aCAtIG1hcmdpbnMubGVmdCAtIG1hcmdpbnMucmlnaHQgLSB0aWNrU2l6ZSAtIHRpY2tTcGFjZSxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5lbENvbnRhaW5lci5vZmZzZXRIZWlnaHQgLSBtYXJnaW5zLnRvcCAtIG1hcmdpbnMuYm90dG9tXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGltZW5zaW9ucyk7XG4gICAgfVxuXG4gICAgX3pvbmVNb3VzZW92ZXIoaW5kZXgpIHtcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLmNhbnZhcy5zdmdcbiAgICAgICAgICAgIC5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLlpPTkV9LSR7aW5kZXh9YCksXG4gICAgICAgICAgICBiYWNrem9uZSA9IHRoaXMuY2FudmFzLnN2Zy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkJBQ0taT05FfS0ke2luZGV4fWApO1xuXG5cbiAgICAgICAgdmFyIHhTY2FsZSA9IF9heGVzLnguc2NhbGUoKSxcbiAgICAgICAgICAgIHlTY2FsZSA9IF9heGVzLnkuc2NhbGUoKSxcbiAgICAgICAgICAgIHlSYW5nZSA9IHlTY2FsZS5yYW5nZSgpLFxuICAgICAgICAgICAgd2lkdGggPSB4U2NhbGUucmFuZ2VCYW5kKCk7XG5cbiAgICAgICAgem9uZS50cmFuc2l0aW9uKCkuZHVyYXRpb24oNDAwKVxuICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjEpXG4gICAgICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIG51bGwpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2VcIiwgMSlcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZS1maWxsXCIsIFwiIzY2NlwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh5UmFuZ2UpO1xuICAgICAgICB2YXIgbGluZSA9IGJhY2t6b25lLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgIC5hdHRycyh7XG4gICAgICAgICAgICAgICAgXCJ4MVwiOiAod2lkdGggLyAyKSxcbiAgICAgICAgICAgICAgICBcIngyXCI6ICh3aWR0aCAvIDIpLFxuICAgICAgICAgICAgICAgIFwieTFcIjogMCwgLy95U2NhbGUoZDMubWF4KHlSYW5nZSkpLFxuICAgICAgICAgICAgICAgIFwieTJcIjogMCxcbiAgICAgICAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiAxLFxuICAgICAgICAgICAgICAgIFwic3Ryb2tlXCI6IFwiI2FhYVwiLFxuICAgICAgICAgICAgICAgIFwic3Ryb2tlLWRhc2hhcnJheVwiOiBcIjQsIDVcIixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBsaW5lLnRyYW5zaXRpb24oKS5kdXJhdGlvbig0MDApXG4gICAgICAgICAgICAuYXR0cihcInkyXCIsIHlTY2FsZShkMy5taW4oeVJhbmdlKSkpO1xuICAgIH1cblxuICAgIF96b25lTW91c2VvdXQgKGluZGV4KSB7XG4gICAgICAgIHZhciB6b25lID0gdGhpcy5jYW52YXMuc3ZnXG4gICAgICAgICAgICAuc2VsZWN0KGAuJHtkZWZhdWx0Q2xhc3Nlcy5aT05FfS0ke2luZGV4fWApLFxuICAgICAgICAgICAgYmFja3pvbmUgPSB0aGlzLmNhbnZhcy5zdmcuc2VsZWN0KGAuJHtkZWZhdWx0Q2xhc3Nlcy5CQUNLWk9ORX0tJHtpbmRleH1gKTtcblxuICAgICAgICB6b25lLnRyYW5zaXRpb24oKS5kdXJhdGlvbig0MDApXG4gICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIG51bGwpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2VcIiwgMClcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZS1jb2xvclwiLCBudWxsKTtcblxuICAgICAgICBiYWNrem9uZS5zZWxlY3RBbGwoXCJsaW5lXCIpLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8vIF9jcmVhdGVMZWdlbmQoKSB7XG4gICAgLy8gICAgIHZhciBhRW50ZXIgPSB0aGlzLmNvbnRhaW5lci5zZWxlY3QoXCIubWJjLWNoYXJ0LWxlZ2VuZFwiKVxuICAgIC8vICAgICAgICAgLnNlbGVjdEFsbChcImRpdlwiKVxuICAgIC8vICAgICAgICAgLmRhdGEodGhpcy5vcHRpb25zLmRhdGEudmFsdWVzLm1hcChkID0+IGQubmFtZSkpXG4gICAgLy8gICAgICAgICAuZW50ZXIoKVxuICAgIC8vICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgIC8vICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCAoZCwgaSkgPT4gKGRlZmF1bHRDbGFzc2VzLkxFR0VORF9JVEVNICsgXCItXCIgKyBpKSlcbiAgICAvLyAgICAgICAgIC5jbGFzc2VkKGRlZmF1bHRDbGFzc2VzLkxFR0VORF9JVEVNLCB0cnVlKVxuICAgIC8vICAgICAgICAgLmFwcGVuZChcImFcIik7XG5cbiAgICAvLyAgICAgYUVudGVyLmFwcGVuZChcInNwYW5cIikuYXR0cihcImNsYXNzXCIsIFwibWJjLWNoYXJ0LWxlZ2VuZC1zcXVhcmVcIilcbiAgICAvLyAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgaWQgPT4gdGhpcy5nZXRDb2xvcihpZCkpO1xuXG4gICAgLy8gICAgIGFFbnRlci5hcHBlbmQoXCJwXCIpLmh0bWwoaWQgPT4gaWQpO1xuXG4gICAgLy8gICAgIGFFbnRlclxuICAgIC8vICAgICAgICAgLm9uKFwibW91c2VvdmVyXCIsIChpZCwgaSkgPT4gdGhpcy5mb2N1cyhpZCwgaSkpXG4gICAgLy8gICAgICAgICAub24oXCJtb3VzZW91dFwiLCAoKSA9PiB0aGlzLmJsdXIoKSlcbiAgICAvLyAgICAgICAgIC5vbihcImNsaWNrXCIsIChpZCwgaSkgPT4gdGhpcy50b2dnbGUoaWQsIGkpKTtcbiAgICAvLyB9XG5cbiAgICAvLyBfY3JlYXRlVG9vbHRpcChkYXRhKSB7XG4gICAgLy8gICAgIHZhciB0b29sdGlwID0gZDMuc2VsZWN0KGAuJHtkZWZhdWx0Q2xhc3Nlcy5UT09MVElQfWApO1xuICAgIC8vICAgICBpZiAodG9vbHRpcC5lbXB0eSgpKSB7XG4gICAgLy8gICAgICAgICB0b29sdGlwID0gZDMuc2VsZWN0KFwiYm9keVwiKVxuICAgIC8vICAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAvLyAgICAgICAgICAgICAuY2xhc3NlZChkZWZhdWx0Q2xhc3Nlcy5UT09MVElQLCB0cnVlKVxuICAgIC8vICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgdG9vbHRpcC5odG1sKGA8aDU+JHtkYXRhLnNlcmllc308L2g1PjxwPiR7ZGF0YS5uYW1lfTogJHtkYXRhLnZhbHVlfTwvcD5gKTtcbiAgICAvLyAgICAgcmV0dXJuIHRvb2x0aXA7XG4gICAgLy8gfVxuICAgIC8vIF9yZW1vdmVUb29sdGlwKCkge1xuICAgIC8vICAgICBkMy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLlRPT0xUSVB9YClcbiAgICAvLyAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAvLyAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMClcbiAgICAvLyAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAvLyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF4ZXNUeXBlMTtcbiIsIi8qKlxuICogbW9ybmluZ3N0YXItYmFzZS1jaGFydHNcbiAqXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiAuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBkZWZhdWx0Q2xhc3NlcyBmcm9tIFwiLi4vY29uZmlnL2NsYXNzZXMuanNcIjtcblxuY2xhc3MgQ2hhcnRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzID0gcGFyYW1zLmNhbnZhcztcbiAgICAgICAgdGhpcy5fY29sb3JTY2FsZSA9IHBhcmFtcy5jb2xvclNjYWxlO1xuICAgICAgICB0aGlzLl9heGVzID0gcGFyYW1zLmF4ZXM7XG4gICAgICAgIHRoaXMuX2V2ZW50ID0gcGFyYW1zLmV2ZW50O1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IHBhcmFtcy5kYXRhO1xuICAgICAgICB0aGlzLnR5cGUgPSB0aGlzLmRhdGEudHlwZTtcbiAgICAgICAgdGhpcy5pbmRleCA9IHBhcmFtcy5kYXRhLmluZGV4O1xuXG4gICAgICAgIHRoaXMuX2FkZExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIF9hZGRMaXN0ZW5lcnMgKCkge1xuICAgICAgICB0aGlzLl9ldmVudC5kaXNwYXRjaC5vbihgem9uZV9tb3VzZW92ZXIuJHt0aGlzLnR5cGV9LSR7dGhpcy5pbmRleH1gLCB0aGlzLm9uTW91c2VvdmVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9ldmVudC5kaXNwYXRjaC5vbihgem9uZV9tb3VzZW91dC4ke3RoaXMudHlwZX0tJHt0aGlzLmluZGV4fWAsIHRoaXMub25Nb3VzZW91dC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJyZW5kZXIgbm90IGltcGxlbWVudGVkXCIsIHRoaXMudHlwZSk7XG4gICAgfVxuXG4gICAgb25Nb3VzZW92ZXIgKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJvbk1vdXNlb3ZlciBub3QgaW1wbGVtZW50ZWRcIiwgdGhpcy50eXBlKTtcbiAgICB9XG5cbiAgICBvbk1vdXNlb3V0ICgpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwib25Nb3VzZW91dCBub3QgaW1wbGVtZW50ZWRcIiwgdGhpcy50eXBlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0QmFzZTsiLCIvKipcbiAqIG1vcm5pbmdzdGFyLWJhc2UtY2hhcnRzXG4gKlxuICogQ29weXJpZ2h0IMKpIDIwMTYgLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuaW1wb3J0IGRlZmF1bHRDbGFzc2VzIGZyb20gXCIuLi9jb25maWcvY2xhc3Nlcy5qc1wiO1xuaW1wb3J0IENoYXJ0QmFzZSBmcm9tIFwiLi9jaGFydEJhc2UuanNcIjtcblxuXG5jbGFzcyBCYXJDaGFydCBleHRlbmRzIENoYXJ0QmFzZXtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2lzU3RhY2tlZCA9IG9wdGlvbnMuZGF0YS5sZW5ndGggPiAxICYmIHR5cGVvZiBzdGFja2VkID09PSBcImJvb2xlYW5cIiAmJiBvcHRpb25zLnN0YWNrZWQ7XG4gICAgICAgIHRoaXMuX2lzR3JvdXBlZCA9ICF0aGlzLmlzU3RhY2tlZDtcbiAgICAgICAgdGhpcy5fZm9ybWF0RGF0YShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIHJlbmRlcihvcHRpb25zKSB7IC8vIE1VU1Q6XG4gICAgICAgIHZhciB5U2NhbGUgPSB0aGlzLl9heGVzLnkuc2NhbGUoKSxcbiAgICAgICAgICAgIHhTY2FsZSA9IHRoaXMuX2F4ZXMueC5zY2FsZSgpLFxuICAgICAgICAgICAgeDBTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgICAgICAgICAgIC5kb21haW4odGhpcy5fY2F0ZWdvcmllcylcbiAgICAgICAgICAgICAgICAucmFuZ2VSb3VuZEJhbmRzKFswLCB4U2NhbGUucmFuZ2VCYW5kKCldKSxcbiAgICAgICAgICAgIHZpcyA9IHRoaXMuX2NhbnZhcy5zdmdcbiAgICAgICAgICAgIC5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkNIQVJUU19BUkVBfWApLFxuICAgICAgICAgICAgYW5pbWF0aW9uID0gKG9wdGlvbnMgJiYgIW9wdGlvbnMuYW5pbWF0aW9uKSA/IGZhbHNlIDogdHJ1ZSxcbiAgICAgICAgICAgIGdyb3VwO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc0dyb3VwZWQpIHtcbiAgICAgICAgICAgIGdyb3VwID0gdmlzLnNlbGVjdEFsbChgLiR7ZGVmYXVsdENsYXNzZXMuQ0hBUlRfR1JPVVB9YClcbiAgICAgICAgICAgICAgICAuZGF0YSh0aGlzLmRhdGEpXG4gICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgKGQsIGkpID0+IGAke2RlZmF1bHRDbGFzc2VzLkNIQVJUX0dST1VQfSAke2RlZmF1bHRDbGFzc2VzLkNIQVJUX0dST1VQfS0ke2l9ICR7ZGVmYXVsdENsYXNzZXMuRk9DVVN9LSR7aX1gKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGQgPT4gXCJ0cmFuc2xhdGUoXCIgKyB4U2NhbGUoZC5zZXJpZXMpICsgXCIsMClcIik7XG5cbiAgICAgICAgICAgIHZhciBiYXJzID0gZ3JvdXAuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgIC5kYXRhKGQgPT4gZC52YWx1ZXMpXG4gICAgICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKTtcblxuICAgICAgICAgICAgYmFycy5hdHRyKFwid2lkdGhcIiwgeDBTY2FsZS5yYW5nZUJhbmQoKSlcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZCA9PiB4MFNjYWxlKGQuY2F0ZWdvcnkpKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBkID0+IHlTY2FsZShhbmltYXRpb24gPyAwIDogTWF0aC5tYXgoMCwgZC52YWx1ZSkpKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGQgPT4gKGFuaW1hdGlvbiA/IDAgOiBNYXRoLmFicyh5U2NhbGUoMCkgLSB5U2NhbGUoZC52YWx1ZSkpKSlcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGQgPT4gKGRlZmF1bHRDbGFzc2VzLkJBUiArIFwiLVwiICsgZC5pbmRleCkpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoZGVmYXVsdENsYXNzZXMuQkFSLCB0cnVlKVxuICAgICAgICAgICAgICAgIC5zdHlsZShcImZpbGxcIiwgKGQsIGkpID0+IHRoaXMuX2NvbG9yU2NhbGUoaSkpXG4gICAgICAgICAgICAgICAgLm9uKFwibW91c2VvdmVyXCIsIChkLCBpLCBqKSA9PiBkMy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkNIQVJUX0dST1VQfS0ke2p9IC4ke2RlZmF1bHRDbGFzc2VzLkJBUn0tJHtpfWApLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCBcIjAuNVwiKVxuXG4gICAgICAgIC8vICAgICAgICAgICAgIC8vIHRvb2x0aXBcbiAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy50b29sdGlwID0gc2VsZi5fY3JlYXRlVG9vbHRpcChkKVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAuOSlcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGQzLmV2ZW50LnBhZ2VYKSArIDEwICsgXCJweFwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIChkMy5ldmVudC5wYWdlWSAtIDI4KSAtIDEwICsgXCJweFwiKTtcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAvLyAub24oXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLnRvb2x0aXBcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGQzLmV2ZW50LnBhZ2VYKSArIDEwICsgXCJweFwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIChkMy5ldmVudC5wYWdlWSAtIDI4KSAtIDEwICsgXCJweFwiKTtcbiAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbihcIm1vdXNlb3V0XCIsIChkLCBpLCBqKSA9PiBkMy5zZWxlY3QoYC4ke2RlZmF1bHRDbGFzc2VzLkNIQVJUX0dST1VQfS0ke2p9IC4ke2RlZmF1bHRDbGFzc2VzLkJBUn0tJHtpfWApLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCBcIjFcIilcblxuICAgICAgICAvLyAgICAgICAgICAgICBzZWxmLl9yZW1vdmVUb29sdGlwKCk7XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgLy8gfSBlbHNlIGlmICh0aGlzLmlzU3RhY2tlZCkge1xuICAgICAgICAvLyAgICAgZ3JvdXAgPSB2aXMuc2VsZWN0QWxsKFwiLmdyb3VwXCIpXG4gICAgICAgIC8vICAgICAgICAgLmRhdGEodGhpcy5kYXRhKVxuICAgICAgICAvLyAgICAgICAgIC5lbnRlcigpXG4gICAgICAgIC8vICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICAgICAgLy8gICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZ3JvdXBcIilcbiAgICAgICAgLy8gICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIGQgPT4gdGhpcy5nZXRDb2xvcihkLm5hbWUpKTtcbiAgICAgICAgICAgIGlmIChhbmltYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXJzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpLmR1cmF0aW9uKChNYXRoLnJhbmRvbSgpKjUwMCkgKyAyMDAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLnRyYW5zaXRpb24oKS5kdXJhdGlvbig1MDAgKiBpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGQgPT4geVNjYWxlKE1hdGgubWF4KDAsIGQudmFsdWUpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGQgPT4gTWF0aC5hYnMoeVNjYWxlKDApIC0geVNjYWxlKGQudmFsdWUpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAuZWFjaChcImVuZFwiLCAoKT0+Y29uc29sZS5sb2coXCJGaW4gdHJhbnNpdGlvblwiKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL3RoaXMuX2NyZWF0ZUxlZ2VuZCgpO1xuICAgIH1cblxuICAgIG9uTW91c2VvdmVyKGluZGV4KSB7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5zdmcuc2VsZWN0QWxsKGAuJHtkZWZhdWx0Q2xhc3Nlcy5DSEFSVF9HUk9VUH0uJHtkZWZhdWx0Q2xhc3Nlcy5GT0NVU30tJHtpbmRleH1gKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjUpO1xuICAgIH1cblxuICAgIG9uTW91c2VvdXQoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLnN2Zy5zZWxlY3RBbGwoYC4ke2RlZmF1bHRDbGFzc2VzLkNIQVJUX0dST1VQfS4ke2RlZmF1bHRDbGFzc2VzLkZPQ1VTfS0ke2luZGV4fWApXG4gICAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpO1xuICAgIH1cblxuICAgIF9mb3JtYXREYXRhKGRhdGEpIHtcbiAgICAgICAgdmFyIHhEb21haW4gPSB0aGlzLl9heGVzLnguc2NhbGUoKS5kb21haW4oKTtcbiAgICAgICAgdGhpcy5fY2F0ZWdvcmllcyA9IGRhdGEubWFwKHZhbHVlID0+IHZhbHVlLm5hbWUpO1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IHhEb21haW4ubWFwKGZ1bmN0aW9uIChzZXJpZXMsIGkpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0geyBzZXJpZXMgfTtcblxuICAgICAgICAgICAgaXRlbS52YWx1ZXMgPSBkYXRhLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB2YWx1ZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUudmFsdWVzW2ldLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogdmFsdWUuaW5kZXhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXJDaGFydDtcbiIsIi8qKlxuICogbW9ybmluZ3N0YXItYmFzZS1jaGFydHNcbiAqXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiAuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLnR4dCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5pbXBvcnQgZGVmYXVsdENsYXNzZXMgZnJvbSBcIi4uL2NvbmZpZy9jbGFzc2VzLmpzXCI7XG5pbXBvcnQgQ2hhcnRCYXNlIGZyb20gXCIuL2NoYXJ0QmFzZS5qc1wiO1xuXG5jbGFzcyBCZW5jaG1hcmsgZXh0ZW5kcyBDaGFydEJhc2V7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSA1OyAvL1RPRE86IHBhcmFtZXRyaXplZCBoZWlnaHRcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICAgICAgdGhpcy5keSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTsgLy9UT0RPOiBwYXJhbWV0cml6ZWQgaGVpZ2h0XG4gICAgfVxuXG4gICAgcmVuZGVyKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHlTY2FsZSA9IHRoaXMuX2F4ZXMueS5zY2FsZSgpLFxuICAgICAgICAgICAgeFNjYWxlID0gdGhpcy5fYXhlcy54LnNjYWxlKCksXG4gICAgICAgICAgICB4RG9tYWluID0geFNjYWxlLmRvbWFpbigpLFxuICAgICAgICAgICAgd2lkdGggPSB4U2NhbGUucmFuZ2VCYW5kKCksXG4gICAgICAgICAgICBhbmltYXRpb24gPSAob3B0aW9ucyAmJiAhb3B0aW9ucy5hbmltYXRpb24pID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uID0gdGhpcy5fY2FudmFzLnN2Z1xuICAgICAgICAgICAgLnNlbGVjdChgLiR7ZGVmYXVsdENsYXNzZXMuQ0hBUlRTX0FSRUF9YClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoYC5iZW5jaG1hcmstJHt0aGlzLmluZGV4fWApXG4gICAgICAgICAgICAuZGF0YSh0aGlzLmRhdGEudmFsdWVzKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkLCBpKSA9PiBgYmVuY2htYXJrIGJlbmNobWFyay0ke3RoaXMuaW5kZXh9ICR7ZGVmYXVsdENsYXNzZXMuRk9DVVN9LSR7aX1gKVxuICAgICAgICAgICAgLmF0dHJzKHtcbiAgICAgICAgICAgICAgICBcInhcIjogKGQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHhTY2FsZSh4RG9tYWluW2ldKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwieVwiOiBkID0+IHlTY2FsZShkKSAtIHRoaXMuZHksXG4gICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiBhbmltYXRpb24gPyAwIDogd2lkdGgsXG4gICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgXCJmaWxsXCI6IHRoaXMuX2NvbG9yU2NhbGUodGhpcy5pbmRleClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIGFuaW1hdGlvbiA/IDAgOiAxKTtcblxuICAgICAgICBpZiAoYW5pbWF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnR0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oKS5kdXJhdGlvbigoTWF0aC5yYW5kb20oKSo4MDApICsgNDAwIClcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbCgoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT5cIiwgZCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMudHQgPSAhdGhpcy50dCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdXNlb3ZlciAoaW5kZXgpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy50dCk7XG4gICAgICAgIGlmICh0aGlzLnR0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdGlvbi50cmFuc2l0aW9uKCkuZHVyYXRpb24oMzAwKVxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiZ3JlZW5cIik7XG4gICAgfVxuICAgIG9uTW91c2VvdXQgKGluZGV4KSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLl9jYW52YXMuc3ZnXG4gICAgICAgICAgICAuc2VsZWN0QWxsKGAuYmVuY2htYXJrLiR7ZGVmYXVsdENsYXNzZXMuRk9DVVN9LSR7aW5kZXh9YCk7XG5cbiAgICAgICAgc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbigzMDApXG4gICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgdGhpcy5fY29sb3JTY2FsZSh0aGlzLmluZGV4KSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCZW5jaG1hcms7IiwiLyoqXG4gKiBtb3JuaW5nc3Rhci1iYXNlLWNoYXJ0c1xuICpcbiAqIENvcHlyaWdodCDCqSAyMDE2IC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UudHh0IGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENoYXJ0QmFzZSBmcm9tIFwiLi9jaGFydEJhc2UuanNcIjtcbmltcG9ydCBkZWZhdWx0Q2xhc3NlcyBmcm9tIFwiLi4vY29uZmlnL2NsYXNzZXMuanNcIjtcblxuY2xhc3MgRG90cyBleHRlbmRzIENoYXJ0QmFzZXtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgc3VwZXIocGFyYW1zKTtcbiAgICB9XG5cbiAgICByZW5kZXIob3B0aW9ucykge1xuICAgICAgICB2YXIgeVNjYWxlID0gdGhpcy5fYXhlcy55LnNjYWxlKCksXG4gICAgICAgICAgICB4U2NhbGUgPSB0aGlzLl9heGVzLnguc2NhbGUoKSxcbiAgICAgICAgICAgIHhEb21haW4gPSB4U2NhbGUuZG9tYWluKCksXG4gICAgICAgICAgICB3aWR0aCA9IHhTY2FsZS5yYW5nZUJhbmQoKSxcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLmRhdGEsXG4gICAgICAgICAgICBhbmltYXRpb24gPSAob3B0aW9ucyAmJiAhb3B0aW9ucy5hbmltYXRpb24pID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uID0gdGhpcy5fY2FudmFzLnN2Z1xuICAgICAgICAgICAgLnNlbGVjdChgLiR7ZGVmYXVsdENsYXNzZXMuQ0hBUlRTX0FSRUF9YClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoYC5kb3RzLSR7ZGF0YS5pbmRleH1gKVxuICAgICAgICAgICAgLmRhdGEoZGF0YS52YWx1ZXMpXG4gICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCAoZCwgaSkgPT4gYGRvdHMgZG90cy0ke2RhdGEuaW5kZXh9ICR7ZGVmYXVsdENsYXNzZXMuRk9DVVN9LSR7aX1gKVxuICAgICAgICAgICAgLmF0dHJzKHtcbiAgICAgICAgICAgICAgICBcImN4XCI6IChkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4U2NhbGUoeERvbWFpbltpXSkgKyB3aWR0aCAvIDI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImN5XCI6IGQgPT4geVNjYWxlKGQpLFxuICAgICAgICAgICAgICAgIFwiclwiOiBkID0+IChhbmltYXRpb24gPyAwIDogMC4zICogeVNjYWxlKGQpKSxcbiAgICAgICAgICAgICAgICBcImZpbGxcIjogdGhpcy5fY29sb3JTY2FsZShkYXRhLmluZGV4KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgYW5pbWF0aW9uID8gMCA6IDEpO1xuXG4gICAgICAgIGlmIChhbmltYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oKS5kdXJhdGlvbigoTWF0aC5yYW5kb20oKSo1MDApICsgNDAwIClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIGQgPT4gMC4zICogeVNjYWxlKGQpKVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdXNlb3ZlciAoKSB7XG4gICAgICAgIHZhciByID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiclwiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByMCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkMy5zZWxlY3QodGhpcykuYXR0cihcInJcIikgKiAxLjU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbig1MDApXG4gICAgICAgICAgICAuYXR0cihcIl9yXCIsIHIpXG4gICAgICAgICAgICAuYXR0cihcInJcIiwgcjApXG4gICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCIjMzMzXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDAuNSk7XG4gICAgfVxuXG4gICAgb25Nb3VzZW91dCAoKSB7XG4gICAgICAgIHZhciByID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJfclwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNlbGVjdGlvbi50cmFuc2l0aW9uKCkuZHVyYXRpb24oNTAwKVxuICAgICAgICAgICAgLmF0dHIoXCJyXCIsIHIpXG4gICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAwKVxuICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERvdHM7IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICAgIC8vIGQzIG92ZXJyaWRlc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZDMuc2VsZWN0aW9uLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGQzLnNlbGVjdCh0aGlzWzBdWzBdKTtcbiAgICB9O1xuXG4gICAgZDMuc2VsZWN0aW9uLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFzdCA9IHRoaXMuc2l6ZSgpIC0gMTtcbiAgICAgICAgcmV0dXJuIGQzLnNlbGVjdCh0aGlzWzBdW2xhc3RdKTtcbiAgICB9O1xuICAgIGQzLnNlbGVjdGlvbi5wcm90b3R5cGUuYXR0cnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgZm9yKGxldCBhdHRyIGluIG9iaikge1xuICAgICAgICAgICAgdGhpcy5hdHRyKGF0dHIsIG9ialthdHRyXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvLy0tLS0tLS0tLS0tLS0tLW9Pby0tLS0tLS0tLS0tLS0tLS0tXG59XG4iLCIvKipcbiAqIG1vcm5pbmdzdGFyLWJhc2UtY2hhcnRzXG4gKlxuICogQ29weXJpZ2h0IMKpIDIwMTYgLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS50eHQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQmFyQ2hhcnQgZnJvbSBcIi4vY2hhcnRzL2Jhci5jaGFydC5qc1wiO1xuaW1wb3J0IEF4ZXNUeXBlMSBmcm9tIFwiLi9jaGFydHovYXhlc1R5cGUxLmpzXCI7XG5pbXBvcnQgQmFyIGZyb20gXCIuL2NoYXJ0ei9iYXIuanNcIjtcbmltcG9ydCBCZW5jaG1hcmsgZnJvbSBcIi4vY2hhcnR6L2JlbmNobWFyay5qc1wiO1xuaW1wb3J0IERvdHMgZnJvbSBcIi4vY2hhcnR6L2RvdHMuanNcIjtcbmltcG9ydCBkM19vdmVycmlkZXMgZnJvbSBcIi4vdXRpbHMvZDMub3ZlcnJpZGVzLmpzXCI7XG5cbmQzX292ZXJyaWRlcygpO1xuY29uc3QgdHlwZXMgPSB7XG4gICAgQkFSOiBcImJhclwiLFxuICAgIEJFTkNITUFSSzogXCJiZW5jaG1hcmtcIixcbiAgICBET1RTOiBcImRvdHNcIlxufTtcbmNsYXNzIENoYXJ0RmFjdG9yeSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBkM19vdmVycmlkZXMoKTtcbiAgICB9XG5cbiAgICB0ZXN0IChvcHRpb25zKSB7XG4gICAgICAgIHZhciBjaGFydFR5cGUxID0gbmV3IEF4ZXNUeXBlMSh7XG4gICAgICAgICAgICBjb250YWluZXI6IG9wdGlvbnMuY29udGFpbmVyLFxuICAgICAgICAgICAgZG9tYWluOiBvcHRpb25zLmRhdGEubmFtZXMsXG4gICAgICAgICAgICB0aWNrU2l6ZTogNDAsXG4gICAgICAgICAgICB0aWNrU3BhY2U6IDVcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjbGFzc2lmaWNhdGlvbiA9IHRoaXMuX2NsYXNzaWZ5KG9wdGlvbnMuZGF0YS52YWx1ZXMpO1xuICAgICAgICBjaGFydFR5cGUxLmFkZChCYXIsIHtcbiAgICAgICAgICAgIGRhdGE6IGNsYXNzaWZpY2F0aW9uLmdyb3VwZWRcbiAgICAgICAgfSk7XG4gICAgICAgIGNsYXNzaWZpY2F0aW9uLm5vdF9ncm91cGVkLmZvckVhY2goKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09IHR5cGVzLkJFTkNITUFSSykgeyBjb25zb2xlLmxvZyhcIkJlbmNobWFya1wiKTtcbiAgICAgICAgICAgICAgICBjaGFydFR5cGUxLmFkZChCZW5jaG1hcmssIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gdHlwZXMuRE9UUykgeyBjb25zb2xlLmxvZyhcIkRvdHNcIik7XG4gICAgICAgICAgICAgICAgY2hhcnRUeXBlMS5hZGQoRG90cywge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYmFyQ2hhcnQgKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCYXJDaGFydChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGVzICgpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIF9jbGFzc2lmeSAoZGF0YSl7XG4gICAgICAgIHZhciBjbGFzc2lmaWVkID0ge1xuICAgICAgICAgICAgZ3JvdXBlZDogW10sXG4gICAgICAgICAgICBub3RfZ3JvdXBlZDogW11cbiAgICAgICAgfTtcbiAgICAgICAgZGF0YS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gdHlwZXMuQkFSIHx8IGl0ZW0udHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID0gXCJiYXJcIjtcbiAgICAgICAgICAgICAgICBjbGFzc2lmaWVkLmdyb3VwZWQucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xhc3NpZmllZC5ub3RfZ3JvdXBlZC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsYXNzaWZpZWQ7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0RmFjdG9yeTtcbiJdLCJuYW1lcyI6WyJkZWZhdWx0X2NsYXNzZXMiLCJfYXhlcyIsIl9ldmVudCIsIkJhckNoYXJ0IiwiQmFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7RUFBQTs7Ozs7Ozs7O0FBU0EsZUFBZTtBQUNYLEVBQUEsV0FBTztBQUNILEVBQUEsaUJBQVMsQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQyxTQUFsQyxFQUE2QyxTQUE3QyxFQUF3RCxTQUF4RCxFQUFtRSxTQUFuRSxFQUE4RSxTQUE5RTtBQUROLEVBQUEsS0FESTtBQUlYLEVBQUEsWUFBTyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFO0FBSkksRUFBQSxDQUFmOztFQ1RBLE1BQU0sT0FBTyxLQUFiO0FBQ0EsRUFBQSxNQUFNLFFBQVEsT0FBTyxRQUFyQjs7QUFFQSx1QkFBZTtBQUNYLEVBQUEsVUFBTyxJQUFFLElBQUssUUFESDtBQUVYLEVBQUEsWUFBUyxJQUFFLElBQUssVUFGTDtBQUdYLEVBQUEsWUFBUyxJQUFFLElBQUssVUFITDtBQUlYLEVBQUEsY0FBVyxJQUFFLElBQUssUUFKUDtBQUtYLEVBQUEsZUFBWSxJQUFFLElBQUssU0FMUjtBQU1YLEVBQUEsU0FBSyxPQUFPLE1BTkQ7QUFPWCxFQUFBLGNBQVUsT0FBTyxZQVBOO0FBUVgsRUFBQSxZQUFRLE9BQU8sU0FSSjtBQVNYLEVBQUEsV0FBTyxLQVRJO0FBVVgsRUFBQSxpQkFBYyxJQUFFLEtBQU0sU0FWWDtBQVdYLEVBQUEsZUFBVyxRQUFRLFlBWFI7QUFZWCxFQUFBLFVBQU0sUUFBUSxPQVpIO0FBYVgsRUFBQSxXQUFRLElBQUUsS0FB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
