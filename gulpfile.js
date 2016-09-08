"use strict";

var gulp = require("gulp"),
    connect = require("gulp-connect"),
    del = require("del"),
    jade = require("gulp-jade"),
    sass = require("gulp-sass"),
    runSequence = require("run-sequence"),
    pkg = require("./package.json"),
    rollup = require("gulp-rollup"),
    sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    babel = require("rollup-plugin-babel");

gulp.task("templates", function () {
    var locals = {
        version: pkg.version
    };
    return gulp.src("./src/templates/*.jade")
        .pipe(jade({
            data: locals
        }))
        .pipe(gulp.dest("./demo/"));
});

gulp.task("sass", function () {
    return gulp.src("./src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(rename(pkg.name + ".css"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("sass-demo", function () {
    return gulp.src("./src/scss/demo.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(rename(pkg.name + "-demo.css"))
        .pipe(gulp.dest("./demo"));
});

gulp.task("clean-dist", function () {
    return del(["./dist"]);
});
gulp.task("clean-demo", function () {
    return del(["./demo"]);
});

gulp.task("rollup", function () {
    return gulp.src("./src/js/api.js")
        .pipe(sourcemaps.init())
        .pipe(rollup({
            sourceMap: true,
            allowRealFiles: true,
            plugins: [babel({
                exclude: "node_modules/**"
            })],
            format: "umd",
            dest: "./demo/" + pkg.name + ".js",
            entry: "./src/js/api.js",
            moduleName: pkg.moduleName
        }))
        .pipe(sourcemaps.write())
        .pipe(rename(pkg.name + ".js"))
        .pipe(gulp.dest("./demo/dist"));
});

gulp.task("rollup-demo", function () {
    return gulp.src("./src/js/app.js")
        .pipe(sourcemaps.init())
        .pipe(rollup({
            sourceMap: true,
            allowRealFiles: true,
            plugins: [babel({
                exclude: "node_modules/**"
            })],
            format: "umd",
            dest: "./demo/app.js",
            entry: "./src/js/app.js",
            external: ["MSBC", "topojson"],
            globals: {
                "MSBC": "MSBC",
                "topojson": "topojson"
            },
            moduleName: "App"
        }))
        .pipe(sourcemaps.write())
        .pipe(rename("app.js"))
        .pipe(gulp.dest("./demo"));
});

gulp.task("copy-vendor-css", function () {
    return gulp.src([
        "./node_modules/prismjs/themes/prism.css",
        "./node_modules/c3/c3.css",
        "./bower_components/mui-bootstrap/dist/css/mui.css"
    ]).pipe(gulp.dest("./demo/vendor/css"));
});

gulp.task("copy-vendor-fonts", function () {
    return gulp.src([
        "./bower_components/mui-bootstrap/dist/fonts/*.*"
    ]).pipe(gulp.dest("./demo/vendor/fonts"));
});

gulp.task("copy-data", function () {
    return gulp.src([
        "./src/data/*.*"
    ]).pipe(gulp.dest("./demo/data"));
});

gulp.task("copy-vendor-js", function () {
    return gulp.src([
        "./node_modules/prismjs/prism.js",
        "./node_modules/c3/node_modules/d3/d3.js",
        "./node_modules/c3/c3.js",
        "./node_modules/lodash/lodash.min.js",
        "./bower_components/jquery/dist/jquery.min.js",
        "./bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js"
    ]).pipe(gulp.dest("./demo/vendor/js"));
});

gulp.task("copy-dist", function () {
    return gulp.src([
        "./dist/**/*.*"
    ]).pipe(gulp.dest("./demo/dist"));
});

gulp.task("copy-html", function () {
    return gulp.src([
        "./src/templates/**/*.html"
    ]).pipe(gulp.dest("./demo"));
});

gulp.task("watch", function () {
    gulp.watch("./src/**/*.js", function () {
        runSequence(["rollup", "rollup-demo"]);
    });
    gulp.watch("./src/scss/*.scss", function () {
        runSequence(["sass", "sass-demo"], "copy-dist");
    });
    gulp.watch("./src/templates/**/*.jade", ["templates"]);
    gulp.watch("./src/templates/**/*.html", ["copy-html"]);
});

gulp.task("connect", function () {
    connect.server({
        root: ["./demo"],
        port: 5151
    });
});

gulp.task("build", function () {
    runSequence("clean-dist", ["rollup", "sass"]);
});

gulp.task("demo", function () {
    runSequence(
        // "clean-demo",
        [
            // "rollup-demo",
            "copy-vendor-css",
            "copy-vendor-js",
            "copy-vendor-fonts",
            "copy-dist",
            "copy-data",
            "copy-html",
            "sass-demo",
            "templates"
        ],
        ["watch", "connect"]);
});

gulp.task("default", ["templates"]);
