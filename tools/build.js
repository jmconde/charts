/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

"use strict";

const fs = require("fs");
const del = require("del");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const pkg = require("../package.json");
const sass = require("node-sass");

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(["dist/*"]));

// Compile source code into a distributable format with Babel
for (const format of ["iife", "es6", "cjs", "umd"]) {
    promise = promise.then(() => rollup.rollup({
        entry: "src/js/api.js",
        external: Object.keys(pkg.dependencies),
        plugins: [babel(Object.assign(pkg.babel, {
            babelrc: false,
            exclude: "node_modules/**",
            runtimeHelpers: true,
            presets: pkg.babel.presets.map(x => (x === "es2015" ? "es2015-rollup" : x))
        }))]
    }).then(bundle => bundle.write({
        dest: `dist/${format === "umd" ? `${pkg.name}` : `${pkg.name}.${format}`}.js`,
        format,
        sourceMap: true,
        moduleName: format === "umd" || format === "iife" ? `${pkg.moduleName}` : undefined
    })));
}

// Compile source code into a distributable format with Babel
promise = promise.then(() => rollup.rollup({
    entry: "src/js/app.js",
    external: [`${pkg.moduleName}`, "topojson"],
    plugins: [babel(Object.assign(pkg.babel, {
        babelrc: false,
        exclude: "node_modules/**",
        runtimeHelpers: true,
        presets: pkg.babel.presets.map(x => (x === "es2015" ? "es2015-rollup" : x))
    }))]
}).then(bundle => bundle.write({
    dest: "demo/app.js",
    format: "umd",
    sourceMap: true,
    globals: {
        "MSBC": "MSBC",
        "topojson": "topojson"
    },
    moduleName: "App"
})));

// Compiling sass styles
promise = promise.then(() => sass.render({
    file: "./src/scss/main.scss",
    outputStyle: "compressed",
    outFile: `./demo/${pkg.name}.css`,
    sourceMap: true
}, function (err, result) {
    if (!err) {
        fs.writeFile(`./dist/${pkg.name}.css`, result.css, function (err) {
            if (!err) {
                console.log("Sass written.");
            }
        });
    }
}));

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
    delete pkg.private;
    delete pkg.devDependencies;
    delete pkg.scripts;
    delete pkg.eslintConfig;
    delete pkg.babel;
    fs.writeFileSync("dist/package.json", JSON.stringify(pkg, null, "  "), "utf-8");
    fs.writeFileSync("dist/LICENSE.txt", fs.readFileSync("LICENSE.txt", "utf-8"), "utf-8");
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
