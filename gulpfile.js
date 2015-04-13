'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var del = require('del');
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');
var exec = require('child_process').exec;

var paths = {
  js: ['game/**/*.js', '!game/js/gen/**'],
  scss: ['game/**/*.scss', 'plugins/**/src/scss/*.scss'],
  css: ['game/css', 'plugins/**/public/*.css'],
  tests: ['tests/**/*.js'],
  genjs: './game/js/gen',
  modes: ['./game/js/*.js', '!./game/js/modes.js']
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

gulp.task('test', ['clean'], function (cb) {
    gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}))
        .on('end', cb);
});

gulp.task('build-code', function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });

    return gulp.src(paths.modes)
        .pipe(plumber({errorHandler: onError}))
        .pipe(browserified)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.genjs));
});
gulp.task('build-code-fast', function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });

    return gulp.src(paths.modes)
        .pipe(plumber({errorHandler: onError}))
        .pipe(browserified)
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
        .pipe(minifycss())
        .pipe(flatten())
        .pipe(gulp.dest('game/css'));
});
gulp.task('build', ['build-styles', 'build-code']);
gulp.task('build-fast', ['build-styles', 'build-code-fast']);

gulp.task('start-server', function (cb) {
    exec('start ' + process.cwd() + '/game', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('default', ['test', 'build']);
gulp.task('local', ['build-fast', 'start-server']);