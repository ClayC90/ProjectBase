import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

/*
 const babel = require('rollup-plugin-babel');
 const commonjs = require('rollup-plugin-commonjs');
 const eslint = require('rollup-plugin-eslint');
 const resolve = require('rollup-plugin-node-resolve');
 const postcss = require('rollup-plugin-postcss');
 const replace = require('rollup-plugin-replace');
 const uglify = require('rollup-plugin-uglify');

 const simplevars = require('postcss-simple-vars');
 const nested = require('postcss-nested');
 const cssnext = require('postcss-cssnext');
 const cssnano = require('cssnano');
 */

export default {
    entry: 'app/app.js',
    dest: 'dist/js/app.min.js',
    format: 'iife',
    sourceMap: 'inline',
    plugins: [
        postcss({
            plugins: [
                simplevars(),
                nested(),
                cssnext({warnForDuplicates: false,}),
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
            presets: ["es2015-rollup"],
            exclude: 'node_modules/**',
        }),
        commonjs(),
        replace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            ,
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        (process.env.NODE_ENV === 'production' && uglify()),
    ],
}
