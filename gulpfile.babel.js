/** @see https://css-tricks.com/gulp-for-beginners/ */

//import autoprefixer from 'gulp-autoprefixer';
//import sourcemaps from 'gulp-sourcemaps';
import gulp from 'gulp';
import cache from 'gulp-cache';
import concat from 'gulp-concat';
import gulpCssnano from 'gulp-cssnano';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import useref from 'gulp-useref';
import util from 'gulp-util';

import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

import browserSync from 'browser-sync';
import del from 'del';
import runSequence from 'run-sequence';

/*
 const gulp = require('gulp');
 //const autoprefixer = require('gulp-autoprefixer');
 const cache = require('gulp-cache');
 const concat = require('gulp-concat');
 //const cssnano = require('gulp-cssnano');
 const gulpIf = require('gulp-if');
 const imagemin = require('gulp-imagemin');
 const sass = require('gulp-sass');
 // const sourcemaps = require('gulp-sourcemaps');
 const uglify = require('gulp-uglify');
 const useref = require('gulp-useref');

 const rollup = require('rollup');
 const babel = require('rollup-plugin-babel');
 const commonjs = require('rollup-plugin-commonjs');
 const eslint = require('rollup-plugin-eslint');
 const inject = require('rollup-plugin-inject');
 const json = require('rollup-plugin-json');
 const postcss = require('rollup-plugin-postcss');
 const replace = require('rollup-plugin-replace');
 const resolve = require('rollup-plugin-node-resolve');

 const simplevars = require('postcss-simple-vars');
 const nested = require('postcss-nested');
 const cssnext = require('postcss-cssnext');
 const cssnano = require('cssnano');

 const browserSync = require('browser-sync');
 const del = require('del');
 const runSequence = require('run-sequence');

 const debug = require('debug');
 const log = debug('app:log');
 const rollupConfig = require('./rollup.config');
 debug.enable('*');
 log(rollupConfig);
 */


const server = browserSync.create('Development');


const srcDir = 'app/';
const destDir = 'dist/';
const paths = {
    js: {
        src: srcDir + 'app.js',
        dest: destDir + 'js/app.min.js',
    },
    css: {
        src: srcDir + 'scss/**/*.scss',
        dest: destDir + 'css/',
    },
    html: {
        src: srcDir + '**/*.html',
        dest: destDir + '',
    },
    images: {
        src: srcDir + 'images/**/*.{png,jpg,jpeg,gif,svg}',
        dest: destDir + 'images',
    },
    fonts: {
        src: srcDir + 'fonts/**/*',
        dest: destDir + 'fonts',
    },
};


/** Cleanup */

gulp.task('clean:dist', function () {
    return del.sync('dist');
});

gulp.task('clean:cache', function (done) {
    return cache.clearAll(done);
});

gulp.task('clean:all', function (done) {
    runSequence(
        'clean:dist',
        'clean:cache',
        done
    )
});


/** Building, bundling, compiling, minifying, optimising of resources */

gulp.task('build:js', function () {
    return rollup({
        entry: paths.js.src,
        plugins: [
            postcss({
                plugins: [
                    simplevars(),
                    nested(),
                    cssnext({warnForDuplicates: false}),
                    cssnano(),
                ],
                extensions: ['.pcss'],
            }),
            eslint({
                exclude: [
                    'app/scss/**',
                    'app/pcss/**',
                ]
            }),
            babel({
                babelrc: false,
                presets: ['es2015-rollup'],
                exclude: 'node_modules/**',
                externalHelpers: false,
            }),
            commonjs(), // Ended up having to use this to circumvent issues with including jQuery
            json(),
            replace({
                exclude: 'node_modules/**',
                ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
            }),
            resolve({
                jsnext: true,
                main: true,
                browser: true,
            }),
            (process.env.NODE_ENV === 'production' && uglify()),
        ],
    }).then(function (bundle) {
        bundle.write({
            moduleName: 'app',
            dest: paths.js.dest,
            format: 'iife',
            sourceMap: 'inline',
        });
    });
});

// TODO Use this for Sass, or use Rollup with PostCSS instead?
gulp.task('build:css', function () {
    return gulp.src(paths.css.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(paths.css.dest));
});

gulp.task('build:html', function () {
    return gulp.src(paths.html.src)
        .pipe(useref())
        .pipe(util.env.env === 'production' ? gulpIf('*.js', uglify()) : util.noop())
        .pipe(util.env.env === 'production' ? gulpIf('*.css', gulpCssnano()) : util.noop())
        .pipe(gulp.dest(paths.html.dest));
});

gulp.task('build:images', function () {
    return gulp.src(paths.images.src)
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest(paths.images.dest))
});

gulp.task('build:fonts', function () {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))
});


/** BrowserSync */

gulp.task('serve', function (done) {
    server.init({
        server: destDir,
        startPath: '',
        logLevel: 'silent',
    });
    done();
});

gulp.task('reload', function (done) {
    if (server.active)
        server.reload();
    done();
});

gulp.task('watch', function (done) {
    gulp.watch(paths.js.src, function () {
        runSequence('build:js', 'reload');
    });
    gulp.watch(paths.css.src, function () {
        runSequence('build:css', 'reload');
    });
    gulp.watch(paths.html.src, function () {
        runSequence('build:html', 'reload');
    });
    // TODO: Relevant?
    gulp.watch(paths.images.src, function () {
        runSequence('build:images', 'reload');
    });
    // TODO: Relevant?
    gulp.watch(paths.fonts.src, function () {
        runSequence('build:fonts', 'reload');
    });
    done();
});


/** API Composed Tasks */

gulp.task('build:clean', function () {
    runSequence(
        'clean:all',
        'build',
        done
    );
});

gulp.task('build', function (done) {
    runSequence(
        'clean:dist',
        ['build:js', 'build:css'],
        ['build:html', 'build:images', 'build:fonts'],
        done
    )
});

gulp.task('live', function (done) {
    runSequence(
        ['build', 'watch'],
        'serve',
        done
    )
});
