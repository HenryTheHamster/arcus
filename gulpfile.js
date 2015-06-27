'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var del = require('del');
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');

var paths = {
  js: ['game/**/*.js', '!game/js/gen/**'],
  scss: ['game/**/*.scss'],
  css: ['game/css'],
  tests: ['tests/**/*.js'],
  genjs: './game/js/gen',
  modes: ['./game/js/*.js']
};

var onError = function (error) {
    console.log(error);
    this.emit('end');
    throw error;
};

gulp.task('delete-gen-css', function (cb) {
    del(paths.css, cb);
});
gulp.task('delete-gen-code', function (cb) {
    del(paths.genjs, cb);
});
gulp.task('clean', ['delete-gen-css', 'delete-gen-code']);

gulp.task('test', ['clean'], function () {
    gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('build-code', function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });

    var fs = require('fs');
    fs.mkdir('game/js/gen', function() {
        fs.writeFileSync('game/js/gen/common.min.js', '');
    });

    return gulp.src(paths.modes)
        .pipe(plumber({errorHandler: onError}))
        .pipe(browserified)
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.genjs));
});

gulp.task('build-styles', function() {
    return gulp.src(paths.scss)
        .pipe(plumber({errorHandler: onError}))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(sass({ style: 'expanded', sourcemapPath: 'public/css', bundleExec: true }))
        .pipe(rename({suffix: '.min'}))
        .pipe(flatten())
        .pipe(gulp.dest('game/css'));
});
gulp.task('build', ['build-styles', 'build-code']);

gulp.task('default', ['test', 'build']);
gulp.task('quick', ['clean', 'build']);