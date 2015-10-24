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
var fs = require('fs');
var getRepoInfo = require('git-repo-info');

var paths = {
  js: ['game/**/*.js', '!game/js/gen/**'],
  scss: ['game/**/*.scss'],
  css: ['game/css'],
  tests: ['tests/**/*.js'],
  genjs: './game/js/gen',
  build: ['./game/js/gen', 'build/**'],
  modes: ['./build/*.js']
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
    del(paths.build, cb);
});
gulp.task('clean', ['delete-gen-css', 'delete-gen-code']);

gulp.task('test', ['clean'], function () {
    gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('prep', ['clean'], function (cb) {
    fs.mkdir('build', cb);
});

function generateEntrypointFile (mode, done) {
  var filename = ['build/', mode, '.js'].join('');

  var fromFile = fs.createReadStream('node_modules/ensemblejs/default.entrypoint.js');
  var toFile = fs.createWriteStream(filename);

  fromFile.pipe(toFile, { end: false });
  fromFile.on('end', function() {
      toFile.write('\n');
      toFile.write('entryPoint.set("GameMode", "' + mode + '");');
      toFile.write('entryPoint.set("Commit", "' + getRepoInfo().sha + '");');
      toFile.write('\n');
      toFile.end('entryPoint.run();');
      done();
  });
}

gulp.task('copy-single-entry-point', ['prep'], function (cb) {
    fs.exists('game/js/modes.json', function (exists) {
        if (exists) {
            return cb();
        }

        generateEntrypointFile('game', cb);
    });
});

gulp.task('copy-multi-entry-points', ['prep'], function (cb) {
    fs.exists('game/js/modes.json', function (exists) {
        if (!exists) {
            return cb();
        }

        var arr = require('./game/js/modes.json');
        var copyCount = 0;

        function copied () {
            copyCount += 1;
            if (copyCount === arr.length) {
                cb();
            }
        }

        var i;
        for(i = 0; i < arr.length; i += 1) {
            generateEntrypointFile(arr[i], copied);
        }
    });
});

gulp.task('generate-entrypoints', ['copy-multi-entry-points', 'copy-single-entry-point']);

gulp.task('build-code', ['generate-entrypoints'], function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });

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