import Base from "./charts/base.js";
import ChartBase from "./charts/chartBase.js";
import X_Ordinal_Y_Lineal from "./charts/axesType1.js";
import AxesType2 from "./charts/axesType2.js";
import Bar from "./charts/bar.js";
import Benchmark from "./charts/benchmark.js";
import Dots from "./charts/dots.js";
import Horizontal from "./charts/horizontal.js";
import * as Utils from "./utils/utils.js";


const types = {
    BAR: "bar",
    BENCHMARK: "benchmark",
    DOTS: "dots"
};

export default {
    Base: Base,
    ChartBase: ChartBase,
    types: types,
    // Predefined types
    configTypes: {
        X_Ordinal_Y_Lineal: X_Ordinal_Y_Lineal,
        AxesType2: AxesType2
    },
    // Predefined charts
    charts: {
        Bar: Bar,
        Benchmark: Benchmark,
        Dots: Dots,
        Horizontal: Horizontal
    },
    utils: Utils
};
