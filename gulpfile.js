"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var imagemin = require("gulp-imagemin");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgmin = require("gulp-svgmin")
var svgstore = require("gulp-svgstore");
var server = require("browser-sync").create();
var cleanCSS = require('gulp-clean-css');
var gcmq = require('gulp-group-css-media-queries');
var run = require("run-sequence");
var del = require("del");
var fileinclude = require('gulp-file-include');
var uglify = require("uglify-js");
var sourcemaps = require('gulp-sourcemaps')
var stylus = require('gulp-stylus');
var nib = require('nib');
var csscomb = require('gulp-csscomb');
var babel = require('gulp-babel');


gulp.task("style", function () {
  gulp.src("styl/style.styl")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus({
      use: [nib()],
      'include css': true,
      linenos: true
    }))
    .pipe(gcmq())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 2 versions"
        ]
      }),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(csscomb())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("build/css"))
    .pipe(cleanCSS({
      level: 2
    }))

    // .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy", ["html:copy"], function () {
  return gulp.src([
    "fonts/**/*",
    "img/**",
    "js/**",
    "video/*"

  ], {
    base: "."
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("symbols", function () {
  return gulp.src("build/img/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html:copy", function () {
  return gulp.src("[^_]*.html")
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function (done) {
  server.reload();
  done();
});


gulp.task('js', function () {
  return gulp.src('js/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())

    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(babel({
      presets: ['env']
    }))
    //  .pipe(modernizr())
    // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());
});


gulp.task("serve", function () {
  server.init({
    server: "./build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("styl/**/*.styl", ["style"]);
  gulp.watch("styl/**/*.css", ["style"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch("js/*.js", ["js"]);

});

gulp.task("build", function (fn) {
  run(
    "clean",
    "copy",
    "style",
    "symbols",
    "images",
    "js",
    fn
  );
});


 

 


