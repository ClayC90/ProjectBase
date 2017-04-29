// Import styles (automatically injected into <head>)
import './pcss/main.pcss';

// Import a couple modules for testing
import {sayHelloTo} from './modules/greet';
import addArray from './modules/add-array';

import $ from 'jquery';

// Import a logger for easier debugging
import debug from 'debug';

// The logger should only be enabled if we’re not in production
if (ENV !== 'production') {

    // Enable the logger
    const log = debug('app');
    log('Logging is enabled!');

    // Enable LiveReload
    // document.write(
    //     '<script src="http://' + (location.host || 'localhost').split(':')[0] +
    //     ':35729/livereload.js?snipver=1"></' + 'script>'
    // );
} else {
    debug.disable();
}

$(function () {
    // Run some functions from our imported modules
    const result1 = sayHelloTo('Jason');
    const result2 = addArray([1, 2, 3, 4]);

    // Print the results on the page
    const printTarget = document.getElementsByClassName('debug__output')[0];

    printTarget.innerText = `sayHelloTo('Jason') => ${result1}\n\n`;
    printTarget.innerText += `addArray([1, 2, 3, 4]) => ${result2}`;

    console.log('jQuery', $, $('.debug__output'));
});
