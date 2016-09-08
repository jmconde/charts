(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('MSBC'), require('topojson')) :
  typeof define === 'function' && define.amd ? define(['MSBC', 'topojson'], factory) :
  (global.App = factory(global.MSBC,global.topojson));
}(this, function (MSBC,topojson) { 'use strict';

  MSBC = 'default' in MSBC ? MSBC['default'] : MSBC;
  topojson = 'default' in topojson ? topojson['default'] : topojson;

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
          for (var attr in obj) {
              this.attr(attr, obj[attr]);
          }
          return this;
      };
      //---------------oOo-----------------
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var instance = void 0;

  var types = {
      BAR: "bar",
      BENCHMARK: "benchmark",
      DOTS: "dots"
  };

  var ChartsFactory = function () {
      function ChartsFactory() {
          classCallCheck(this, ChartsFactory);

          if (!instance) {
              d3_overrides();
          }
          this.time = new Date();
          return this;
      }

      createClass(ChartsFactory, [{
          key: "barChart",
          value: function barChart(options) {
              var chartType1 = new MSBC.configTypes.X_Ordinal_Y_Lineal({
                  container: options.container,
                  domain: options.data.names,
                  isGrouped: false,
                  tickSize: 40,
                  tickSpace: 5
              });
              var classification = this._classify(options.data.values);
              chartType1.add(MSBC.charts.Bar, {
                  data: classification.grouped,
                  type: types.BAR
              });
              classification.not_grouped.forEach(function (data) {
                  if (data.type === types.BENCHMARK) {
                      chartType1.add(MSBC.charts.Benchmark, {
                          data: data,
                          type: types.BENCHMARK
                      });
                  } else if (data.type === types.DOTS) {
                      chartType1.add(MSBC.charts.Dots, {
                          data: data,
                          type: types.DOTS
                      });
                  }
              });
              return chartType1;
          }
      }, {
          key: "horizontalBarChart",
          value: function horizontalBarChart(options) {
              var chartType2 = new MSBC.configTypes.AxesType2({
                  container: options.container,
                  domain: options.data.names,
                  data: options.data.values[0].values,
                  tickSize: 5,
                  tickSpace: 5
              });
              var classification = this._classify(options.data.values);
              chartType2.add(MSBC.charts.Horizontal, {
                  data: classification.grouped
              });

              return chartType2;
          }
      }, {
          key: "_classify",
          value: function _classify(data) {
              var classified = {
                  grouped: [],
                  not_grouped: []
              };
              data.forEach(function (item) {
                  if (item.type === types.BAR || item.type === undefined) {
                      item.type = "bar";
                      classified.grouped.push(item);
                  } else {
                      classified.not_grouped.push(item);
                  }
              });
              return classified;
          }
      }, {
          key: "donut",
          value: function donut(options) {
              var type = new NoAxesCanvas(options);
              type.add(DonutChart, {
                  data: options.data,
                  initData: options.initData
              });
          }
      }, {
          key: "map",
          value: function map(options) {
              d3.json("data/world-110m2.json", function (error, topology) {
                  var type = new NoAxesCanvas(options);
                  type.add(Map, {
                      data: topology
                  });
              });
          }
      }], [{
          key: "types",
          get: function get() {
              return types;
          }
      }]);
      return ChartsFactory;
  }();

  var NoAxesCanvas = function (_MSBC$Base) {
      inherits(NoAxesCanvas, _MSBC$Base);

      function NoAxesCanvas(params) {
          classCallCheck(this, NoAxesCanvas);

          var _this = possibleConstructorReturn(this, Object.getPrototypeOf(NoAxesCanvas).call(this, params));

          _this.init({
              container: params.container,
              event: _this.event,
              axes: _this.axes,
              margins: _this.margins,
              className: _this.className
          });
          return _this;
      }

      createClass(NoAxesCanvas, [{
          key: "_afterAxisRendered",
          value: function _afterAxisRendered() {}
      }, {
          key: "_setAxes",
          value: function _setAxes() {}
      }, {
          key: "_updateAxes",
          value: function _updateAxes() {
              return Promise.resolve();
          }
      }]);
      return NoAxesCanvas;
  }(MSBC.Base);

  var Map = function (_MSBC$ChartBase) {
      inherits(Map, _MSBC$ChartBase);

      function Map(params) {
          classCallCheck(this, Map);
          return possibleConstructorReturn(this, Object.getPrototypeOf(Map).call(this, params));
      }

      createClass(Map, [{
          key: "render",
          value: function render(options) {
              var dimensions = this.canvas.dimensions,
                  width = dimensions.width,
                  height = dimensions.height,
                  topology = this.data,
                  vis = this.canvas.svg.select(".mbc-charts-area").append("g").classed("custom-map", true),
                  projection,
                  path,
                  d;

              console.log(topology);
              d = width > height ? height : width;

              projection = d3.geo.mercator().scale((d - 3) / (2 * Math.PI)).translate([width / 2, height / 2]);

              path = d3.geo.path().projection(projection);

              var topo = topojson.object(topology, topology.objects.countries);

              vis.selectAll("path").data(topo.geometries).enter().append("path").attr("d", path).attr("stroke", "#333").attr("fill", "#ddd").on("mouseover", function (d) {
                  console.log(d), this;
                  d3.select(this).transition().duration(100).attr("fill", "#ff0000");
              }).on("mouseout", function (d) {
                  console.log(d), this;
                  d3.select(this).transition().duration(100).attr("fill", "#ddd");
              });
          }
      }]);
      return Map;
  }(MSBC.ChartBase);

  var DonutChart = function (_MSBC$ChartBase2) {
      inherits(DonutChart, _MSBC$ChartBase2);

      function DonutChart(params) {
          classCallCheck(this, DonutChart);

          var _this3 = possibleConstructorReturn(this, Object.getPrototypeOf(DonutChart).call(this, params));

          _this3.initData = params.options.initData;
          _this3.innerRadius = params.options.innerRadius || 50;
          _this3.formatData();
          return _this3;
      }

      createClass(DonutChart, [{
          key: "formatData",
          value: function formatData() {
              var _this4 = this;

              this.data = this.data.categories.map(function (category, i) {
                  var obj = {
                      category: category,
                      enabled: true
                  };

                  _this4.data.values.forEach(function (value) {
                      obj[value.name] = value.values[i];
                  });
                  return obj;
              });
          }
      }, {
          key: "render",
          value: function render(options) {
              var _this5 = this;

              var dimensions = this.canvas.dimensions,
                  width = dimensions.width,
                  height = dimensions.height,
                  radius = Math.min(width, height) / 2;

              var arc = d3.svg.arc().outerRadius(radius).innerRadius(radius - this.innerRadius);

              var pie = d3.layout.pie().sort(null).value(function (d) {
                  return d[_this5.initData];
              });

              var vis = this.canvas.svg.select(".mbc-charts-area").append("g").classed("donut", true).attr("width", width).attr("height", height);

              vis.append("g").classed("title", true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").append("text").attr("text-anchor", "middle").style("stroke", "#333").style("stroke-width", 2).style("font-size", 20).style("opacity", 1).text(this.initData);

              var chart = vis.append("g").classed("donut-chart", true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

              chart = chart.selectAll(".arc").data(pie(this.data)).enter().append("g").classed("arc", true);

              var path = chart.append("path").attr("d", arc).style("fill", function (d, i) {
                  return _this5.colorScale(i);
              }).attr("class", function (d, i) {
                  return "arc-" + i;
              }).each(function (d) {
                  this._current = d;
              });

              var legendRectSize = 18;
              var legendSpacing = 8;

              var legends = vis.append("g").classed("legends", true).attr("transform", "translate(" + (width / 2 + radius + 30) + "," + 20 + ")");

              var legend = legends.selectAll(".legend").data(this.data).enter().append("g").classed("legend", true).attr("transform", function (d, i) {
                  return "translate(0, " + i * (legendRectSize + legendSpacing) + ")";
              });

              var uglySelf = this;
              legend.append("rect").attr("width", legendRectSize).attr("height", legendRectSize).style("fill", function (d, i) {
                  return _this5.colorScale(i);
              }).style("stroke", function (d, i) {
                  return _this5.colorScale(i);
              }).on("click", function (label) {
                  var rect = d3.select(this);
                  var enabled = true;
                  var totalEnabled = d3.sum(uglySelf.data.map(function (d) {
                      return d.enabled ? 1 : 0;
                  }));

                  if (rect.classed("disabled")) {
                      rect.classed("disabled", false);
                  } else {
                      if (totalEnabled < 2) {
                          return;
                      }
                      rect.classed("disabled", true);
                      enabled = false;
                  }
                  pie.value(function (d) {
                      if (d.category === label.category) {
                          d.enabled = enabled;
                      }
                      return d.enabled ? d[uglySelf.initData] : 0;
                  });

                  animate.call(uglySelf);
              });

              legend.append("text").attr("x", legendRectSize + legendSpacing).attr("y", legendRectSize).text(function (d) {
                  return d.category;
              });

              function animate() {
                  path = path.data(pie(this.data));

                  path.transition().duration(750).attrTween("d", function (d) {
                      var interpolate = d3.interpolate(this._current, d);
                      this._current = interpolate(0);
                      return function (t) {
                          return arc(interpolate(t));
                      };
                  });
              }
          }
      }]);
      return DonutChart;
  }(MSBC.ChartBase);

  return ChartsFactory;

}));
//# sourceMappingURL=app.js.map