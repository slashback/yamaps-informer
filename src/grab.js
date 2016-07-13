/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */

"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    //console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};


var page = require('webpage').create();
var fs = require('fs');
var list = fs.list('.');
var system = require('system');
//console.log(system.args[1])
//console.log(fs.absolute('.'))
//console.log(fs.exists("file:///opt/projects/yamaps-informer/src/index_parser.html"))
var url = "http://spacelab44.ru:8085/index_parser.html";
var url2 = "file:///"+system.args[1];
page.open(url2, function (status) {
    // Check for page load success
    if (status !== "success") {
        //console.log("Unable to access network");
    } else {
        // Wait for 'signin-dropdown' to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            return page.evaluate(function() {
                return $("#bor-result").is(":visible") && $("#you-result").is(":visible")  && $("#per-result").is(":visible")  && $("#vol-result").is(":visible");
            });
        }, function() {
           //console.log("The sign-in dialog should be visible now.");
           var bor_val = page.evaluate(function() {
                return $("#bor-result").text();
           });
           var per_val = page.evaluate(function() {
                return $("#per-result").text();
            });
           var vol_val = page.evaluate(function() {
                return $("#vol-result").text();
            });
           var you_val = page.evaluate(function() {
                return $("#you-result").text();
            });
           var res = {
            bor: bor_val,
            per: per_val,
            vol: vol_val,
            you: you_val
           }
           var result = JSON.stringify(res)
           console.log(result);

           phantom.exit();
        });
    }
});
